# 📋 PRD - Bevita AI CRM System
## Hệ thống Chatbot AI CRM Thông minh cho Tư vấn Da liễu

---

## 1. Tổng quan Dự án (Executive Summary)

### 1.1 Mô tả Dự án
**Bevita AI CRM** là hệ thống tư vấn da liễu tự động thông qua Chatbot AI, tích hợp với Messenger để thu thập thông tin khách hàng, phân tích tình trạng da, và chuyển giao dữ liệu cho đội ngũ tư vấn viên.

### 1.2 Mục tiêu Dự án
- Tự động hóa quy trình tiếp nhận khách hàng 24/7
- Thu thập dữ liệu khách hàng chính xác, có cấu trúc
- Cá nhân hóa trải nghiệm tư vấn theo độ tuổi và vấn đề da
- Tăng hiệu suất chuyển đổi khách hàng tiềm năng
- Tích hợp liền mạch với CRM và hệ thống quản lý

### 1.3 Phạm vi Dự án
| Module | Mô tả |
|--------|--------|
| **Chatbot Intake Form** | Webform tư vấn tích hợp trong Messenger |
| **AI Analysis Engine** | Phân tích hình ảnh da và đề xuất phác đồ |
| **CRM Dashboard** | Quản lý khách hàng và lịch sử tư vấn |
| **NocoDB Backend** | Lưu trữ và quản lý dữ liệu |
| **Messenger Integration** | Kết nối với Messenger Platform |

---

## 2. User Personas

### 2.1 Khách hàng tiềm năng (Lead)
- **Độ tuổi:** 25-55
- **Vấn đề da:** Nám, mụn, lão hóa, da xỉn
- **Hành vi:** Tìm kiếm giải pháp trị nám, chăm sóc da
- **Kênh:** Messenger Facebook
- **Mục tiêu:** Nhận tư vấn nhanh chóng, cá nhân hóa

### 2.2 Tư vấn viên (Consultant)
- **Vai trò:** Xem và xử lý khách hàng
- **Truy cập:** CRM Dashboard
- **Mục tiêu:** Tiếp nhận thông tin đầy đủ, tư vấn hiệu quả

### 2.3 Quản lý (Admin)
- **Vai trò:** Quản lý hệ thống, báo cáo
- **Truy cập:** Full access
- **Mục tiêu:** Theo dõi KPI, tối ưu quy trình

---

## 3. Yêu cầu Chức năng (Functional Requirements)

### 3.1 Chatbot Intake Form

#### 3.1.1 Thu thập Thông tin Cơ bản
| ID | Chức năng | Mô tả |
|----|-----------|--------|
| F01 | Chào hỏi khách hàng | Hiển thị tin nhắn chào hỏi tự động khi khách click link |
| F02 | Hỏi độ tuổi | Xác định nhóm tuổi để cá nhân hóa xưng hô |
| F03 | Hỏi địa điểm | Thu thập tỉnh/thành (ảnh hưởng đến khí hậu và da) |
| F04 | Xác định vấn đề da | Multi-select: Nám, Mụn, Lão hóa, Da xỉn |

#### 3.1.2 Chụp và Phân tích Hình ảnh
| ID | Chức năng | Mô tả |
|----|-----------|--------|
| F05 | Hướng dẫn chụp ảnh | Hướng dẫn 3 góc: Chính diện, Nghiêng trái, Nghiêng phải |
| F06 | Camera integration | Sử dụng camera trong webview để chụp ảnh |
| F07 | Upload ảnh từ gallery | Cho phép chọn ảnh có sẵn |
| F08 | Mô tả da bằng text | Nếu không chụp ảnh được |

#### 3.1.3 Thu thập Lịch sử Điều trị
| ID | Chức năng | Mô tả |
|----|-----------|--------|
| F09 | Lịch sử mỹ phẩm | Loại mỹ phẩm đã dùng |
| F10 | Lịch sử spa/thẩm mỹ | Các liệu trình đã thực hiện |
| F11 | Kết quả điều trị | Đánh giá hiệu quả các liệu trình trước |

