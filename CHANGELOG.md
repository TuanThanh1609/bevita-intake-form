## [2026-03-09]
### Added
- Tính năng **Slot-based Photo Upload**: Thay thế giao diện upload hàng loạt bằng một nút động duy nhất (Capture/Slot) kèm thumbnail ngang. Hỗ trợ chụp 3 góc mặt (Front, Left, Right) tuần tự và slots ảnh Routine.
- Tính năng **Tracking last_step**: Tự động lưu bản nháp (Draft) lên NocoDB ngay khi khách tương tác (Age screen). Gán `last_step` để Messenger Bot có thể nhắc hẹn (Remind) chính xác bước khách dừng lại.
- Bổ sung thông tin Spa: Thêm câu hỏi và trường dữ liệu `History_Spa_Service`, `History_Spa_Results` vào webform.

### Changed
- Tăng thời gian phản hồi của Bot (Bubble) lên **5.0 giây** và thêm hiệu ứng **Typing indicator** (...) để khách hàng có đủ thời gian đọc nội dung trước khi chuyển trang.
- Cập nhật logic Parse URL Params: Hỗ trợ mapping chuẩn các tham số từ Smax (`facebook.name`, `fb_pid`, `fbads_id`) để tracking chính xác ngay từ đầu.

### Fixed
- **NocoDB V2 PATCH Format**: Sửa lỗi API reject khi update bản nháp. Chuyển payload PATCH từ Object đơn sang Array `[{Id, ...fields}]` theo yêu cầu của NocoDB V2.
- Khôi phục hàm `submitForm` bị mất trong quá trình refactor trước đó.
- Sửa lỗi mapping `Phone_Number` (Display Field) trên NocoDB đảm bảo luôn là kiểu String để tránh xung đột dữ liệu.

