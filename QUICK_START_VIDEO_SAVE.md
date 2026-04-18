# Hướng Dẫn Sử Dụng - Tính Năng Tự Động Lưu Video

## 🎯 Điều Gì Đã Được Thêm?

Bây giờ, mỗi khi video được tạo:**Trước**: Video URL được lưu từ Runway (URL tạm thời, có thể hết hạn)
**Sau**: Video được tải xuống tự động và lưu vào thư mục local

## 📁 File Được Tạo/Cập Nhật

1. **`src/lib/video-storage.ts`** (NEW)
   - Utility để tải xuống và lưu video
   - Hỗ trợ xóa file video cũ
   - Xử lý lỗi tự động

2. **`src/app/api/generations/route.ts`** (CẬP NHẬT)
   - Thêm logic tuy đổi video sau khi Runway tạo xong
   - Fallback về URL gốc nếu lưu local thất bại

3. **`.gitignore`** (CẬP NHẬT)
   - Thêm `/public/uploads/` để tránh commit file video
   - Thêm `/public/generated-audio/` (tương tự để tránh commit audio)

4. **`VIDEO_AUTO_SAVE_FEATURE.md`** (NEW)
   - Tài liệu chi tiết về tính năng
   - API reference
   - Ví dụ sử dụng

## 🚀 Cách Nó Hoạt Động

```
Video được tạo (Runway)
        ↓
    Lấy URL từ Runway
        ↓
    Tải xuống video nhị phân (binary)
        ↓
    Lưu vào: /public/uploads/videos/{generationId}.mp4
        ↓
    Cập nhật Database với đường dẫn local
        ↓
    ✅ Hoàn thành
```

## 📍 Nơi Lưu Trữ Video

```
VeoFruit-Studio/
└── public/
    └── uploads/
        └── videos/
            ├── {generationId}.mp4  ← Video được lưu ở đây
            ├── {generationId}.mp4
            └── ...
```

## 🔗 Truy Cập Video

**Qua API:**
```bash
GET /api/generations?projectId={projectId}
```
Response sẽ chứa `outputUrl` như:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "outputUrl": "/uploads/videos/550e8400-e29b-41d4-a716-446655440000.mp4",
  "status": "completed"
}
```

**Qua Browser:**
```
http://localhost:3000/uploads/videos/{generationId}.mp4
```

## ⚙️ Cấu Hình

**Không cần cấu hình!** Tính năng hoạt động tự động.

Nếu muốn thay đổi thư mục lưu trữ, chỉnh sửa:
- `src/lib/video-storage.ts` → dòng 3:
```typescript
const VIDEO_OUTPUT_DIR = path.join(process.cwd(), "public", "uploads", "videos");
```

## 🛡️ Xử Lý Lỗi

Nếu lưu video vào local thất bại:
1. ✓ Log lỗi chi tiết vào console
2. ✓ Fallback về URL gốc từ Runway
3. ✓ Video vẫn được lưu vào database
4. ✓ Người dùng vẫn có thể truy cập video

**Example Log:**
```
[VideoStorage] Downloading video from https://runway.com/temp/video.mp4...
[VideoStorage] ✅ Video saved successfully at /uploads/videos/abc123.mp4 (45MB)
```

hoặc nếu lỗi:
```
[Generation {id}] Failed to save video locally: Error: ...
[Generation {id}] Falling back to remote video URL
```

## 💾 Database Updates

Video URL được lưu trong bảng `video_generations`:
```sql
UPDATE video_generations 
SET output_url = '/uploads/videos/{generationId}.mp4'
WHERE id = '{generationId}'
```

## 🧹 Xóa Video (Optional)

Nếu cần xóa video cũ, có thể dùng function:
```typescript
import { deleteVideoFile } from "@/lib/video-storage";

await deleteVideoFile(generationId);
```

## 📊 Hiệu Suất

- **Tải xuống**: Tự động lấy từ URL của Runway
- **Lưu trữ**: Local folder (nhanh hơn remote)
- **Không có timeout**: Được xử lý trong background job
- **Supportive Extensions**: mp4, mov, webm, avi, mkv

## ❓ Câu Hỏi Thường Gặp

**Q: Video sẽ bị lưu 2 lần không?**
A: Không. Nó được tải 1 lần từ Runway và lưu local thay vì giữ URL tạm thời.

**Q: Nếu Runway URL hết hạn sao?**
A: Video đã được lưu local, nên không ảnh hưởng. URL local sẽ luôn hoạt động.

**Q: Thư mục videos bao giờ đầy?**
A: Tùy vào dung lượng server. Hiện tại chưa có auto-cleanup, nhưng có thể thêm sau.

**Q: Có thể stream video trực tiếp không?**
A: Có! Sử dụng đường dẫn local `/uploads/videos/{id}.mp4` để stream.

---

**Note**: Tất cả files được tạo hoàn toàn tự động. Không cần thêm bất kỳ manual step nào! 🎉
