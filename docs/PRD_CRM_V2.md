# 📋 PRD - BEVITA CRM V2
## Hệ thống Quản lý Khách hàng & Tư vấn Da liễu

---

## 1. Tổng quan

### 1.1 Mô tả Dự án
**BEVITA CRM V2** là hệ thống quản lý khách hàng dành riêng cho skincare clinic, tích hợp với Chatbot AI để theo dõi toàn bộ customer journey từ lead mới đến khách hàng trung thành.

### 1.2 Mục tiêu
- Theo dõi và quản lý leads real-time
- Hỗ trợ tư vấn viên quản lý khách hàng hiệu quả
- Tự động hóa quy trình follow-up
- Đo lường hiệu suất tư vấn

---

## 2. User Personas

### 2.1 Tư vấn viên (Consultant)
- **Vai trò:** Tiếp nhận và chăm sóc khách hàng
- **Truy cập:** CRM Dashboard, xem và cập nhật leads được giao
- **Mục tiêu:** Tăng tỷ lệ chốt đơn, theo dõi progress từng khách

### 2.2 Quản lý (Manager)
- **Vai trò:** Giám sát toàn bộ pipeline
- **Truy cập:** Full access + Báo cáo
- **Mục tiêu:** KPI metrics, phân bổ leads, đào tạo team

### 2.3 Admin
- **Vai trò:** Cấu hình hệ thống
- **Truy cập:** Full access + Settings
- **Mục tiêu:** Quản lý users, templates, automation

---

## 3. Yêu cầu Chức năng

### 3.1 Dashboard Overview

#### 3.1.1 Metrics Cards
| Metric | Mô tả | Công thức |
|--------|--------|----------|
| **Leads hôm nay** | Số leads mới trong ngày | COUNT WHERE CreatedAt = today |
| **AI Auto Rate** | % leads đi qua AI intake tự động | (Leads có nhucau / Tổng leads) * 100 |
| **Follow-up active** | Số leads đang chờ follow-up | COUNT WHERE follow_up_status = 'active' |
| **Chờ phản hồi** | Số leads chưa được liên hệ > 24h | COUNT WHERE last_response < 24h |

#### 3.1.2 Leads Table
| Column | Mô tả |
|--------|--------|
| **Khách hàng** | Tên + SĐT |
| **Nguồn** | Zalo OA, Facebook Ads, Messenger, Website |
| **Giai đoạn** | Mới tiếp nhận, Khảo sát da, Đang tư vấn, Chờ phản hồi, Đã chốt |
| **Bước** | 1/7 - 7/7 (7-step flow) |
| **Thiếu data** | Các trường còn thiếu (hình da, ngân sách, etc.) |
| **Phản hồi cuối** | Thời gian phản hồi gần nhất |
| **Trạng thái** | Active, Waiting, Completed |

### 3.2 Lead Detail View

#### 3.2.1 Header
- Tên khách hàng
- Số điện thoại
- Ngày tạo lead
- Progress bar (1/7 bước)

#### 3.2.2 Step Cards (B1-B7)
| Step | Tên | Status Options |
|------|------|----------------|
| B0 | Tiếp nhận | Hoàn thành |
| B1 | Thông tin cơ bản + Hình ảnh | Hoàn thành, Đang xử lý, Chờ |
| B2 | Mỹ phẩm & Dịch vụ làm đẹp | Hoàn thành, Đang xử lý, Chờ |
| B3 | Sức khỏe & Lối sống | Hoàn thành, Đang xử lý, Chờ |
| B4 | Ngân sách | Hoàn thành, Đang xử lý, Chờ |
| B5 | Xác nhận SĐT & Kết nối | Hoàn thành, Đang xử lý, Chờ |
| B6 | Tư vấn phác đồ | Hoàn thành, Đang xử lý, Chờ |

#### 3.2.3 Right Sidebar
1. **Hành động sắp theo**
   - Nút gọi điện
   - Nút nhắn tin
   - Nút hẹn lịch
   - Dropdown chọn hành động tiếp theo

2. **Biểu đồ tương tác**
   - Pie chart: Zalo, Facebook, Website, Điện thoại
   - Tổng số tương tác

3. **Thông tin KH**
   - Tuổi
   - Vấn đề da quan tâm
   - Ngân sách quan tâm
   - Lịch sử mua hàng

4. **Đội ngũ hỗ trợ**
   - Tư vấn viên phụ trách
   - Coach phụ trách
   - Ngày tiếp nhận

### 3.3 Smart Intake Tab
- Hiển thị 7 bước kịch bản
- Tỷ lệ hoàn thành trung bình
- Thời gian trung bình mỗi bước
- Drop-off rate từng bước