#### 3.1.4 Thu thập Thông tin Sức khỏe
| ID | Chức năng | Mô tả |
|----|-----------|--------|
| F12 | Chu kỳ kinh nguyệt | Xác định tình trạng nội tiết |
| F13 | Thai sản | Mang thai, cho con bú, không |
| F14 | Bệnh lý | Các bệnh ảnh hưởng đến điều trị |
| F15 | Thực phẩm chức năng | Vitamin, thuốc bổ đang uống |
| F16 | Giấc ngủ | Chất lượng giấc ngủ |
| F17 | Stress | Mức độ stress |

#### 3.1.5 Xác định Ngân sách
| ID | Chức năng | Mô tả |
|----|-----------|--------|
| F18 | Hỏi ngân sách | Các mức ngân sách từ thấp đến cao |
| F19 | Ghi chú thêm | Thông tin bổ sung từ khách hàng |

#### 3.1.6 Xác nhận và Hoàn tất
| ID | Chức năng | Mô tả |
|----|-----------|--------|
| F20 | Xác nhận số điện thoại | Validate số điện thoại 10 số |
| F21 | Tổng hợp thông tin | Hiển thị tóm tắt trước khi gửi |
| F22 | Gửi form | Lưu dữ liệu vào NocoDB |

### 3.2 Cá nhân hóa theo Độ tuổi

#### 3.2.1 Nhóm < 42 tuổi (Bot: Chị, Khách: Em)
- Xưng hô: Bot là "Chị", gọi khách là "Em"
- Không sử dụng kính ngữ "ạ"
- Nội dung phù hợp: Mụn, da dầu, nám mới

#### 3.2.2 Nhóm ≥ 42 tuổi (Bot: Em, Khách: Chị)
- Xưng hô: Bot là "Em", gọi khách là "Chị"
- Sử dụng kính ngữ "ạ"
- Nội dung phù hợp: Nám nội tiết, lão hóa, da khô

### 3.3 URL Parameters từ Messenger

| Parameter | Mô tả | Ví dụ |
|-----------|--------|--------|
| `fbpageid` | Facebook Page ID | 548047781723675 |
| `fbid` | Facebook User ID | 25928355920110484 |
| `name` | Tên khách hàng | Nguyễn Thanh Tuấn |
| `phone` | Số điện thoại | 0783173341 |
| `nhucau` | Nhu cầu từ AI | anh bị mụn lâu năm |

#### 3.3.1 Xử lý URL Params
- Tự động điền tên, số điện thoại
- Phân tích nhu cầu để xác định vấn đề da
- Skip bước chọn vấn đề da nếu có từ URL

### 3.4 AI Analysis Engine

| ID | Chức năng | Mô tả |
|----|-----------|--------|
| F23 | Phân tích hình ảnh | AI phân tích tình trạng da từ ảnh |
| F24 | Đề xuất phác đồ | Đề xuất sản phẩm và liệu trình |
| F25 | Phân loại nám | Phân biệt nám nông, sâu, hỗn hợp |

### 3.5 CRM Dashboard

| ID | Chức năng | Mô tả |
|----|-----------|--------|
| F26 | Danh sách khách hàng | View tất cả leads |
| F27 | Chi tiết khách hàng | Xem đầy đủ thông tin |
| F28 | Lịch sử tư vấn | Các lần tư vấn trước |
| F29 | Ghi chú tư vấn | Thêm ghi chú sau tư vấn |
| F30 | Chuyển trạng thái | Lead mới → Đang tư vấn → Đã tư vấn |

### 3.6 NocoDB Backend

