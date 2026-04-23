import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('회원가입 확인 메일을 보냈습니다. 이메일을 확인해 주세요!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center' }}>
          <div className="auth-title">Dashboard ✦</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.1em', marginTop: '4px' }}>PERSONAL WORKSPACE</div>
        </div>

        <div className="auth-social">
          <button className="auth-btn-google" onClick={handleGoogleLogin} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.85 2.21c1.67-1.53 2.63-3.79 2.63-6.56z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.85-2.21c-.79.53-1.8.85-3.11.85-2.39 0-4.41-1.61-5.14-3.77L1.03 13.4C2.54 16.13 5.53 18 9 18z"/>
              <path fill="#FBBC05" d="M3.86 10.69c-.19-.57-.3-1.17-.3-1.79s.11-1.22.3-1.79l-2.84-2.2c-.61 1.28-.96 2.71-.96 4.2s.35 2.92.96 4.19l2.84-2.2z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0 5.53 0 2.54 1.87 1.03 4.6l2.84 2.2c.73-2.16 2.75-3.77 5.14-3.77z"/>
            </svg>
            Google로 계속하기
          </button>
        </div>

        <div className="auth-divider">또는 이메일로 접속</div>

        <form className="auth-form" onSubmit={handleEmailAuth}>
          <input 
            className="inp" 
            type="email" 
            placeholder="이메일 주소" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
          <input 
            className="inp" 
            type="password" 
            placeholder="비밀번호" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          {error && <div className="auth-error">{error}</div>}
          <button className="btn-prim" type="submit" disabled={loading} style={{ padding: '12px' }}>
            {loading ? '처리 중...' : (isSignUp ? '회원가입' : '로그인')}
          </button>
        </form>

        <div className="auth-footer">
          {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
          <span className="auth-link" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? '로그인하기' : '회원가입하기'}
          </span>
        </div>
      </div>
    </div>
  );
}
