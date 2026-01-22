# 실행방법

## 1. Install

```zsh
npm install
```

## 2. Env 설정

`.env.local` 생성하기:

```
DATABASE_URL=file:./dev.db
OPENAI_API_KEY=your_key
OPENAI_API_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

## 3. Prisma

```zsh
npx prisma migrate
npx prisma generate
```

## 4. Run

```
npm run dev
```

## DB 확인 (선택)

```zsh
npx prisma studio
```

## DB 테이블 구조

<img width="832" height="482" alt="스크린샷 2026-01-23 오전 3 40 57" src="https://github.com/user-attachments/assets/de31e7cf-f4ae-4a14-ad25-7744e9fdb62c" />
