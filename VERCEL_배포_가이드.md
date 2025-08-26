# Vercel 프로덕션 배포 설정 가이드

## 📌 개요
main 브랜치에 코드를 푸시할 때 Vercel이 자동으로 프로덕션 모드로 배포되도록 설정하는 가이드입니다.

## 🔧 이미 생성된 설정 파일

### 1. vercel.json 파일
프로덕션 모드를 강제하기 위해 다음 설정이 포함된 `vercel.json` 파일이 생성되었습니다:
- NODE_ENV를 "production"으로 설정
- 프로덕션 빌드 명령어 사용 (`npm run build:production`)
- Next.js 프레임워크 설정

## 📝 Vercel 대시보드 설정 방법

### 1단계: Vercel 로그인
1. https://vercel.com 접속
2. GitHub 계정으로 로그인
3. 프로젝트 선택 (off-base-admin)

### 2단계: 환경 변수 설정
1. 프로젝트 대시보드에서 `Settings` 탭 클릭
2. 왼쪽 메뉴에서 `Environment Variables` 클릭
3. 다음 환경 변수들을 하나씩 추가:

```
변수명: NEXT_PUBLIC_SUPABASE_URL
값: https://dijtowiohxvwdnvgprud.supabase.co

변수명: NEXT_PUBLIC_SUPABASE_ANON_KEY
값: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpanRvd2lvaHh2d2RudmdwcnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNzcyMTcsImV4cCI6MjA2Mjg1MzIxN30.dNAl6RJYfOLmn2s1BMOP2yMyJVD63S1ubGs3neyYCH0

변수명: NEXT_PUBLIC_ENVIRONMENT
값: production

변수명: NEXT_PUBLIC_SUPABASE_BRANCH
값: main

변수명: NEXT_PUBLIC_PROJECT_ID
값: dijtowiohxvwdnvgprud

변수명: ADMIN_JWT_SECRET
값: [안전한 비밀키 입력 - 예: your-super-secret-key-2024]

변수명: NEXT_PUBLIC_ENABLE_DEBUG
값: false

변수명: NEXT_PUBLIC_ENABLE_ANALYTICS
값: true

변수명: NODE_ENV
값: production
```

**⚠️ 중요:** `ADMIN_JWT_SECRET`는 반드시 안전하고 추측하기 어려운 값으로 설정하세요!

### 각 변수 추가 방법:
1. `Add New` 버튼 클릭
2. `Key` 필드에 변수명 입력 (예: NODE_ENV)
3. `Value` 필드에 값 입력 (예: production)
4. `Environment` 선택:
   - `Production` ✅ 체크
   - `Preview` ✅ 체크 (선택사항)
   - `Development` ✅ 체크 (선택사항)
5. `Save` 버튼 클릭

### 3단계: Git 설정 확인
1. `Settings` → `Git` 메뉴로 이동
2. 다음 사항 확인:
   - **Production Branch**: `main` (메인 브랜치)
   - **Preview Branches**: 다른 모든 브랜치

### 4단계: 빌드 설정 확인
1. `Settings` → `General` 메뉴로 이동
2. `Build & Development Settings` 섹션 확인:
   - **Framework Preset**: `Next.js` (자동 감지됨)
   - **Build Command**: `npm run build:production` (vercel.json에서 자동 설정됨)
   - **Install Command**: `npm install`

## 🚀 배포 방법

### 터미널에서 실행:
```bash
# 1. 변경사항 추가
git add .

# 2. 커밋
git commit -m "프로덕션 배포 설정"

# 3. main 브랜치로 푸시
git push origin main
```

### Vercel이 자동으로 수행하는 작업:
1. main 브랜치 변경 감지
2. `npm install` 실행 (패키지 설치)
3. `npm run build:production` 실행 (프로덕션 빌드)
4. 프로덕션 모드로 배포

## ✅ 프로덕션 모드 확인 방법

배포 후 다음 방법으로 프로덕션 모드를 확인할 수 있습니다:

### 1. 웹사이트에서 확인:
1. 배포된 사이트 접속
2. 상단의 환경 배지 확인 → "PRODUCTION" 표시되어야 함
3. 브라우저 개발자 도구(F12) 열기
4. Console 탭 확인 → React 개발 경고가 없어야 함
5. Network 탭 확인 → JavaScript 파일이 압축되어 있어야 함

### 2. Vercel 대시보드에서 확인:
1. 프로젝트 대시보드 → `Functions` 탭
2. 로그에서 "Production mode" 확인

## 🔧 문제 해결

### 여전히 개발 모드로 표시되는 경우:

#### 1. Vercel 캐시 삭제:
1. `Settings` → `Functions` 이동
2. `Clear Cache` 버튼 클릭

#### 2. 수동 재배포:
1. 프로젝트 대시보드 메인 페이지
2. 최근 배포 옆 `...` 메뉴 클릭
3. `Redeploy` 선택
4. `Use existing Build Cache` 체크 해제
5. `Redeploy` 클릭

#### 3. 환경 변수 재확인:
1. `Settings` → `Environment Variables`
2. 특히 `NODE_ENV=production` 확인
3. 모든 변수가 Production에 체크되어 있는지 확인

#### 4. 빌드 로그 확인:
1. 배포 페이지에서 `Building` 단계 클릭
2. 로그에서 `npm run build:production` 실행 확인
3. 에러 메시지 확인

## 🔒 보안 주의사항

1. **절대 하지 말아야 할 것:**
   - `.env.local` 파일을 GitHub에 커밋하지 마세요
   - `ADMIN_JWT_SECRET`을 공개하지 마세요
   - 프로덕션과 개발 환경에 같은 비밀키를 사용하지 마세요

2. **반드시 해야 할 것:**
   - 정기적으로 비밀키 변경
   - 강력한 비밀번호 사용
   - Vercel의 환경 변수 암호화 기능 활용

## 📞 추가 도움이 필요한 경우

1. **Vercel 배포 로그 확인:**
   - 프로젝트 대시보드에서 배포 클릭
   - 각 단계별 로그 확인

2. **브라우저 콘솔 확인:**
   - F12 → Console 탭에서 에러 확인

3. **API 호출 확인:**
   - F12 → Network 탭에서 Supabase API 호출이 프로덕션 URL로 가는지 확인

## 💡 팁

- 개발 환경에서 테스트: `npm run dev:production`
- 로컬에서 프로덕션 빌드 테스트: `npm run build:production && npm run start:production`
- 환경 전환: `npm run flavor:release` (프로덕션) / `npm run flavor:dev` (개발)