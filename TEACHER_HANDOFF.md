# HUONG DAN THAY TEST VA CHAY DUOC APP (BAN CAP NHAT MOI NHAT)

Tai lieu nay de Thay chi can lam dung thu tu la app chay duoc.

## 1) BO FILE CAN GUI CHO THAY
Gui dung 3 file sau:
- dist-electron/VeoFruit Studio Setup 0.1.0.exe
- database_setup.sql
- TEACHER_HANDOFF.md

Khuyen nghi: nen 3 file thanh 1 file zip de gui gon.

## 2) YEU CAU MAY TEST
- Windows 10/11
- Da cai PostgreSQL (local hoac cloud)
- Co Internet de goi API Google, Runway, FPT

## 3) CAI APP DESKTOP
1. Chay file VeoFruit Studio Setup 0.1.0.exe
2. Cai dat nhu app binh thuong
3. Mo app VeoFruit Studio

Luu y:
- Ban desktop nay tu dong chay local server o cong 3200.

## 4) SETUP DATABASE (BAT BUOC, CHI 1 LAN)
Neu bo qua buoc nay, app se loi khi tao Project/Generation.

### Cach setup nhanh voi PostgreSQL local
1. Mo pgAdmin (hoac DBeaver, DataGrip, psql)
2. Tao database moi, vi du: veofruit_studio
3. Mo Query Tool cua database vua tao
4. Copy toan bo noi dung file database_setup.sql va chay
5. Kiem tra da co cac bang:
   - users
   - video_projects
   - video_generations
   - video_scenes

### Mau DATABASE_URL
- Local:
  - postgresql://postgres:YOUR_PASSWORD@localhost:5432/veofruit_studio?schema=public
- Cloud (Supabase/Neon/Railway...):
  - dung connection string do nha cung cap cap

Luu y quan trong:
- Neu password co ky tu dac biet, phai URL encode (vi du @ -> %40).
- DATABASE_URL sai thi app khong doc/ghi du lieu duoc.

## 5) NHAP SETTINGS API TRONG APP
Vao phan Settings API, nhap cac truong sau.

### Truong bat buoc de chay day du tinh nang
- DATABASE_URL
- Google API Key (Gemini/Veo)
- Runway API Secret
- FPT AI API Key

### Truong thuong giu mac dinh (khong can sua)
- Runway Base URL: https://api.dev.runwayml.com
- Runway API Version: 2024-11-06
- FPT TTS URL: https://api.fpt.ai/hmi/tts/v5
- FPT Timeout (ms): 45000
- FPT Retries: 2

### PUBLIC_APP_URL (chi can khi can URL cong khai)
- Neu Thay chi test app tren 1 may: co the de trong
- Neu can URL cong khai tam thoi: dung ngrok (xem muc 9)

Sau khi nhap xong:
1. Bam Luu Settings
2. Cho thong bao luu thanh cong
3. Dong/mo lai app neu can

## 6) NHUNG CAP NHAT MOI NHAT DA CO SAN TRONG BAN NAY
1. Fix loi audio 0:00
- App da dung co che phuc vu file runtime qua API (khong phu thuoc static path cu)
- Co kiem tra audio play duoc truoc khi luu

2. Tang toc gen video
- Da toi uu quy trinh de giam thoi gian cho (chay song song video + audio)
- Chat luong dau ra giu nguyen

3. Quan ly nhap moi
- Co nut Luu nhap
- Co box Danh sach nhap co the mo/thu gon
- Co chuc nang Nap nhap, Doi ten, Xoa

## 7) CACH TEST NHANH CHO THAY (3-5 PHUT)
1. Mo app
2. Vao Settings API, dien key + DATABASE_URL, bam Luu Settings
3. Nhap noi dung co ban cho form
4. Bam Luu nhap
5. Bam Danh sach nhap, thu:
   - Nap nhap
   - Doi ten nhap
   - Xoa nhap
6. Bam Tao video de test luong generation

Neu cac buoc tren chay duoc, bai dat yeu cau.

## 8) LOI THUONG GAP VA CACH XU LY NHANH
### Loi: Unexpected token 'I', "Internal S"... is not valid JSON
Y nghia: backend tra loi text Internal Server Error thay vi JSON.
Thuong do:
- Chua setup database
- DATABASE_URL sai

Cach xu ly:
1. Kiem tra da chay database_setup.sql chua
2. Kiem tra lai DATABASE_URL trong Settings API
3. Bam Luu Settings, mo lai app

### Loi lien quan du lieu draft/project
Cach xu ly:
1. Dam bao dang dung dung ban exe moi nhat
2. Kiem tra database co du bang
3. Kiem tra lai DATABASE_URL

## 9) NGROK (CHI DUNG KHI CAN PUBLIC_APP_URL)
Neu chi test local thi bo qua muc nay.

1. Tao tai khoan ngrok: https://dashboard.ngrok.com/signup
2. Cai ngrok:
   - Cach 1: Download zip tu https://ngrok.com/download
   - Cach 2: winget install ngrok.ngrok
3. Ket noi token (chi 1 lan):
   - ngrok config add-authtoken YOUR_TOKEN_HERE
4. Mo app desktop VeoFruit Studio
5. Mo terminal moi, chay:
   - ngrok http 3200
6. Copy HTTPS Forwarding, vi du:
   - https://abc123.ngrok-free.app
7. Dan vao PUBLIC_APP_URL trong app, bam Luu Settings

Quy tac PUBLIC_APP_URL:
- Dung: https://abc123.ngrok-free.app
- Sai: https://abc123.ngrok-free.app/uploads

## 10) FILE SETTINGS VA LOG DE DEBUG
### Noi luu settings
- %USERPROFILE%/.veofruit-studio/runtime-settings.json

### Log startup desktop
- %APPDATA%/VeoFruit Studio/main-process.log

Khi can debug, gui file log nay la nhanh nhat.

## 11) CHECKLIST CHOT TRUOC KHI NOP
1. Da gui dung 3 file: exe + database_setup.sql + file huong dan nay
2. Da test cai moi tren may sach (hoac user profile sach)
3. Da test tao/luu/nap/doi ten/xoa nhap
4. Da test tao video thanh cong it nhat 1 lan
5. Da xac nhan log khong co loi nghiem trong
