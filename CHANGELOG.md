# Changelog

Mọi thay đổi đáng chú ý của project Bevita Intake Webform sẽ được ghi lại trong file này.

## [2026-03-08]
### Added
- Tính năng **Dynamic Pronouns**: Tự động đổi xưng hô Chị/Em hoặc Em/Chị giữa Bot và User tuỳ thuộc vào nhóm độ tuổi mà khách hàng chọn ở Bước 1. (Update ở `app.js` logic và các CSS/HTML templates).
- Tính năng **Global Quay Lại**: Nút "Quay lại" xuất hiện ở góc trái thanh Progress Bar (trừ màn hình chào) cho phép người dùng lùi trình duyệt lại lịch sử (`state.history`) để thay đổi các lựa chọn trước đó. Đoạn mã sẽ đồng bộ vị trí thanh process bar.
- Hình ảnh đại diện Bot: Thay icon text mặc định bằng Logo ảnh của Bevita, thay đổi CSS `object-fit: cover` cho icon.
- Tạo files tài liệu: `docs/api/endpoints.md` cho NocoDB và ImgBB API.

### Changed
- Khắc phục lỗi NocoDB API reject dữ liệu trên trường `Health_Status` (chuyển MultiSelect thành LongText).
- Đổi tên biến gửi lên NocoDB cho text tự do từ `Text` thành `Note`.
- Sửa lại Flow upload ảnh: Hiện/Ẩn nút "Tiếp tục" thay vì can thiệp `style.display`.

### Fixed
- Lỗi không xuất hiện nút Weiter (`Tiếp tục`) khi chọn tình trạng da.
- Lỗi không xuất hiện nút Submit ảnh (`btnSkinPhotoNext`) sau khi upload ảnh trong bước 1 và bước 3. Cập nhật lại logic `toggleSkin` và vòng lặp check condition.
