# 🐛 오류 및 버그 개선 작업 명세서

본 문서는 대시보드 프로젝트의 기존 오류 및 미흡했던 부분을 수정하기 위한 작업 지시서입니다.
작업 시 아래의 항목들을 순차적으로 진행해 주세요.

## 1. 러닝 거리 계산 로직 수정
- **대상 파일**: `src/components/sections/home/RunningChart.jsx`
- **문제점**: `formatDistance` 함수에서 입력된 미터(m) 단위 거리를 km로 환산할 때 `(Number(m) / 100)`으로 계산하여 5000 입력 시 50.00km로 표기되는 오류.
- **수정 목표**: `(Number(m) / 1000)`으로 수정하여 올바른 km 단위로 환산되도록 변경.

## 2. 러닝 차트 숫자 자간(Spacing) 디자인 보완
- **대상 파일**: `src/components/sections/home/RunningChart.jsx`
- **문제점**: 5자리 거리가 윗줄의 시간 텍스트보다 너비가 좁아 시각적 균형이 맞지 않음 (기존 리팩토링 누락건).
- **수정 목표**: 거리 표시를 담당하는 `div` 엘리먼트에 `style={{ letterSpacing: "1.5px" }}` 등 자간을 늘려주는 CSS 속성 추가.

## 3. 전역 스와이프와 내부 요소 스크롤 충돌 방지
- **대상 파일**: `src/App.jsx` 및 스크롤/모달 컴포넌트
- **문제점**: `<main>` 태그에 걸려있는 탭 스와이프 이벤트(`onTouchStart`, `onTouchMove`, `onTouchEnd`)의 민감도(75px)로 인해 내부 리스트나 모달을 스크롤할 때 의도치 않게 탭이 넘어가는 현상 발생.
- **수정 목표**: 내부 컴포넌트(예: 가계부 목록, 타임로그 모달 등)의 터치 이벤트에 `e.stopPropagation()` 처리를 하거나, `App.jsx`의 스와이프 감지 로직을 수직 스크롤(`Math.abs(deltaY) > Math.abs(deltaX)`) 시에는 무시하도록 개선.

## 4. Supabase 오프라인/동기화 실패 시 로컬 롤백 로직
- **대상 파일**: `src/hooks/useSupabaseStore.js`
- **문제점**: `supSetState` 함수에서 로컬 상태(`setState`)를 먼저 변경한 뒤 비동기로 Supabase에 전송하는데, 전송 실패 시 경고창만 뜨고 로컬 화면은 이미 변경된 상태로 남게 되어 데이터 정합성이 깨짐.
- **수정 목표**: `catch` 블록 내에서 `setState(prevState)` 코드를 추가하여, 실패 시 사용자의 화면을 저장 실패 전의 기존 상태로 되돌리는(Rollback) 방어 로직 구현.
