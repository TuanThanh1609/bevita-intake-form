# 🧪 TEST CHECKLIST - Bevita AI CRM Chatbot

---

## 📋 HƯỚNG DẪN TEST

**Link test:** https://bevita-intake-form.vercel.app/

**Cách test:**
1. Mở link trên trình duyệt (nên dùng Incognito mode)
2. Test theo từng bước bên dưới
3. Check các điểm mấu chốt:
   - ✅ Nội dung hiển thị đúng
   - ✅ Xưng hô đúng theo nhóm tuổi
   - ✅ Các button có hoạt động
   - ✅ Transition mượt mà
   - ✅ Không có lỗi console

---

## 🔷 BƯỚC 1: THÔNG TIN CƠ BẢN

### Test Case 1.1: Welcome Screen
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 1.1.1 | Hiển thị màn hình welcome | ✅ Có avatar Bevita, tin chào | ⬜ |
| 1.1.2 | Nút "Mình sẵn sàng rồi!" | ✅ Click được, chuyển sang age | ⬜ |
| 1.1.3 | Nút "Để lúc khác" | ✅ Click được, chuyển sang later | ⬜ |

### Test Case 1.2: Age Screen
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 1.2.1 | Câu hỏi hiển thị | "Bạn đang ở độ tuổi nào?" | ⬜ |
| 1.2.2 | Các options hiển thị | ✅ Dưới 25, 25-34, 35-42, Trên 42 | ⬜ |
| 1.2.3 | Click "Dưới 25 tuổi" | ✅ Bot xưng "Chị", gọi khách "Em" | ⬜ |
| 1.2.4 | Click "Trên 42 tuổi" | ✅ Bot xưng "Em", gọi khách "Chị" | ⬜ |
| 1.2.5 | Auto chuyển Location | ✅ Sau 300ms | ⬜ |

### Test Case 1.3: Location Screen
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 1.3.1 | Câu hỏi hiển thị | "Bạn đang sống ở tỉnh/thành nào?" | ⬜ |
| 1.3.2 | Các options | ✅ TP.HCM, Hà Nội, Đà Nẵng, Khác | ⬜ |
| 1.3.3 | Click option | ✅ Highlight + chuyển sang Skin | ⬜ |
| 1.3.4 | Input "Khác" | ✅ Nhập được + submit | ⬜ |

### Test Case 1.4: Skin Condition Screen
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 1.4.1 | Câu hỏi hiển thị | "Bạn đang muốn cải thiện vấn đề da nào nhất?" | ⬜ |
| 1.4.2 | Các options | ✅ Nám, Mụn, Lão hóa, Da xỉn | ⬜ |
| 1.4.3 | Multi-select | ✅ Chọn được nhiều | ⬜ |
| 1.4.4 | Nút "Tiếp tục" | ✅ Hiện sau khi chọn ít nhất 1 | ⬜ |
| 1.4.5 | Click "Tiếp tục" | ✅ Chuyển sang Photo | ⬜ |

### Test Case 1.5: Photo Skin Screen
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 1.5.1 | Câu hỏi hiển thị | "Để xem tình trạng da thật sự..." | ⬜ |
| 1.5.2 | Hướng dẫn 3 góc | ✅ Thẳng, Trái, Phải | ⬜ |
| 1.5.3 | Tips chụp đẹp | ✅ Hiển thị | ⬜ |
| 1.5.4 | Wizard UI | ✅ Có 3 slot ảnh | ⬜ |
| 1.5.5 | Upload ảnh | ✅ Click được | ⬜ |
| 1.5.6 | Nút "Chụp xong gửi sau" | ✅ Skip được | ⬜ |

---

## 🔷 BƯỚC 2: LỊCH SỬ MỸ PHẨM & ĐIỀU TRỊ

### Test Case 2.1: < 42 tuổi (Bot: Chị)
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 2.1.1 | Bot xưng | ✅ "Chị" (không "ạ") | ⬜ |
| 2.1.2 | Gọi khách | ✅ "Em" | ⬜ |
| 2.1.3 | Câu hỏi mỹ phẩm | "Em đã từng dùng loại mỹ phẩm nào..." | ⬜ |
| 2.1.4 | Options | ✅ Dược mỹ phẩm, Mỹ phẩm thường, Kem trộn | ⬜ |
| 2.1.5 | Câu hỏi spa | "Em đã từng đến spa..." | ⬜ |
| 2.1.6 | Kết quả spa | ✅ Khác nhau theo age | ⬜ |

### Test Case 2.2: ≥ 42 tuổi (Bot: Em)
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 2.2.1 | Bot xưng | ✅ "Em" (có "ạ") | ⬜ |
| 2.2.2 | Gọi khách | ✅ "Chị" | ⬜ |
| 2.2.3 | Câu hỏi mỹ phẩm | "Các loại mỹ phẩm chị đã từng dùng... là của hãng nào ạ?" | ⬜ |
| 2.2.4 | Options | ✅ Dược mỹ phẩm, Cao cấp, Bác sĩ kê | ⬜ |
| 2.2.5 | Câu hỏi spa | "Chị đã từng đến spa... chưa ạ?" | ⬜ |
| 2.2.6 | Kết quả spa | ✅ Khác nhau theo age | ⬜ |

### Test Case 2.3: Review Screen
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 2.3.1 | Routine hiện tại | ✅ Input + photo upload | ⬜ |
| 2.3.2 | Skip được | ✅ Click "Mô tả" được | ⬜ |

---

