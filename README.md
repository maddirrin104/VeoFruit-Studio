<div align="center">

# 🎬 VeoFruit Studio

**Nền tảng tạo video quảng cáo nông sản bằng AI — tích hợp đa mô hình, thuyết minh tiếng Việt, xuất bản desktop**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-41.2-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

</div>

---

## Giới thiệu

**VeoFruit Studio** là ứng dụng web và desktop cho phép tự động hóa toàn bộ quy trình sản xuất video quảng cáo nông sản — từ kịch bản, hình ảnh động, đến giọng đọc tiếng Việt — chỉ bằng một vài thao tác đơn giản.

Hệ thống tích hợp đồng thời **4 mô hình AI video** hàng đầu và **9 giọng đọc tiếng Việt** từ FPT AI, cho phép người dùng tùy chỉnh phong cách, nhân vật, âm thanh và xuất video hoàn chỉnh mà không cần kỹ năng dựng phim.

---

## Tính năng nổi bật

### Video AI đa mô hình
| Mô hình | Kiểu | Đặc điểm |
|---------|------|-----------|
| **RunwayML Gen4.5** | Text → Video | Chất lượng điện ảnh, 5–10s/clip |
| **RunwayML Gen4 Turbo** | Image → Video | Tham chiếu ảnh thực tế, 5 credits/s |
| **Google Veo3** | Text → Video | Mô hình Google mới nhất, tích hợp âm thanh |
| **Kling AI v2.6** | Text + Image → Video | Chuyển động tự nhiên, âm thanh AI |

### Kịch bản thông minh với Gemini
- Tự động nhận diện **loại nông sản** (xoài, sầu riêng, măng cụt, bơ, …)
- Sinh kịch bản **đa cảnh** theo phong cách thương mại tiếng Việt
- Tự điều chỉnh lời thoại để khớp tốc độ đọc (~17 ký tự/giây)
- Hỗ trợ **retry thông minh** nếu lời thoại quá ngắn

### Giọng đọc tiếng Việt (FPT AI TTS)
9 giọng đọc chuyên nghiệp — 8 nữ, 1 nam — đại diện đủ 3 miền:

| Giọng | Vùng | Giọng | Vùng |
|-------|------|-------|------|
| Ban Mai | Miền Bắc | My An | Miền Nam |
| Thu Minh | Miền Bắc | Linh San | Miền Nam |
| Minh Quang | Miền Bắc | Gia Huy | Miền Nam |
| Lê Minh | Miền Trung | Lan Nhi | Miền Nam |
| Ngọc Lâm | Miền Nam | — | — |

### Cấu hình sản xuất linh hoạt
- **Tỉ lệ khung hình**: 9:16 (Reels/Shorts), 1:1, 16:9, 4:5
- **Độ phân giải**: 720p / 1080p
- **Góc quay ảnh tham chiếu**: Eye-level · Diagonal · Close-up · Top-down
- **Phong cách hình ảnh**: 16 preset (Cinematic, Dreamy, Food Photography, …)
- **Cường độ chuyển động**: Thang 1–10
- **Nền nhạc**: Thư viện nhạc nền + tuỳ chỉnh

### Ứng dụng Desktop (Windows)
- Chạy hoàn toàn **offline** sau cài đặt (Next.js bundled bên trong Electron)
- Cấu hình API key qua giao diện Settings không cần chỉnh `.env`
- Xuất file cài đặt `.exe` (NSIS Installer)
- Single-instance lock — ngăn mở trùng lặp

---

## Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                    VeoFruit Studio                           │
│                                                              │
│   ┌─────────────────┐        ┌───────────────────────────┐  │
│   │   Frontend UI   │◄──────►│     Next.js API Routes    │  │
│   │   (React 19)    │        │                           │  │
│   │                 │        │  /api/ai/generate-script  │  │
│   │  Studio Page    │        │  /api/ai/generate-audio   │  │
│   │  Preview Panel  │        │  /api/generations         │  │
│   │  Config Modal   │        │  /api/projects            │  │
│   │  Settings UI    │        │  /api/settings            │  │
│   └─────────────────┘        └──────────┬────────────────┘  │
│                                          │                    │
│   ┌───────────────────────────────────────────────────────┐  │
│   │                  Core Libraries                        │  │
│   │  veo3.ts · runway.ts · kling.ts · fpt-tts.ts         │  │
│   │  scene-parser.ts · audio-narration.ts · video-concat  │  │
│   └───────────────────────────────────────────────────────┘  │
│                          │                                    │
└──────────────────────────┼────────────────────────────────── ┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌─────────────┐  ┌───────────┐  ┌──────────────┐
   │ Google APIs │  │ RunwayML  │  │   FPT AI     │
   │ Gemini/Veo3 │  │ Gen4/Turbo│  │  TTS (9 voices)│
   └─────────────┘  └───────────┘  └──────────────┘
          ▼
   ┌─────────────┐
   │  Kling AI   │
   │   v2.6      │
   └─────────────┘
