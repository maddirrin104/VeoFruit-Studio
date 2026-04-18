# Tính Năng Tự Động Lưu Video

## Mô Tả
Sau khi video được tạo thành công bằng Runway Gen4.5, hệ thống sẽ **tự động tải xuống** video từ URL gốc (remote) và **lưu vào thư mục local** của ứng dụng.

## Cách Hoạt Động

### Flow Tạo Video
1. **Tạo Video** → Runway Gen4.5 sinh ra video từ prompt
2. **Runway trả về URL gốc** → URL này là link tạm thời từ server Runway
3. **Tải xuống & Lưu Local** → Hệ thống tự động tải video xuống và lưu vào `/public/uploads/videos/`
4. **Cập nhật Database** → Database lưu đường dẫn local thay vì URL gốc

### Thư Mục Lưu Trữ
```
VeoFruit-Studio/
├── public/
│   └── uploads/
│       └── videos/          ← Video được lưu ở đây
│           ├── {generationId}.mp4
│           ├── {generationId}.mov
│           └── ...
```

### Định Dạng Video
- Hệ thống tự động phát hiện định dạng từ URL gốc
- Hỗ trợ: `mp4`, `mov`, `webm`, `avi`, `mkv`
- Mặc định: `mp4` nếu không phát hiện được

## Lợi Ích
✅ Video luôn có sẵn (không phụ thuộc URL tạm thời của Runway)
✅ Tốc độ tải nhanh hơn (local storage)
✅ Không cần lo URL hết hạn
✅ Dễ dàng quản lý video trên server

## Xử Lý Lỗi
Nếu lưu local không thành công, hệ thống sẽ:
1. Ghi log lỗi chi tiết
2. Fallback về URL gốc từ Runway
3. Video vẫn được lưu vào database và có thể truy cập

## Cấu Hình
Không cần cấu hình thêm! Tính năng này hoạt động tự động mỗi khi video được tạo.

## File Liên Quan
- **`src/lib/video-storage.ts`** - Utility chính xử lý tải & lưu video
- **`src/app/api/generations/route.ts`** - API route tạo video, đã được cập nhật
- **`.gitignore`** - Đã thêm `/public/uploads/` để tránh commit file media

## API Functions

### `downloadAndSaveVideo(videoUrl, generationId)`
- **Tác dụng**: Tải video từ URL và lưu vào local
- **Tham số**:
  - `videoUrl` (string): URL của video cần tải
  - `generationId` (string): ID generation để đặt tên file
- **Trả về**: Đường dẫn local (vd: `/uploads/videos/uuid-123.mp4`)
- **Xử lý**: Tự động tạo thư mục nếu chưa tồn tại

### `deleteVideoFile(generationId)`
- **Tác dụng**: Xóa file video đã lưu
- **Tham số**: `generationId` (string)
- **Ghi chú**: Tự động kiểm tra các định dạng khác nhau

### `getVideoFilePath(generationId, extension)`
- **Tác dụng**: Lấy đường dẫn đầy đủ của file video
- **Tham số**:
  - `generationId` (string)
  - `extension` (string, optional): Mặc định `"mp4"`
- **Trả về**: Full path (vd: `d:\...\public\uploads\videos\uuid-123.mp4`)

## Ví Dụ Log Khi Tạo Video

```
[Generation 550e8400-e29b-41d4-a716-446655440000] Starting Runway video generation...
...
[VideoStorage] Downloading video from https://runway.com/temp/video.mp4...
[VideoStorage] ✅ Video saved successfully at /uploads/videos/550e8400-e29b-41d4-a716-446655440000.mp4 (45678900 bytes)
[Generation 550e8400-e29b-41d4-a716-446655440000] ✅ Generation completed!
```

## Cách Truy Cập Video
Sau khi tạo, video có thể truy cập qua:
```
http://localhost:3000/uploads/videos/{generationId}.mp4
```

hoặc lấy qua API:
```
GET /api/generations?projectId={projectId}
```

Trả về `outputUrl` là đường dẫn local.