## 🔷 BƯỚC 3: SỨC KHỎE

### Test Case 3.1: Health Intro
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 3.1.1 | Câu giới thiệu | ✅ "Em ơi, chị hỏi thêm..." | ⬜ |
| 3.1.2 | Button "Tiếp tục" | ✅ Chuyển sang menstrual | ⬜ |
| 3.1.3 | Button "Bỏ qua" | ✅ Skip được, chuyển sang budget | ⬜ |

### Test Case 3.2: Menstrual
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 3.2.1 | Câu hỏi | "Hiện tại kinh nguyệt của bạn như thế nào?" | ⬜ |
| 3.2.2 | Options | ✅ Đều, Không đều, Mãn kinh | ⬜ |
| 3.2.3 | Chọn option | ✅ Auto sang pregnancy | ⬜ |

### Test Case 3.3: Pregnancy
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 3.3.1 | Câu hỏi | "Bạn đã có con chưa?" | ⬜ |
| 3.3.2 | Options | ✅ Đang mang thai, Đã từng, Chưa từng | ⬜ |
| 3.3.3 | Nếu "Đang mang thai" | ✅ Hiện cảnh báo đặc biệt | ⬜ |

### Test Case 3.4: Medical
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 3.4.1 | Câu hỏi | "Bạn có đang điều trị bệnh lý nào không?" | ⬜ |
| 3.4.2 | Input text | ✅ Nhập được | ⬜ |

### Test Case 3.5: Supplements
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 3.5.1 | Multi-select | ✅ Vitamin A, C, Collagen... | ⬜ |
| 3.5.2 | "Không uống gì" | ✅ Deselect all others | ⬜ |

### Test Case 3.6: Sleep
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 3.6.1 | Câu hỏi | "Giấc ngủ của bạn như thế nào?" | ⬜ |
| 3.6.2 | Options | ✅ Ngủ đủ, Ngủ ít, Mất ngủ | ⬜ |

### Test Case 3.7: Stress
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 3.7.1 | Câu hỏi | "Bạn có hay bị stress không?" | ⬜ |
| 3.7.2 | Options | ✅ ít, Nhiều, Rất nhiều | ⬜ |

---

## 🔷 BƯỚC 4: NGÂN SÁCH & HOÀN TẤT

### Test Case 4.1: Budget
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 4.1.1 | Câu hỏi | "Bạn đang dự tính đầu tư bao nhiêu?" | ⬜ |
| 4.1.2 | Options | ✅ <1tr, 1-3tr, 3-5tr, 5-10tr, >10tr | ⬜ |

### Test Case 4.2: Confirm Phone
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 4.2.1 | Hiển thị tóm tắt | ✅ Tất cả thông tin đã nhập | ⬜ |
| 4.2.2 | Validate phone | ✅ Báo lỗi nếu < 10 số | ⬜ |
| 4.2.3 | Nhập phone | ✅ 10 số đúng | ⬜ |
| 4.2.4 | Submit | ✅ Gửi được, sang thank you | ⬜ |

### Test Case 4.3: Thank You
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 4.3.1 | Tin xác nhận | ✅ "Hồ sơ của bạn đã được gửi..." | ⬜ |
| 4.3.2 | Nút đóng | ✅ Close webview | ⬜ |

---

## 🔷 TEST URL PARAMETERS

### Test Case 5.1: Có nhucau từ URL
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 5.1.1 | URL: ?nhucau=anh bị mụn lâu năm | | |
| 5.1.2 | Skip bước Skin | ✅ Không hiển thị màn hình chọn da | ⬜ |
| 5.1.3 | Bubble loading "..." | ✅ Hiển thị 1.5s | ⬜ |
| 5.1.4 | Tin nhắn cá nhân hóa | ✅ "Chị hiểu rồi! Từ nhu cầu của em..." | ⬜ |
| 5.1.5 | Câu hỏi chụp hình | ✅ "Để xem tình trạng da MỤN..." | ⬜ |
| 5.1.6 | Vào lại và test lại | ✅ Không duplicate | ⬜ |

### Test Case 5.2: Không có nhucau
| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 5.2.1 | URL không có params | ✅ Flow bình thường | ⬜ |
| 5.2.2 | Chọn vấn đề da | ✅ Bình thường | ⬜ |

---

## 🔷 TEST BACK NAVIGATION

| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 6.1 | Click back từ Age | ✅ Về Welcome | ⬜ |
| 6.2 | Click back từ Location | ✅ Về Age | ⬜ |
| 6.3 | Click back từ Skin | ✅ Về Location | ⬜ |
| 6.4 | State được restore | ✅ Giá trị đã chọn được giữ | ⬜ |

---

## 🔷 TEST LOCALSTORAGE

| STT | Checkpoint | Expected | Status |
|------|------------|----------|--------|
| 7.1 | Reload page | ✅ State được giữ lại | ⬜ |
| 7.2 | Điền form xong reload | ✅ Tiếp tục được | ⬜ |

---

## 📊 TỔNG KẾT TEST

| Mục | Tổng | ✅ Pass | ❌ Fail | ⚠️ Pending |
|------|-------|---------|---------|------------|
| Bước 1 | 20 | | | |
| Bước 2 | 12 | | | |
| Bước 3 | 15 | | | |
| Bước 4 | 9 | | | |
| URL Params | 6 | | | |
| Back Nav | 4 | | | |
| LocalStorage | 2 | | | |
| **TỔNG** | **68** | | | |

---

*Test checklist generated: 2026-03-16*