```

---

## Luồng hoạt động

```
Người dùng nhập thông tin sản phẩm
        │
        ▼
[1] Gemini sinh kịch bản đa cảnh (tiếng Việt)
        │
        ▼
[2] Mỗi cảnh → AI Video (Runway / Veo3 / Kling)
        │
        ▼
[3] Lời thoại → FPT TTS → File MP3
        │
        ▼
[4] Ghép video + audio bằng FFmpeg
        │
        ▼
[5] Xuất video hoàn chỉnh + lưu database
```

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 App Router + React 19
- **Styling**: Tailwind CSS 4.2 + PostCSS
- **Icons**: Lucide React 0.577
- **Language**: TypeScript 5

### Backend
- **Runtime**: Next.js API Routes (Node.js)
- **ORM**: Prisma 6.19 (WASM engine — tương thích Electron)
- **Database**: PostgreSQL 14+ / SQLite
- **HTTP Client**: Axios 1.13
- **Media**: ffmpeg-static 5.3

### AI Providers
| Provider | SDK / Method | Dùng cho |
|----------|-------------|---------|
| Google Generative AI | `@google/genai` 1.46 | Gemini script + Veo3 video |
| RunwayML | `@runwayml/sdk` 3.16 | Gen4.5 + Gen4 Turbo video |
| FPT AI | REST API | Vietnamese TTS |
| Kling AI | REST API + JWT | Text/Image-to-Video |

### Desktop
- **Shell**: Electron 41.2
- **Packaging**: Electron Builder 26.8 (NSIS Windows Installer)

---

## Cài đặt và chạy

### Yêu cầu
- Node.js 20+
- npm 10+
- PostgreSQL 14+ (hoặc dùng SQLite cho local dev)

### 1. Clone và cài dependencies

```bash
git clone https://github.com/<your-username>/VeoFruit-Studio.git
cd VeoFruit-Studio
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` ở thư mục gốc:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/veofruit_studio?schema=public"

# AI APIs
GOOGLE_API_KEY="your_google_api_key"          # Gemini + Veo3
RUNWAYML_API_SECRET="your_runway_secret"       # RunwayML
FPT_AI_API_KEY="your_fpt_ai_key"              # FPT TTS
FPT_AI_TTS_URL="https://api.fpt.ai/hmi/tts/v5"

# Kling AI (tuỳ chọn)
KLING_ACCESS_KEY_ID="your_kling_key_id"
KLING_ACCESS_KEY_SECRET="your_kling_secret"

# Voice mapping (tuỳ chọn — ghi đè code giọng FPT)
# FPT_AI_VOICE_BANMAI="banmai"
# FPT_AI_VOICE_THUMINH="thuminh"
# FPT_AI_VOICE_MINHQUANG="minhquang"
```

### 3. Khởi tạo database

```bash
# Tạo database trong PostgreSQL
psql -U postgres -c "CREATE DATABASE veofruit_studio;"

# Chạy migration
npx prisma migrate dev

# (Tuỳ chọn) Xem dữ liệu bằng Prisma Studio
npx prisma studio
```

### 4. Chạy ứng dụng web

```bash
npm run dev
# Mở http://localhost:3200
```

### 5. Chạy ứng dụng desktop (Electron)

```bash
npm run desktop:dev
```

---

## Build Desktop App (Windows)

```bash
npm run desktop:build
```

File cài đặt `.exe` sẽ xuất ra thư mục `dist-electron/`.

> **Lưu ý**: Ứng dụng đóng gói có thể cấu hình API key trực tiếp qua màn hình **Settings** mà không cần chỉnh `.env`.  
> Settings được lưu tại `%USERPROFILE%/.veofruit-studio/runtime-settings.json`.

---

## Cấu trúc thư mục

