# Supabase + Vercel Todo App

React + TypeScript로 만든 Todo 애플리케이션입니다. Supabase를 백엔드로 사용하고 Vercel에 배포합니다.

## 기능

- ✅ 사용자 인증 (회원가입/로그인)
- ✅ Todo 추가, 완료 처리, 삭제
- ✅ 사용자별 Todo 관리
- ✅ 실시간 데이터베이스 연동

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 다음 SQL 실행하여 `todos` 테이블 생성:

```sql
-- todos 테이블 생성
create table todos (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Row Level Security (RLS) 활성화
alter table todos enable row level security;

-- 사용자는 자신의 Todo만 조회/생성/수정/삭제 가능
create policy "Users can view their own todos"
  on todos for select
  using (auth.uid() = user_id);

create policy "Users can insert their own todos"
  on todos for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own todos"
  on todos for update
  using (auth.uid() = user_id);

create policy "Users can delete their own todos"
  on todos for delete
  using (auth.uid() = user_id);
```

3. Supabase 프로젝트 설정에서 다음 정보 확인:
   - Project URL
   - Anon public key

### 3. 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일에 Supabase 정보 입력:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## Vercel 배포

### 1. GitHub에 프로젝트 푸시

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

### 2. Vercel 배포

1. [Vercel](https://vercel.com)에 로그인
2. "New Project" 클릭
3. GitHub 저장소 선택
4. Environment Variables 추가:
   - `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase Anon Key
5. "Deploy" 클릭

배포 완료 후 자동으로 생성된 URL에서 앱 확인 가능!

## 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **Supabase** - 백엔드 (인증 + 데이터베이스)
- **Vercel** - 배포 플랫폼

## 프로젝트 구조

```
.
├── src/
│   ├── App.tsx          # 메인 앱 컴포넌트
│   ├── App.css          # 스타일
│   ├── main.tsx         # 진입점
│   ├── index.css        # 전역 스타일
│   ├── lib/
│   │   └── supabase.ts  # Supabase 클라이언트
│   └── types/
│       └── todo.ts      # TypeScript 타입 정의
├── package.json
├── vite.config.ts
├── tsconfig.json
└── vercel.json          # Vercel 배포 설정
```

## 라이선스

MIT