### 3.4 Tin chào & Ngoại lệ
- Template tin nhắn chào
- Quy trình xử lý ngoại lệ (không chụp hình, không cung cấp SĐT, etc.)
- FAQ tự động

---

## 4. Data Model (NocoDB Schema)

### 4.1 Bảng Leads (Mở rộng)

```javascript
const leadsSchema = {
    // ── Thông tin cơ bản (đã có) ──
    Full_Name: 'SingleLineText',
    Phone_Number: 'Phone',
    Age_Group: 'SingleSelect',
    Location: 'SingleLineText',
    Skin_Condition: 'MultipleSelect',

    // ── CRM Tracking (MỚI) ──
    current_step: 'Number',           // 1-7
    step_status: 'SingleSelect',       // 'hoan_thanh', 'dang_xu_ly', 'cho'
    nguon: 'SingleSelect',            // 'Zalo OA', 'Facebook Ads', 'Messenger', 'Website', 'Referral'
    trang_thai: 'SingleSelect',        // 'Mới tiếp nhận', 'Khảo sát da', 'Đang tư vấn', 'Chờ KH phản hồi', 'Đã chốt', 'Không tiềm năng'

    // ── Tư vấn viên (MỚI) ──
    tu_van_vien: 'User',              // Gán consultant
    coach: 'User',                    // Gán coach
    ngay_tiep_nhan: 'DateTime',       // Ngày tiếp nhận

    // ── Follow-up (MỚI) ──
    follow_up_status: 'SingleSelect',  // 'active', 'waiting', 'completed'
    follow_up_count: 'Number',         // Số lần follow-up
    next_follow_up: 'DateTime',        // Lịch follow-up tiếp theo
    last_response: 'DateTime',         // Phản hồi cuối

    // ── Tương tác (MỚI) ──
    tuong_tac_zalo: 'Number',          // Số tin nhắn Zalo
    tuong_tac_facebook: 'Number',     // Số tin nhắn Facebook
    tuong_tac_website: 'Number',       // Số lần truy cập website
    tuong_tac_dien_thoai: 'Number',    // Số cuộc gọi

    // ── Ghi chú & Lịch sử (MỚI) ──
    tu_van_vien_notes: 'LongText',    // Ghi chú từ tư vấn
    lich_su_tuvan: 'LongText',        // JSON array các lần tư ván
    lich_su_mua_hang: 'LongText',     // JSON array các đơn hàng

    // ── Timestamps (MỚI) ──
    last_contacted: 'DateTime',
    han_tiep_nhan: 'DateTime',        // Hạn tiếp nhận (để track SLA)
    last_updated_by: 'User',          // Ai cập nhật cuối
};
```

### 4.2 Bảng Users (NocoDB Users)
```javascript
const usersSchema = {
    name: 'SingleLineText',
    email: 'Email',
    role: 'SingleSelect',            // 'admin', 'manager', 'consultant'
    team: 'SingleSelect',             // 'team_a', 'team_b', 'team_c'
    avatar: 'URL',
    phone: 'Phone',
    status: 'SingleSelect',           // 'active', 'inactive'
};
```

### 4.3 Bảng Follow-ups
```javascript
const followUpsSchema = {
    lead_id: 'LinkToLeads',
    tu_van_vien: 'User',
    type: 'SingleSelect',            // 'call', 'zalo', 'facebook', 'meeting'
    note: 'LongText',
    next_action: 'SingleSelect',     // 'call_again', 'send_quote', 'schedule', 'close'
    scheduled_at: 'DateTime',
    completed_at: 'DateTime',
    status: 'SingleSelect',          // 'pending', 'completed', 'cancelled'
};
```

---

## 5. UI/UX Design

### 5.1 Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Primary Green | #10B981 | Main actions, success states |
| Secondary Green | #059669 | Hover states |
| Accent | #F59E0B | Warnings, pending |
| Danger | #EF4444 | Errors, urgent |
| Background | #F9FAFB | Page background |
| Surface | #FFFFFF | Cards, panels |
| Text Primary | #111827 | Main text |
| Text Secondary | #6B7280 | Secondary text |

