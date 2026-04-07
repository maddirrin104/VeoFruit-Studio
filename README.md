# VeoFruit Studio

Web app Next.js + Prisma + PostgreSQL cho quy trinh tao video AI.

## 1. Yeu cau he thong

- Node.js 20+
- npm 10+
- PostgreSQL 14+ (local hoac cloud)

## 2. Cai dat du an

```bash
npm install
```

## 3. Cau hinh bien moi truong

Tao file `.env` o thu muc goc du an voi noi dung:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/veofruit_studio?schema=public"
RUNWAYML_API_SECRET="your_runway_api_secret"
FPT_AI_API_KEY="your_fpt_ai_api_key"
FPT_AI_TTS_URL="https://api.fpt.ai/hmi/tts/v5"
# optional: override code provider cho tung giong
# FPT_AI_VOICE_BANMAI="banmai"
# FPT_AI_VOICE_LEMINH="leminh"
# FPT_AI_VOICE_THUMINH="thuminh"
# FPT_AI_VOICE_MINHQUANG="minhquang"
# FPT_AI_VOICE_MYAN="myan"
# FPT_AI_VOICE_LINHSAN="linhsan"
# FPT_AI_VOICE_GIAHUY="giahuy"
# FPT_AI_VOICE_LANNHI="lannhi"
# FPT_AI_VOICE_NGOCLAM="ngoclam"
```

Ban hay doi:

- `postgres`: user PostgreSQL
- `your_password`: mat khau PostgreSQL
- `localhost:5432`: host va port database
- `veofruit_studio`: ten database
- `your_runway_api_secret`: API Secret tu RunwayML
- `your_fpt_ai_api_key`: API key tu FPT AI
- Danh sach giong UI ho tro san: Ban Mai, Le Minh, Thu Minh, Minh Quang, My An, Linh San, Gia Huy, Lan Nhi, Ngoc Lam.
- Neu nha cung cap doi ma voice, ban co the set bien `FPT_AI_VOICE_<TEN_GIONG>` tuong ung (vi du `FPT_AI_VOICE_BANMAI`).

## 4. Tao database va ket noi Prisma

Neu chua co database, tao truoc trong PostgreSQL:

```sql
CREATE DATABASE veofruit_studio;
```

Sau do chay migration:

```bash
npx prisma migrate dev
```

Lenh nay se:

- Doc schema trong `prisma/schema.prisma`
- Ap migration trong `prisma/migrations`
- Tao/refresh Prisma Client

Neu can generate lai Prisma Client thu cong:

```bash
npx prisma generate
```

## 5. Chay ung dung

```bash
npm run dev
```

Mo trinh duyet tai:

- http://localhost:3000

## 6. Kiem tra nhanh ket noi database

Mo Prisma Studio de xem bang du lieu:

```bash
npx prisma studio
```

Neu Studio mo duoc va thay cac bang `users`, `video_projects`, `video_generations`, `video_scenes` thi ket noi da OK.

## 7. Xu ly loi thuong gap

1. Loi `Environment variable not found: DATABASE_URL`

- Kiem tra da tao file `.env` chua
- Kiem tra bien `DATABASE_URL` viet dung ten chua

2. Loi ket noi PostgreSQL (`P1001`, timeout)

- Kiem tra PostgreSQL da chay chua
- Kiem tra host/port/user/password trong `DATABASE_URL`

3. Loi migration

- Thu dong bo lai schema:

```bash
npx prisma migrate reset
```

Luu y: Lenh tren se xoa du lieu trong database hien tai.

## 8. Lenh huu ich

```bash
npm run lint            # kiem tra ESLint
npx tsc --noEmit        # kiem tra TypeScript
npx prisma migrate dev  # tao/ap migration local
npx prisma studio       # xem data bang UI
```