| ID | Chức năng | Mô tả |
|----|-----------|--------|
| F31 | Lưu thông tin khách hàng | Lưu vào bảng Leads |
| F32 | Lưu hình ảnh da | Lưu URL ảnh vào database |
| F33 | Lưu lịch sử điều trị | Lưu các câu trả lời dạng JSON |
| F34 | Tạo báo cáo | Thống kê và báo cáo |

---

## 4. Yêu cầu Phi Chức năng (Non-Functional Requirements)

### 4.1 Hiệu suất (Performance)
| Chỉ tiêu | Yêu cầu |
|-----------|----------|
| Thời gian tải trang | < 3 giây |
| Thời gian phản hồi Chatbot | < 1 giây |
| Xử lý ảnh | < 5 giây |
| Concurrent users | 100+ users |

### 4.2 Bảo mật (Security)
| Yêu cầu | Mô tả |
|----------|--------|
| Mã hóa dữ liệu | SSL/TLS encryption |
| RBAC | Phân quyền theo vai trò |
| Data privacy | PII được mã hóa |
| Audit log | Log tất cả thao tác |

### 4.3 Trải nghiệm Người dùng (UX)
| Yêu cầu | Mô tả |
|----------|--------|
| Mobile-first | Thiết kế cho mobile trước |
| Offline support | Cache cơ bản khi mất mạng |
| Accessibility | Hỗ trợ screen reader |
| Loading states | Hiển thị loading states |

### 4.4 Khả năng mở rộng (Scalability)
- Microservices architecture
- Container với Docker
- Auto-scaling trên cloud

---

## 5. Kiến trúc Hệ thống (System Architecture)

### 5.1 Sơ đồ Kiến trúc

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FACEBOOK MESSENGER                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │   Click API │    │  Webview    │    │    Bot      │          │
│  │   (Link)    │    │  (Form)     │    │  Messages   │          │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘          │
└─────────┼──────────────────┼──────────────────┼────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         VERCEL (Frontend)                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Chatbot Webform                          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │  Welcome │ → │  Info    │ → │  Photos  │ → │ Health  │    │   │
│  │  │  Screen  │   │  Screen  │   │  Screen  │   │  Screen │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │   │
│  │                         │                                    │   │
│  │                    ┌────▼────┐                             │   │
│  │                    │  State  │                             │   │
│  │                    │ Manager │                             │   │
│  │                    └─────────┘                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Upload API  │  │  NocoDB API  │  │  AI Engine   │          │
│  │  (Images)    │  │  (Data)      │  │  (Analysis)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   NocoDB     │  │  Cloudinary  │  │   Redis      │          │
│  │  (Database)  │  │  (Images)    │  │   (Cache)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Chi tiết Components

#### 5.2.1 Frontend (Vercel)
| Component | Công nghệ | Mô tả |
|-----------|-----------|--------|
| Web App | HTML/CSS/JS | Single page application |
| State Management | Vanilla JS | Quản lý form state |
| Image Handling | JavaScript | Xử lý upload ảnh |
| URL Parser | JavaScript | Parse params từ Messenger |

#### 5.2.2 Backend
| Component | Công nghệ | Mô tả |
|-----------|-----------|--------|
| Database | NocoDB | Lưu trữ dữ liệu CRM |
| Image Storage | Cloudinary | Lưu trữ hình ảnh |
| API Gateway | Vercel Serverless | Handle API requests |

#### 5.2.3 External Integrations
| Integration | Mục đích |
|-------------|----------|
| Facebook Messenger | Giao tiếp với khách hàng |
| Facebook Platform | Lấy thông tin user |
| NocoDB | Backend database |
| Cloudinary | Image CDN |

---

## 6. User Flows

### 6.1 Flow 1: Khách hàng mới từ Messenger

