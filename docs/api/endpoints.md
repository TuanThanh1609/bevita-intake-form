# API Documentation

Ngày cập nhật: 2026-03-08
Base URL: `Client-side fetch`

---

## 📝 NocoDB Integration

### POST NocoDB `/api/v2/tables/muwldo248riapzx/records`
Tạo bản ghi mới để lưu trữ hồ sơ tư vấn da của khách hàng.

**Headers:**
```
xc-token: {NOCODB_TOKEN}
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "Phone_Number": "0901234567",
  "Full_Name": "Nguyễn Văn A",
  "Age_Group": "25–34 tuổi",
  "Location": "TP.HCM",
  "Skin_Condition": "Mụn nội tiết, Thâm đỏ",
  "Note": "Khách hàng muốn tư vấn chi tiết về mụn",
  "Skin_Photos": "url_to_image_1.jpg, url_to_image_2.jpg",
  "History_Cosmetics": "Dùng dược mỹ phẩm",
  "History_Spa": "Chưa bao giờ",
  "Current_Routine": "Srm Cerave, Toner cocoon",
  "Routine_Photos": "url_to_routine_1.jpg",
  "Health_Status": "Đang mang thai, Tiêu hoá kém",
  "Supplements": "Vitamin C, Kẽm",
  "Lifestyle_Sleep": "Trước 11h đêm",
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
