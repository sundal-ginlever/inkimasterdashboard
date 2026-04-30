import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Custom hook to sync state with a Supabase table.
 */
export function useSupabaseStore(table, defaultValue, user) {
  const [state, setState] = useState(defaultValue);
  const [loading, setLoading] = useState(true);
  const isObject = !Array.isArray(defaultValue);
  
  // Track if we've successfully loaded from DB to prevent reverting to defaults
  const hasLoaded = useRef(false);
  
  // Track the latest state without causing useCallback to re-create
  const stateRef = useRef(state);
  stateRef.current = state;

  // Fetch initial data
  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        
        hasLoaded.current = true;
        
        if (data && data.length > 0) {
          if (isObject) {
            const obj = {};
            data.forEach(row => {
              const { id, user_id, date, created_at, ...rest } = row;
              const val = table === 'diary' 
                ? rest.content 
                : (rest.data !== undefined ? rest.data : rest);
              obj[date] = val;
            });
            setState(obj);
          } else {
            // For arrays, we might want to sort by created_at or id
            const sorted = [...data].sort((a, b) => (a.id || 0) - (b.id || 0));
            setState(sorted);
          }
        } else {
          // IMPORTANT: If DB is empty, set to [] or {} instead of defaultValue 
          // but only if this is NOT the very first time the user is logging in.
          // For simplicity, we assume if we fetched 0 rows, the state should be empty.
          setState(isObject ? {} : []);
        }
      } catch (err) {
        console.error(`Error fetching ${table}:`, err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [table, user, isObject]); // Remove defaultValue from deps to avoid re-triggering incorrectly

  // Special setter that handles Supabase operations
  const supSetState = useCallback(async (val) => {
    if (!user || !hasLoaded.current) return;

    const prevState = stateRef.current;
    const nextState = typeof val === 'function' ? val(prevState) : val;
    
    // Always update local state first for responsiveness
    setState(nextState);

    try {
      if (isObject) {
        // 1. Detect Updated or New keys
        const changedDates = Object.keys(nextState).filter(d => 
          JSON.stringify(nextState[d]) !== JSON.stringify(prevState[d])
        );
        
        for (const changedDate of changedDates) {
          const dataToStore = nextState[changedDate];
          if (dataToStore === undefined) continue; // Skip deletions, handled below

          let payload;
          if (table === 'run_logs') {
            payload = {
              user_id: user.id,
              date: changedDate,
              time: dataToStore.time,
              distance: dataToStore.distance,
              image: dataToStore.image
            };
          } else if (table === 'diary') {
            payload = {
              user_id: user.id,
              date: changedDate,
              content: dataToStore
            };
          } else if (table === 'timelogs') {
            payload = {
              user_id: user.id,
              date: changedDate,
              data: dataToStore
            };
          } else {
            payload = typeof dataToStore === 'object' && !Array.isArray(dataToStore) 
              ? { ...dataToStore, user_id: user.id, date: changedDate }
              : { data: dataToStore, user_id: user.id, date: changedDate };
          }

          const { error } = await supabase.from(table).upsert(payload, { onConflict: 'user_id,date' });
          if (error) throw error;
        } 
        
        // 2. Detect Deleted keys
        const deletedDates = Object.keys(prevState).filter(d => nextState[d] === undefined);
        for (const deletedDate of deletedDates) {
          const { error } = await supabase.from(table).delete().eq('user_id', user.id).eq('date', deletedDate);
          if (error) throw error;
        }
      } else {
        // Array Handling logic
        // 1. Deletions
        const deletedItems = prevState.filter(item => !nextState.some(n => n.id === item.id));
        for (const deletedItem of deletedItems) {
          if (deletedItem && deletedItem.id) {
            const { error } = await supabase.from(table).delete().eq('id', deletedItem.id).eq('user_id', user.id);
            if (error) throw error;
          }
        }
        
        // 2. Additions
        const newItems = nextState.filter(item => !prevState.some(p => p.id === item.id));
        for (const newItem of newItems) {
          const { id: tempId, ...itemData } = newItem;
          const isTempId = typeof tempId === 'string' || tempId > 1000000000000;
          
          const { data, error } = await supabase.from(table).insert({
            ...itemData,
            user_id: user.id,
            id: isTempId ? undefined : tempId
          }).select();
          
          if (error) throw error;
          
          if (data && data[0]) {
            setState(p => {
              const updated = [...p];
              const idx = updated.findIndex(i => i.id === tempId);
              if (idx !== -1) updated[idx] = { ...updated[idx], id: data[0].id };
              return updated;
            });
          }
        }

        // 3. Updates
        const updatedItems = nextState.filter(n => {
          const prev = prevState.find(p => p.id === n.id);
          return prev && JSON.stringify(n) !== JSON.stringify(prev);
        });
        for (const updatedItem of updatedItems) {
          if (updatedItem && updatedItem.id) {
            const { user_id, id, ...updateData } = updatedItem;
            const { error } = await supabase.from(table).update(updateData).eq('id', id).eq('user_id', user.id);
            if (error) throw error;
          }
        }
      }
    } catch (err) {
      console.error(`Failed to sync ${table} with Supabase:`, err);
      alert(`데이터 저장 실패 (${table}): ${err.message}\n${err.code === '413' ? '이미지 용량이 너무 큽니다.' : ''}`);
    }
  }, [table, user, isObject]);

  return [state, supSetState, loading];
}