```
┌──────────────┐
│  Click link  │
│   trong      │
│  Messenger   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Chào hỏi    │ ── Hiển thị tên từ FB nếu có
│  + Welcome   │
└──────┬───────┘
       │ [Bắt đầu]
       ▼
┌──────────────┐
│  Chọn độ    │ ── < 42: Em/Chị | ≥ 42: Chị/Em
│  tuổi        │
└──────┬───────┘
       │ [Chọn]
       ▼
┌──────────────┐
│  Chọn địa   │ ── TP.HCM, Hà Nội, Đà Nẵng, khác
│  điểm       │
└──────┬───────┘
       │ [Chọn]
       ▼
┌──────────────┐
│  Chọn vấn   │ ── Nám, Mụn, Lão hóa, Da xỉn
│  đề da      │    (Skip nếu có từ URL params)
└──────┬───────┘
       │ [Tiếp tục]
       ▼
┌──────────────┐
│  Hướng dẫn  │ ── 3 góc chụp
│  chụp ảnh   │
└──────┬───────┘
       │ [Chụp/Skip]
       ▼
┌──────────────┐
│  Hỏi lịch   │ ── Mỹ phẩm đã dùng
│  sử mỹ phẩm  │
└──────┬───────┘
       │ [Tiếp tục]
       ▼
┌──────────────┐
│  Hỏi lịch   │ ── Spa/Thẩm mỹ đã làm
│  sử spa      │
└──────┬───────┘
       │ [Tiếp tục]
       ▼
┌──────────────┐
│  Hỏi sức    │ ── Kinh nguyệt, thai sản, bệnh
│  khỏe       │    ngủ, stress (có thể skip)
└──────┬───────┘
       │ [Tiếp tục]
       ▼
┌──────────────┐
│  Hỏi ngân   │ ── Các mức ngân sách
│  sách       │
└──────┬───────┘
       │ [Tiếp tục]
       ▼
┌──────────────┐
│  Xác nhận   │ ── Hiển thị tóm tắt + SĐT
│  + Gửi form │
└──────┬───────┘
       │ [Gửi]
       ▼
┌──────────────┐
│  Thank you   │ ── Xác nhận + Close webview
│  page        │
└──────────────┘
```

### 6.2 Flow 2: Xử lý URL Params

```
┌──────────────┐
│  User click  │
│  link with   │
│  params      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Parse URL   │
│  params      │
│  - name      │
│  - phone     │
│  - nhucau    │
└──────┬───────┘
       │
       ├──────────────────────┐
       │                      │
       ▼                      ▼
┌──────────────┐      ┌──────────────┐
│  Có nhucau  │      │  Không có    │
│  → Phân tích│      │  nhucau      │
│  vấn đề da  │      │  → Flow bình  │
└──────┬───────┘      │   thường     │
       │              └──────────────┘
       ▼
┌──────────────┐
│  Skip bước   │
│  chọn vấn đề │
│  da          │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Hiển thị    │
│  tin nhắn    │
│  cá nhân hóa │
│  + Loading   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Chuyển     │
│  sang chụp  │
│  ảnh        │
└──────────────┘
```

---

## 7. Data Models

### 7.1 Bảng Leads (NocoDB)

| Field | Type | Mô tả |
|-------|------|--------|
| id | Auto | Primary key |
| Full_Name | SingleLineText | Họ tên khách hàng |
| Phone_Number | Phone | Số điện thoại |
| Age_Group | SingleSelect | < 42 / ≥ 42 |
| Location | SingleLineText | Tỉnh/TP |
| Skin_Condition | MultipleSelect | Nám, Mụn, Lão hóa, Da xỉn |
| Skin_Photos | LongText | URLs ảnh da (JSON) |
| History_Cosmetics | LongText | Lịch sử mỹ phẩm |
| History_Spa | SingleLineText | Lịch sử spa |
| History_Spa_Service | LongText | Các liệu trình đã làm |
| History_Spa_Results | LongText | Kết quả điều trị |
| Health_Status | LongText | Thông tin sức khỏe |
| Supplements | LongText | Thực phẩm chức năng |
| Lifestyle_Sleep | SingleLineText | Giấc ngủ |
| Lifestyle_Stress | SingleLineText | Mức độ stress |
| Budget | SingleSelect | Ngân sách |
| Note | LongText | Ghi chú |
| fb_pid | SingleLineText | Facebook ID |
| fbpageid | SingleLineText | Page ID |
| fbads_id | SingleLineText | Ads ID |
| Status | SingleSelect | New, Contacted, Closed |
| CreatedAt | DateTime | Ngày tạo |
| UpdatedAt | DateTime | Ngày cập nhật |

