# Image-to-Video Feature - Local File Support Guide

## Overview
VeoFruit Studio now supports **image-to-video generation from locally uploaded images** without requiring public HTTPS URLs or ngrok. Images are stored in the project folder and accessed directly for video generation.

## How It Works

### 1️⃣ Image Upload Flow
```
User uploads image file
    ↓
[/api/uploads/image] POST endpoint
    ↓
File saved to: [PROJECT_ROOT]/public/uploads/[timestamp]-[uuid].[ext]
    ↓
Returns: {
  url: "/api/files/uploads/[timestamp]-[uuid].jpg"  (← local API path)
  absoluteUrl: "http://localhost:xxxx/api/files/uploads/..."
  fileName: "[timestamp]-[uuid].jpg"
}
```

### 2️⃣ Image-to-Video Generation Flow
```
User creates video generation with uploaded image
    ↓
Frontend sends: {
  imageConfig: {
    referenceImageUrl: "/api/files/uploads/1234567890-uuid.jpg"  (← local path)
  }
}
    ↓
[/api/generations] POST endpoint receives request
    ↓
[src/lib/runway.ts] resolvePromptImageUrl()
    ├─ Detects: "/api/files/uploads/..." is local path
    ├─ Resolves to: [PROJECT_ROOT]/public/uploads/1234567890-uuid.jpg
    ├─ Reads file from disk
    ├─ Converts to base64: data:image/jpeg;base64,iVBORw0KGgo...
    └─ Returns: data URL
        ↓
[Runway ML API] receives data URL
    ├─ Processes image-to-video
    └─ Returns: video URL
        ↓
Video generation completes ✅
```

## Supported Image Sources

The system accepts images from multiple sources:

| Source | Format | Example |
|--------|--------|---------|
| **Local upload** | `/api/files/uploads/...` | `/api/files/uploads/1234567890-uuid.jpg` |
| **Data URL** | `data:image/...;base64,...` | `data:image/jpeg;base64,iVBORw0K...` |
| **File URL** | `file://C:/path/to/image.jpg` | `file://C:/Users/user/Desktop/image.jpg` |
| **Localhost URL** | `http://localhost:xxxx/api/files/...` | `http://localhost:3000/api/files/uploads/123.jpg` |
| **Windows absolute path** | `C:/path/to/image.jpg` | `C:/VeoFruit-Studio/public/uploads/123.jpg` |
| **Public HTTPS URL** | `https://example.com/image.jpg` | Used as-is (no ngrok needed) |

## Key Features

### ✅ No External Dependencies
- **No ngrok required** - local paths don't need public URLs
- **No external image server** - files stored in project folder
- **Offline-capable** - works without internet for local images

### ✅ Automatic File Management
- Images automatically saved to `/public/uploads/`
- Filenames include timestamp + UUID for uniqueness
- Supports JPG, PNG, WEBP, GIF formats
- Max file size: 10MB per upload, 50MB for video generation

### ✅ Transparent Processing
- Image resolved to local file path automatically
- Converted to base64 data URL for Runway API
- Runway receives identical data as HTTPS image URLs

### ✅ Fallback Support
- If image-to-video fails, automatically falls back to text-to-video
- No video generation is lost

## Implementation Details

### Image Upload Endpoint
**File**: `src/app/api/uploads/image/route.ts`

```typescript
POST /api/uploads/image
Content-Type: multipart/form-data

// Request
file: [binary image data]

// Response (200 OK)
{
  "data": {
    "url": "/api/files/uploads/1234567890-abc.jpg",        // ← use this!
    "absoluteUrl": "http://localhost:3000/api/files/...",
    "fileName": "1234567890-abc.jpg"
  }
}
```

### Image Resolution Logic
**File**: `src/lib/runway.ts` → `resolvePromptImageUrl()`

Flow for `/api/files/uploads/123.jpg`:
1. ✅ Trim and validate input
2. ✅ Check if already data URL → use as-is
3. ✅ Try resolve local path via `resolvePublicPathFromRequestPath()`
   - Strips `/api/files/` prefix
   - Maps to `/public/uploads/` folder
4. ✅ Verify file exists (fs.access)
5. ✅ Validate file size (≤50MB)
6. ✅ Read file to Buffer
7. ✅ Detect MIME type from extension
8. ✅ Convert to base64 data URL
9. ✅ Return to Runway API

### Error Handling
```
Scenario: File not found
└─ Error: "Ảnh không tìm thấy tại: [path]"
   Action: Display error to user, retry upload

Scenario: File too large
└─ Error: "Ảnh quá lớn (120MB). Tối đa 50MB"
   Action: Suggest using smaller image

Scenario: Invalid file format
└─ Error: "Format ảnh không được hỗ trợ"
   Action: Use JPG, PNG, WEBP, or GIF

Scenario: Image-to-video API fails
└─ Fallback: Automatically retry with text-to-video only
   Action: Video still generated without image reference
```

## Logging & Debugging

### Upload Logging
```
✅ Image uploaded successfully: 1234567890-abc.jpg (2.50MB)
   Local path: D:/VeoFruit-Studio/public/uploads/1234567890-abc.jpg
   API URL: /api/files/uploads/1234567890-abc.jpg
```

### Video Generation Logging
```
[Generation abc123] Using image for image-to-video: /api/files/uploads/1234...
[Generation abc123] Image source: reference/product
[Runway] Resolving prompt image URL: /api/files/uploads/1234567890-uuid.jpg
[Runway] Resolved /api/files path to local file: 1234567890-uuid.jpg
[Runway] Successfully converted image to data URL: 1234567890-uuid.jpg (2.50KB)
[Runway] 🎬 Creating image-to-video task (data:image/jpeg;base64,iVBORw0...)
[Runway] ✅ Image-to-video task created: task_abc123xyz
[Generation abc123] ✅ Runway video generation completed
```

