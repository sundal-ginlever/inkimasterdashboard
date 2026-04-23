# 나의 개인 대시보드

React + Tailwind 기반 개인 대시보드 앱입니다.

## 로컬 실행

```bash
npm install
npm start
```

## Vercel 배포 (권장 · 무료)

### 방법 1 — CLI (가장 빠름)

```bash
# 1. Node.js 설치 확인
node -v   # v18 이상 권장

# 2. 의존성 설치
npm install

# 3. Vercel CLI 설치 (최초 1회)
npm install -g vercel

# 4. 로그인 (GitHub 계정 연동 가능)
vercel login

# 5. 배포
vercel --prod
```

> 배포 완료 시 `https://your-project.vercel.app` 형태의 URL이 발급됩니다.

### 방법 2 — GitHub 연동 자동 배포

1. 이 폴더를 GitHub 레포지토리로 push
2. https://vercel.com 접속 → "New Project" → GitHub 레포 선택
3. Framework: **Create React App** 자동 감지
4. "Deploy" 클릭 → 완료

### 방법 3 — Netlify

```bash
npm run build
npx netlify-cli deploy --dir=build --prod
```

## 데이터 저장

- 브라우저 `localStorage`에 자동 저장
- 새로고침해도 유지
- 키: `dash_exercise`, `dash_todos`, `dash_assets`, `dash_books`, `dash_memos`