### 7.2 State Management (Frontend)

```javascript
const state = {
    currentScreen: 'welcome',
    currentStep: 0,
    data: {
        Full_Name: '',
        Phone_Number: '',
        Age_Group: '',
        Location: '',
        Skin_Condition: '',
        // ...
    },
    botPronoun: 'mai',    // em / chị
    userPronoun: 'bạn',  // em / chị
    skinGoals: [],
    skinPhotoUrls: { front: '', left: '', right: '' },
    healthData: {},
    supplements: [],
    spaServices: [],
    // ...
};
```

---

## 8. Tích hợp (Integrations)

### 8.1 Facebook Messenger Integration

| Loại | Implementation |
|------|----------------|
| **Click-to-Messenger** | Sử dụng m.me link với deep link |
| **Webview** | Messenger Extensions SDK |
| **Get Started** | Welcome screen với params |
| **Handover Protocol** | Pass conversation to human agent |

### 8.2 NocoDB Integration

| API Endpoint | Method | Mô tả |
|-------------|--------|--------|
| `/api/v1/tables/{id}/records` | POST | Tạo mới lead |
| `/api/v1/tables/{id}/records/{id}` | PATCH | Cập nhật lead |
| `/api/v1/tables/{id}/records` | GET | Lấy danh sách leads |

### 8.3 Cloudinary Integration

| Feature | Implementation |
|---------|---------------|
| Upload | Direct upload từ client |
| Transform | Resize, crop theo yêu cầu |
| CDN | URL với transformations |

---

## 9. Bảo mật và Compliance

### 9.1 Data Privacy
- ✅ Mã hóa dữ liệu nhạy cảm (PII)
- ✅ An toàn trong truyền tải (TLS 1.3)
- ✅ Chính sách lưu trữ dữ liệu
- ✅ Quyền truy cập dữ liệu (RBAC)

### 9.2 Security Measures
| Measure | Implementation |
|---------|---------------|
| Authentication | Facebook OAuth + Token |
| Authorization | Role-based access |
| Input Validation | Sanitize all inputs |
| Rate Limiting | Prevent abuse |
| Audit Logging | All operations logged |

### 9.3 Compliance
- Tuân thủ GDPR (EU)
- Tuân thủ PDPA (Việt Nam)
- Facebook Platform Policies

---

## 10. Milestones và Timeline

| Phase | Milestone | Thời gian | Deliverables |
|-------|-----------|-----------|--------------|
| **Phase 1** | MVP Launch | Week 1-3 | Chatbot form cơ bản |
| **Phase 2** | Image Analysis | Week 4-6 | AI phân tích hình ảnh |
| **Phase 3** | CRM Dashboard | Week 7-9 | Dashboard quản lý |
| **Phase 4** | Advanced Features | Week 10-12 | Analytics, reports |

---

## 11. Phụ lục

### 11.1 Glossary

| Term | Định nghĩa |
|------|------------|
| **Lead** | Khách hàng tiềm năng |
| **Intake Form** | Biểu mẫu thu thập thông tin |
| **Phác đồ** | Kế hoạch điều trị da |
| **NocoDB** | Database dạng Airtable |
| **Webview** | Trang web trong Messenger |

### 11.2 References

- Facebook Messenger Platform Docs
- NocoDB API Documentation
- Cloudinary Image API
- Vercel Deployment

### 11.3 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-15 | Claude | Initial PRD |

---

*Document generated by Claude Sonnet 4.6*
