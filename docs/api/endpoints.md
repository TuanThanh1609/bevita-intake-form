# API Documentation

Ngày cập nhật: 2026-03-08
Base URL: `Client-side fetch`

---

## 🔗 NocoDB API - `muwldo248riapzx`

Base URL: `https://nocodb.smax.in/api/v2/tables/muwldo248riapzx/records` (Proxy via `/api/submit`)

### 1. POST - Tạo Lead mới / Lưu nháp
Dùng khi khách bắt đầu tương tác hoặc chưa có `nocoDbId`.

**Payload (JSON):**
```json
{
  "Full_Name": "Tên khách",
  "Age_Group": "30-42",
  "fb_pid": "...",
  "last_step": "age"
}
```

### 2. PATCH - Cập nhật thông tin / Hoàn tất flow
Dùng để update record hiện có qua trường `Id`.

> [!IMPORTANT]
> **NocoDB V2 PATCH requirement:** Payload gửi lên `/api/submit` (PATCH) phải được bọc trong một **MẢNG (Array)**.
> Example: `[{ "Id": 123, "Phone_Number": "090...", "last_step": "completed" }]`

**Proxy logic (`api/submit.js`):**
Hệ thống tự động wrap payload trong `[]` nếu method là PATCH trước khi forward tới NocoDB.
  "History_Spa": "Chưa bao giờ",
  "Current_Routine": "Srm Cerave, Toner cocoon",
  "Routine_Photos": "url_to_routine_1.jpg",
  "Health_Status": "Đang mang thai, Tiêu hoá kém",
  "Supplements": "Vitamin C, Kẽm",
  "Lifestyle_Stress": "Thỉnh thoảng",
  "Budget": "1–3 triệu",
  "Status": "new"
}
```

**Response (200):**
```json
{
  "Id": 123,
  "Phone_Number": "0901234567",
  "Full_Name": "Nguyễn Văn A",
  ...
}
```

---

## 🖼️ ImgBB Integration

### POST ImgBB `https://api.imgbb.com/1/upload`
Upload ảnh lên ImgBB để lấy URL lưu trữ (ảnh đã được resize client-side <= 1200px).

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| key | string | API key của ImgBB |

**Request Body (FormData):**
- `image`: File blob base64 (đã loại bỏ prefix data:image/jpeg;base64,)

**Response (200):**
```json
{
  "data": {
    "url": "https://i.ibb.co/example/image.jpg",
    "display_url": "...",
    ...
  },
  "success": true,
  "status": 200
}
```