```
VeoFruit-Studio/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Giao diện Studio chính
│   │   └── api/                        # Backend API Routes
│   │       ├── ai/generate-script/     # Sinh kịch bản Gemini
│   │       ├── ai/generate-audio/      # FPT TTS
│   │       ├── ai/preview-voice/       # Preview giọng đọc
│   │       ├── generations/            # Quản lý generation
│   │       ├── projects/               # Quản lý project
│   │       ├── settings/               # Cấu hình runtime
│   │       └── uploads/image/          # Upload ảnh tham chiếu
│   │
│   ├── components/sections/            # UI Components chính
│   │   ├── StudioHeader.tsx
│   │   ├── WorkflowModeSection.tsx     # Chọn chế độ (4 AI models)
│   │   ├── VideoConfigSection.tsx      # Tỉ lệ, độ phân giải
│   │   ├── ContentEditorSection.tsx    # Script, nhân vật
│   │   ├── PreviewPanel.tsx            # Preview + góc quay
│   │   ├── ProductionBriefSection.tsx  # Tóm tắt production
│   │   └── ApiConfigModal.tsx          # Settings / Access Token
│   │
│   ├── lib/                            # Core business logic
│   │   ├── veo3.ts                     # Google Veo3 integration
│   │   ├── runway.ts                   # RunwayML integration
│   │   ├── kling.ts                    # Kling AI integration
│   │   ├── fpt-tts.ts                  # FPT TTS integration
│   │   ├── scene-parser.ts             # Phân tích kịch bản → cảnh
│   │   ├── audio-narration.ts          # Xây dựng nội dung thuyết minh
│   │   ├── audio-postprocess.ts        # Mix audio + MP3
│   │   └── video-concat.ts             # Ghép video FFmpeg
│   │
│   ├── services/studio-api.ts          # HTTP client cho frontend
│   └── types/studio.ts                 # TypeScript interfaces
│
├── electron/
│   └── main.cjs                        # Electron main process
├── prisma/
│   ├── schema.prisma                   # Database schema
│   └── migrations/                     # SQL migrations
├── public/
│   ├── bg-music/                       # Thư viện nhạc nền
│   ├── generated-audio/                # Cache TTS output
│   └── uploads/                        # Ảnh tham chiếu người dùng
└── dist-electron/                      # Output file .exe (sau build)
```

---

## API Routes

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/ai/generate-script` | POST | Sinh kịch bản từ Gemini |
| `/api/ai/generate-audio` | POST | Tạo giọng đọc FPT TTS |
| `/api/ai/preview-voice` | POST | Nghe thử giọng đọc |
| `/api/generations` | POST / GET | Tạo / liệt kê generation |
| `/api/generations/[id]` | GET / PATCH / DELETE | Chi tiết generation |
| `/api/generations/[id]/download` | GET | Tải video hoàn chỉnh |
| `/api/projects` | POST / GET | Tạo / liệt kê project |
| `/api/projects/[id]` | GET / PATCH / DELETE | Chi tiết project |
| `/api/settings` | GET / PATCH | Đọc / lưu API keys |
| `/api/settings/test` | POST | Kiểm tra API key hợp lệ |
| `/api/uploads/image` | POST | Upload ảnh tham chiếu |

---

## Các lệnh hữu ích

```bash
npm run dev              # Web dev server (http://localhost:3200)
npm run build            # Build Next.js production
npm run lint             # ESLint kiểm tra code
npm run desktop:dev      # Desktop dev mode (Electron)
npm run desktop:build    # Đóng gói file .exe

npx tsc --noEmit         # Kiểm tra TypeScript
npx prisma migrate dev   # Áp migration
npx prisma studio        # Xem database bằng UI
npx prisma generate      # Generate Prisma Client
```

---

## Xử lý lỗi thường gặp

**Lỗi `Environment variable not found: DATABASE_URL`**
- Kiểm tra file `.env` đã tồn tại và có biến `DATABASE_URL` đúng cú pháp.

**Lỗi kết nối PostgreSQL (P1001 / timeout)**
- Đảm bảo PostgreSQL đang chạy và thông tin host/port/user/password chính xác.

**Lỗi migration**
```bash
npx prisma migrate reset   # ⚠️ Xóa toàn bộ dữ liệu và tạo lại schema
```

**Video không xuất được trên Desktop**
- Kiểm tra `ffmpeg-static` đã được cài đúng cách (`npm install`).
- Kiểm tra quyền ghi vào thư mục `public/generated-audio/`.

---

## Giấy phép

Dự án được phát triển phục vụ mục đích học thuật tại **Trường Đại học Công nghệ Thông tin — ĐHQG TP.HCM (UIT)**.

---

<div align="center">

Developed with ❤️ by **VeoFruit Studio Team** · UIT · 2026

</div>
