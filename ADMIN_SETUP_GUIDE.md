# Admin Setup Guide

## 관리자 계정 설정 방법

### 방법 0: Super Admin 계정 사용 (Supabase 계정 불필요)

**이 방법은 Supabase에 계정을 생성하지 않고 즉시 관리자로 로그인할 수 있습니다.**

1. **환경 변수 설정**
   `.env.local` 파일에 다음 추가:
   ```env
   SUPER_ADMIN_EMAIL=admin@yourcompany.com
   SUPER_ADMIN_PASSWORD=your-very-secure-password-2024
   SUPER_ADMIN_SECRET=your-secret-key-for-hashing
   ```

2. **로그인 페이지에서 Super Admin 모드 활성화**
   - `/auth/login` 페이지 접속
   - 우측 하단 "Super Admin" 버튼 클릭
   - 설정한 이메일과 비밀번호 입력
   - "Super Admin 로그인" 클릭

3. **특징**
   - Supabase 계정 생성 불필요
   - 모든 관리자 권한 보유
   - 24시간 세션 유지
   - 우측 상단에 "Super Admin Mode" 표시

### 방법 1: 애플리케이션을 통한 관리자 생성 (권장)

1. **로그인 페이지 접속**
   - http://localhost:3000/auth/login 로 이동

2. **관리자 계정 생성**
   - "관리자 계정이 필요하신가요?" 클릭
   - 이메일과 비밀번호 입력
   - "관리자 계정 생성" 클릭

3. **이메일 인증**
   - 가입한 이메일로 전송된 인증 링크 클릭
   - 인증 완료 후 로그인 페이지로 돌아옴

4. **로그인**
   - 이메일과 비밀번호로 로그인
   - 자동으로 /admin 페이지로 리다이렉트

### 방법 2: Supabase Dashboard를 통한 관리자 생성

1. **Supabase Dashboard 접속**
   - https://app.supabase.com 로그인
   - 프로젝트 선택

2. **Authentication 섹션**
   - 좌측 메뉴에서 "Authentication" 클릭
   - "Users" 탭 선택

3. **새 사용자 생성**
   - "Invite user" 또는 "Create new user" 버튼 클릭
   - 이메일과 비밀번호 입력
   - "Create user" 클릭

4. **Users 테이블에 관리자 정보 추가**
   - 좌측 메뉴에서 "Table Editor" 클릭
   - "users" 테이블 선택
   - "Insert row" 클릭
   - 다음 정보 입력:
     ```
     id: [Authentication에서 생성된 User ID]
     email: [관리자 이메일]
     user_type: ADMIN
     verification_status: APPROVED
     created_at: [현재 시간]
     updated_at: [현재 시간]
     ```
   - "Save" 클릭

### 방법 3: SQL을 통한 직접 생성

1. **Supabase SQL Editor 접속**
   - Supabase Dashboard → SQL Editor

2. **관리자 계정 생성 SQL 실행**
   ```sql
   -- 먼저 Authentication에서 사용자를 생성한 후
   -- 해당 사용자 ID로 아래 쿼리 실행
   
   INSERT INTO public.users (
     id,
     email,
     full_name,
     user_type,
     verification_status,
     created_at,
     updated_at
   ) VALUES (
     'AUTH_USER_ID_HERE', -- Supabase Auth에서 생성된 ID
     'admin@example.com',
     'Admin User',
     'ADMIN',
     'APPROVED',
     NOW(),
     NOW()
   );
   ```

## Authentication 설정 확인사항

### 1. Email 인증 설정
- Supabase Dashboard → Authentication → Providers
- Email 활성화 확인
- "Confirm email" 옵션 설정

### 2. 리다이렉트 URL 설정
- Authentication → URL Configuration
- Site URL: `http://localhost:3000` (개발)
- Redirect URLs에 추가:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3001/auth/callback` (포트 변경 시)
  - `https://your-domain.com/auth/callback` (프로덕션)

### 3. 소셜 로그인 설정 (선택사항)
- Authentication → Providers
- Google, Apple, Kakao 등 원하는 provider 활성화
- 각 provider의 OAuth credentials 설정

## 권한 체크 플로우

1. **로그인 시도**
   - Email/Password 또는 소셜 로그인

2. **Middleware 체크** (`src/middleware.ts`)
   - Session 존재 여부 확인
   - users 테이블에서 user_type 확인
   - ADMIN이 아닌 경우 접근 거부

3. **Admin 페이지 접근**
   - user_type이 ADMIN인 경우만 /admin/* 접근 가능
   - REALTOR는 /realtor/* 접근 가능

## 트러블슈팅

### 로그인 후 /admin 접근 불가
1. users 테이블에 해당 사용자 레코드 확인
2. user_type이 'ADMIN'인지 확인
3. verification_status가 'APPROVED'인지 확인

### 이메일 인증 메일이 오지 않음
1. Supabase Dashboard → Authentication → Settings
2. "Enable email confirmations" 확인
3. SMTP 설정 확인 (프로덕션의 경우)

### 세션이 유지되지 않음
1. 브라우저 쿠키 확인
2. Supabase client 초기화 확인
3. middleware.ts의 세션 체크 로직 확인

## 보안 권장사항

1. **강력한 비밀번호 정책**
   - 최소 8자 이상
   - 대소문자, 숫자, 특수문자 포함

2. **2FA 활성화** (프로덕션)
   - Supabase Dashboard에서 2FA 설정

3. **정기적인 권한 검토**
   - 불필요한 관리자 계정 제거
   - 마지막 로그인 시간 모니터링

4. **RLS (Row Level Security) 정책**
   - users 테이블에 적절한 RLS 정책 설정
   - 관리자만 특정 데이터 접근 가능하도록 설정

## 추가 기능

### 관리자 역할 세분화
필요시 user_type을 확장하여 세분화된 권한 관리:
- SUPER_ADMIN: 모든 권한
- ADMIN: 일반 관리 권한
- MODERATOR: 컨텐츠 관리 권한
- SUPPORT: 고객 지원 권한

### 활동 로그
관리자 활동을 추적하기 위한 audit_logs 테이블 생성 권장:
```sql
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(255),
  entity_type VARCHAR(100),
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```