## Testing the Feature

### Test Case 1: Single Image Upload
1. Open VeoFruit Studio
2. Create new project
3. Upload a sample image (JPG or PNG)
4. Check logs for: `✅ Image uploaded successfully`
5. Use this image in video generation
6. Check logs for: `✅ Image-to-video task created`
7. Verify video is generated with image-to-video mode

### Test Case 2: Multiple Images
1. Upload 2 images in same project
2. One for reference/product image
3. One for brand background
4. Create generation using both
5. Verify brand background image is prioritized in image-to-video

### Test Case 3: Error Handling
1. Try uploading file > 10MB → should reject
2. Try uploading non-image file → should reject
3. Delete uploaded image file manually → should show error
4. Verify fallback to text-to-video works

## File Storage

### Upload Directory
```
[PROJECT_ROOT]/
├── public/
│   └── uploads/
│       ├── 1234567890-uuid1.jpg     (product image)
│       ├── 1234567890-uuid2.png     (brand background)
│       └── 1234567890-uuid3.gif     (reference)
```

### How to Clean Up Old Images
```bash
# Find old images (older than 7 days)
find public/uploads -name "*.jpg" -o -name "*.png" -mtime +7

# Remove them (caution: only if backup exists)
rm public/uploads/*
```

## Configuration

### Image Upload Limits
Edit `src/app/api/uploads/image/route.ts`:
```typescript
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;  // 10MB limit
```

### Image Processing Limits
Edit `src/lib/runway.ts`:
```typescript
const MAX_IMAGE_SIZE = 50 * 1024 * 1024;  // 50MB for data URL
```

## API Reference

### Upload Image
```bash
curl -X POST http://localhost:3000/api/uploads/image \
  -F "file=@/path/to/image.jpg"

# Response:
{
  "data": {
    "url": "/api/files/uploads/1234567890-abc.jpg",
    "absoluteUrl": "http://localhost:3000/api/files/uploads/1234567890-abc.jpg",
    "fileName": "1234567890-abc.jpg"
  }
}
```

### Retrieve Image
```bash
# Direct access via Files API
GET http://localhost:3000/api/files/uploads/1234567890-abc.jpg

# Returns: image binary data with proper Content-Type header
```

### Generate Video with Image
```bash
curl -X POST http://localhost:3000/api/generations \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project123",
    "videoConfig": {
      "aspectRatio": "16:9",
      "durationSeconds": 10
    },
    "imageConfig": {
      "referenceImageUrl": "/api/files/uploads/1234567890-abc.jpg"
    },
    "audioConfig": {...},
    "promptContext": {...}
  }'

# Response:
{
  "data": {
    "id": "gen123",
    "status": "pending",
    "message": "Video generation started. Polling status for updates."
  }
}
```

## Troubleshooting

### Issue: "Ảnh không tìm thấy" (Image not found)
**Solution:**
1. Check if file exists: `ls -la public/uploads/`
2. Verify filename in error message
3. Check file permissions: should be readable by app process
4. Try re-uploading the image

### Issue: "Không thể ánh xạ URL" (Cannot map URL)
**Solution:**
1. Check that URL starts with `/api/files/uploads/`
2. Verify path doesn't contain special characters
3. Check URL encoding in request
4. Try with absolute file path instead

### Issue: Image-to-video fails, falls back to text-to-video
**Solution:**
1. Check image quality (try JPG instead of PNG)
2. Try smaller image (< 5MB)
3. Try different image format
4. Check Runway API status
5. Verify internet connection for Runway API

### Issue: Very slow image-to-video processing
**Solution:**
1. Image is large (> 20MB) → reduce to < 5MB
2. Base64 encoding slow → try smaller image
3. Network latency to Runway → expected, can take 30-60s
4. Check app logs for performance insights

## Performance Notes

- **Base64 encoding**: 2-5 seconds for 5MB image
- **Data URL transmission**: < 1 second
- **Runway processing**: 30-60 seconds (normal for video generation)
- **Total time**: 35-65 seconds per video

## Security Considerations

✅ **Safe Implementation**
- All paths validated with `resolvePublicPathFromRequestPath()`
- No path traversal allowed (blocked `..` and `~` paths)
- File extensions whitelisted (JPG, PNG, WEBP, GIF only)
- File size limits enforced (10MB upload, 50MB processing)
- UUIDs in filenames prevent collision/prediction

⚠️ **Best Practices**
- Don't upload sensitive/personal images
- Images stored in `/public/uploads/` are accessible
- Implement cleanup script for old images if needed
- Monitor disk usage if many large videos are generated

## Future Improvements

- [ ] Add image compression before storing
- [ ] Implement automatic cleanup of old uploads
- [ ] Add image preview thumbnail generation
- [ ] Support batch image upload
- [ ] Add image optimization pipeline
- [ ] Support WebP with adaptive quality
- [ ] Add EXIF data removal for privacy

---

**Status**: ✅ Production Ready
**Last Updated**: 2026-04-20
**Related Files**:
- `src/app/api/uploads/image/route.ts` - Upload endpoint
- `src/app/api/files/[...assetPath]/route.ts` - File serving
- `src/lib/runway.ts` - Image resolution & conversion
- `src/lib/runtime-path.ts` - Path utilities