### 5.2 Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HEADER BAR                                  │
│  Logo    │  Search    │  Notifications (5)  │  User Profile       │
├──────────┴────────────┴─────────────────────┴─────────────────────┤
│         │                                                          │
│ SIDEBAR │                    MAIN CONTENT                          │
│         │                                                          │
│ Dashboard│  ┌─────────────────────────────────────────────────────┐ │
│ Smart    │  │ BREADCRUMB: BEVITA CRM > Dashboard               │ │
│  Intake ✓│  ├─────────────────────────────────────────────────────┤ │
│ Skin     │  │ METRICS ROW (4 cards)                             │ │
│  Profile │  ├─────────────────────────────────────────────────────┤ │
│ RX       │  │ TABS: Leads │ Kịch bản │ Tin chào │ FAQ         │ │
│  Protocol│  ├─────────────────────────────────────────────────────┤ │
│ AI Engine│  │ LEADS TABLE                                       │ │
│ Inbox (5)│  │ - Sortable columns                                │ │
│ Revenue  │  │ - Pagination                                      │ │
│ Retention│  │ - Row click → Detail view                        │ │
│ ...      │  └─────────────────────────────────────────────────────┘ │
│         │                                                          │
└──────────┴──────────────────────────────────────────────────────────┘
```

### 5.3 Lead Detail Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Back   │  TÊN KHÁCH HÀNG    │  SĐT    │  Created: XX/XX/XXXX │
├───────────┴──────────────────────────────────────────────────────────┤
│  PROGRESS: [███████░░░] 3/7 bước                                  │
├────────────────────────────────────┬────────────────────────────────┤
│                                    │                                │
│  STEP CARDS (B1-B6)               │  RIGHT SIDEBAR                 │
│  ┌────────────────────────────┐   │  ┌────────────────────────┐   │
│  │ B1: Thông tin cơ bản     │   │  │ 🔜 Hành động tiếp theo│   │
│  │ Status: Hoàn thành ✓     │   │  │ [Gọi điện] [Nhắn tin] │   │
│  └────────────────────────────┘   │  │ [Hẹn lịch]             │   │
│  ┌────────────────────────────┐   │  └────────────────────────┘   │
│  │ B2: Mỹ phẩm & Spa        │   │  ┌────────────────────────┐   │
│  │ Status: Đang xử lý 🔄    │   │  │ 📊 Tương tác           │   │
│  └────────────────────────────┘   │  │ Zalo: 5  FB: 2  Web: 1│   │
│  ...                              │  └────────────────────────┘   │
│                                    │  ┌────────────────────────┐   │
│                                    │  │ 👤 Thông tin KH         │   │
│                                    │  │ Tuổi: 28               │   │
│                                    │  │ Da: Nám, Mụn           │   │
│                                    │  │ Ngân sách: 3-5 triệu   │   │
│                                    │  └────────────────────────┘   │
│                                    │  ┌────────────────────────┐   │
│                                    │  │ 👥 Đội ngũ hỗ trợ     │   │
│                                    │  │ TVV: Nguyễn Văn A     │   │
│                                    │  │ Coach: Trần Thị B      │   │
│                                    │  └────────────────────────┘   │
└────────────────────────────────────┴────────────────────────────────┘
```

---

## 6. API Endpoints

### 6.1 Leads API
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/v1/tables/{id}/records` | Lấy danh sách leads |
| GET | `/api/v1/tables/{id}/records/{id}` | Lấy chi tiết lead |
| PATCH | `/api/v1/tables/{id}/records/{id}` | Cập nhật lead |
| POST | `/api/v1/tables/{id}/records` | Tạo lead mới |

### 6.2 CRM-specific Endpoints (Serverless)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/crm/leads` | Lấy leads với filters |
| GET | `/api/crm/leads/:id` | Chi tiết lead + related data |
| PATCH | `/api/crm/leads/:id/status` | Chuyển trạng thái |
| POST | `/api/crm/leads/:id/assign` | Gán TVV |
| POST | `/api/crm/leads/:id/note` | Thêm ghi chú |
| GET | `/api/crm/metrics` | Lấy metrics dashboard |
| POST | `/api/crm/followups` | Tạo lịch follow-up |

---

## 7. Milestones

| Phase | Milestone | Deliverable |
|-------|-----------|-------------|
| **Phase 1** | Dashboard + Leads Table | Metrics cards, table view |
| **Phase 2** | Lead Detail View | 7-step progress, sidebar |
| **Phase 3** | Assignment & Notes | Gán TVV, ghi chú |
| **Phase 4** | Follow-up System | Lịch follow-up, reminders |
| **Phase 5** | Reports & Analytics | Charts, KPIs |

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Leads hôm nay | 20+ |
| Tỷ lệ auto intake | 80%+ |
| Thời gian phản hồi trung bình | < 15 phút |
| Tỷ lệ chốt đơn | 25%+ |

---

*PRD generated: 2026-03-16*
*Based on: 2 CRM screenshots provided by user*
