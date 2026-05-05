# 🚀 추가 개선 및 신규 피처 개발 명세서

본 문서는 대시보드 프로젝트의 아키텍처 개선 및 신규 기능 확장을 위한 작업 지시서입니다.
작업 시 아래의 항목들을 순차적 혹은 독립적으로 진행해 주세요.

## 1. RecordTab 역할 축소 및 UI/UX 정리
- **대상 파일**: `src/components/sections/RecordTab.jsx`
- **목표**: 현재 가계부, 자산, 독서 등은 각자의 탭 내부에서 입력 및 수정이 가능해졌습니다. 중복된 UX를 해결하기 위해 `RecordTab`에서는 무거운 데이터(자산, 가계부 등) 추가 UI를 삭제하고, 빠르고 가벼운 기능인 **'메모'**와 **'오늘의 할 일'**, **'즐겨찾기'** 전용 탭으로 역할을 축소 및 통합합니다.

## 2. 상태 관리 구조 개선 (Prop Drilling 해결)
- **대상 파일**: `src/App.jsx` 등 전역
- **목표**: `App.jsx`에 집중된 15개 이상의 상태(`todos`, `assets`, `timelogs` 등)를 하위 컴포넌트로 계속 전달하는 방식을 개선합니다.
- **방향성**: `Zustand`와 같은 가벼운 전역 상태 관리 라이브러리를 설치하거나, React `Context API`를 도입하여 `App.jsx`를 가볍게 만들고 하위 컴포넌트에서 필요한 데이터만 직접 구독할 수 있도록 구조를 개편합니다.

## 3. PWA (Progressive Web App) 도입
- **대상 파일**: `public/manifest.json`, `public/service-worker.js`, `public/index.html`
- **목표**: 개인 대시보드를 스마트폰 바탕화면에 앱처럼 설치할 수 있게 만듭니다.
- **방향성**: 모바일 친화적인 아이콘 에셋 등록, `manifest.json` 설정, 서비스 워커 등록을 통해 오프라인 캐싱 및 독립된 화면 구동(Standalone)을 지원합니다.

## 4. 다크 모드 (Dark Theme) 시스템 구축
- **대상 파일**: `src/App.css`, `src/App.jsx`, 상단 헤더 컴포넌트
- **목표**: 야간 사용 시 눈을 보호하기 위한 다크 모드 테마 적용 기능 추가.
- **방향성**: `App.css` 내 CSS 변수(`--bg`, `--card`, `--txt` 등)를 활용하여 `.dark` 클래스에 대한 반전 팔레트를 구성하고, UI 상단(헤더)에 해/달 아이콘 형태의 테마 토글 버튼을 배치합니다. 설정값은 `localStorage`에 저장하여 유지합니다.

## 5. 데이터 시각화 차트 라이브러리 도입
- **대상 파일**: `src/components/sections/AssetsSection.jsx`
- **목표**: 숫자로만 표시되는 가계부와 자산 현황을 직관적인 차트로 보여줍니다.
- **방향성**: `Recharts` 또는 `Chart.js` 패키지를 설치하여, 가계부 대시보드에는 이번 달 '수입/지출 파이 차트', 자산 대시보드에는 '자산군별 비율 차트'를 랜더링하는 컴포넌트를 개발합니다.

## 6. Supabase Realtime 실시간 동기화
- **대상 파일**: `src/hooks/useSupabaseStore.js`
- **목표**: 여러 기기(PC, 폰)에서 동시에 접속했을 때 다른 기기에서 수정한 내용이 새로고침 없이 즉시 반영되도록 합니다.
- **방향성**: `supabase.channel('public:...').on('postgres_changes', ...).subscribe()` 메서드를 활용하여, 테이블에 INSERT/UPDATE/DELETE 이벤트 발생 시 로컬 상태(`setState`)를 실시간으로 갱신하는 옵저버 로직을 추가합니다.
