# TASK DECOMPOSITION — Homework 3: High-Concurrency Flash-Sale E-Commerce Engine

## Quy tắc thực hiện

- Thực hiện lần lượt từng subtask; chỉ bắt đầu subtask kế tiếp sau khi subtask hiện tại hoàn thành.
- Mỗi milestone gồm đúng hai subtask. Chỉ đánh dấu milestone hoàn thành khi cả hai điều kiện hoàn thành đã đạt.
- Sau khi hoàn tất mỗi milestone, tạo đúng một Git commit có thay đổi thật, dùng Conventional Commits. Mục tiêu là 8 commit có ý nghĩa, tương ứng M0–M7; không tạo commit rỗng hoặc commit giả.
- Chỉ tạo/sửa file trong HW3. Không thay đổi HW1, HW2 hay file bên ngoài HW3.
- Dùng React, TypeScript, HTML, CSS và JavaScript ở mức đơn giản, phù hợp nội dung đã học.
- Chưa khởi tạo project hoặc cài dependencies trong bước lập WBS này.

## WBS

### M0 — Chuẩn bị project

**Trạng thái:** Hoàn thành — M0-01 và M0-02 đã đạt điều kiện hoàn thành.

- **M0-01 — Chốt phạm vi và kế hoạch:** Ghi yêu cầu, ranh giới thư mục, thứ tự công việc và tiêu chí hoàn thành vào tài liệu WBS.
  - **Hoàn thành khi:** TASK_DECOMPOSITION.md có đủ 8 milestone M0–M7, mỗi milestone có đúng 2 subtask với mô tả và điều kiện hoàn thành rõ ràng.
- **M0-02 — Khởi tạo project tối thiểu:** Tạo ứng dụng React + TypeScript trong HW3 và cấu hình các lệnh chạy cần thiết.
  - **Hoàn thành khi:** Mã nguồn và cấu hình project nằm trong HW3; ứng dụng khởi động được bằng lệnh đã ghi trong README hoặc hướng dẫn chạy.

### M1 — Thiết kế dữ liệu và Inventory State Machine

**Trạng thái:** Hoàn thành — M1-01 và M1-02 đã đạt điều kiện hoàn thành.

- **M1-01 — Khai báo mô hình dữ liệu:** Định nghĩa kiểu sản phẩm, tồn kho, reservation, thời hạn giữ hàng và trạng thái checkout bằng TypeScript.
  - **Hoàn thành khi:** Các kiểu dữ liệu thể hiện được số lượng tồn, số lượng đang giữ, mã reservation, thời điểm hết hạn và trạng thái cần thiết; có quy tắc để tồn kho khả dụng không âm.
- **M1-02 — Xây dựng chuyển trạng thái tồn kho:** Cài đặt các thao tác giữ hàng, xác nhận checkout và giải phóng giữ hàng theo một luồng trạng thái dễ theo dõi.
  - **Hoàn thành khi:** Mỗi thao tác cập nhật trạng thái theo quy tắc đã định; không thể xác nhận hoặc giải phóng một reservation không còn hợp lệ.

### M2 — Zero-Drift Countdown Timer

- **M2-01 — Tính thời gian còn lại theo đồng hồ chuẩn:** Tính countdown từ thời điểm kết thúc và Date.now(), không cộng/trừ thời gian dựa trên số lần setInterval chạy.
  - **Hoàn thành khi:** Mỗi lần cập nhật đều suy ra thời gian còn lại từ timestamp; countdown dừng ở 0 và xử lý đúng khi thời gian kết thúc đã qua.
- **M2-02 — Cập nhật giao diện countdown:** Dùng requestAnimationFrame khi phù hợp để hiển thị countdown mượt và dọn vòng lặp khi component bị gỡ.
  - **Hoàn thành khi:** Giao diện hiển thị thời gian còn lại cập nhật liên tục; không giữ vòng lặp animation sau khi component không còn được dùng.

### M3 — Optimistic Inventory Lock và xử lý concurrency

- **M3-01 — Giữ hàng lạc quan:** Thực hiện kiểm tra tồn khả dụng và ghi reservation trong cùng một bước cập nhật trạng thái đồng bộ.
  - **Hoàn thành khi:** Một yêu cầu chỉ được giữ hàng nếu còn đủ tồn khả dụng; số lượng đang giữ tăng ngay khi chấp nhận và tổng lượng giữ không vượt tồn thực.
- **M3-02 — Xử lý yêu cầu mua cạnh tranh:** Mô phỏng nhiều yêu cầu đến gần như đồng thời và trả kết quả rõ ràng cho từng yêu cầu.
  - **Hoàn thành khi:** Tổng reservation được chấp nhận không vượt số lượng tồn; yêu cầu không được đáp ứng nhận trạng thái hết hàng hoặc xung đột mà không làm sai trạng thái kho.

### M4 — Reservation Expiration và Checkout

- **M4-01 — Hết hạn và giải phóng reservation:** Theo dõi thời điểm hết hạn, đổi trạng thái reservation và trả lượng hàng đã giữ về tồn khả dụng.
  - **Hoàn thành khi:** Reservation hết hạn không thể checkout; lượng hàng của nó được giải phóng đúng một lần và không bị giải phóng lặp.
- **M4-02 — Hoàn tất hoặc thất bại checkout:** Cài đặt các nhánh checkout thành công/thất bại, gồm cập nhật tồn kho và giải phóng giữ hàng phù hợp.
  - **Hoàn thành khi:** Checkout thành công trừ đúng số lượng khỏi tồn; checkout thất bại không làm mất hàng hoặc giữ hàng vô thời hạn, và người dùng nhận được trạng thái kết quả.

### M5 — Xây dựng giao diện Flash Sale

- **M5-01 — Tạo giao diện phiên Flash Sale:** Hiển thị sản phẩm, giá, tồn kho khả dụng, countdown và nút mua với bố cục đơn giản.
  - **Hoàn thành khi:** Các dữ liệu chính đọc được trên giao diện và bố cục dùng được ở kích thước màn hình phổ biến.
- **M5-02 — Kết nối thao tác người dùng:** Nối nút mua với luồng giữ hàng/checkout và hiển thị trạng thái đang xử lý, thành công, hết hàng hoặc thất bại.
  - **Hoàn thành khi:** Người dùng có thể thực hiện luồng mua trên giao diện và thấy kết quả tương ứng; nút mua không tạo yêu cầu lặp ngoài ý muốn khi đang xử lý.

### M6 — Tích hợp hệ thống và kiểm thử

- **M6-01 — Tích hợp các luồng chính:** Kết nối countdown, kho, reservation, hết hạn, checkout và giao diện thành một luồng Flash Sale hoàn chỉnh.
  - **Hoàn thành khi:** Có thể bắt đầu phiên, giữ hàng, chờ reservation hết hạn hoặc checkout và quan sát tồn kho cùng trạng thái giao diện nhất quán.
- **M6-02 — Kiểm tra các tình huống biên:** Kiểm tra cạnh tranh tài nguyên, hết hàng, hết hạn giữ hàng, checkout thành công và checkout thất bại.
  - **Hoàn thành khi:** Có bằng chứng kiểm tra cho từng tình huống; kết quả xác nhận không oversell, không checkout reservation hết hạn và kho được cập nhật đúng.

### M7 — Screenshots, AI Failure Audit và tổng kết

- **M7-01 — Chuẩn bị ảnh chụp và hướng dẫn chạy:** Chụp các trạng thái giao diện tiêu biểu và hoàn thiện hướng dẫn khởi chạy/kiểm thử trong HW3.
  - **Hoàn thành khi:** Ảnh chụp được lưu trong HW3 và thể hiện các trạng thái quan trọng; hướng dẫn nêu được cách chạy và cách tái hiện các luồng chính.
- **M7-02 — Ghi AI Failure Audit và tổng kết:** Ghi ít nhất 3 lỗi AI thực tế trong AI_FAILURE_AUDIT.md, kèm bằng chứng, ảnh hưởng và cách sửa.
  - **Hoàn thành khi:** Có ít nhất 3 lỗi đã thực sự xảy ra, mỗi lỗi có bằng chứng kiểm chứng được (ví dụ diff/commit, log chạy hoặc kết quả kiểm tra), mô tả ảnh hưởng và bản sửa; tài liệu tổng kết đối chiếu yêu cầu với kết quả cuối.

## Kế hoạch commit

Tạo một commit sau mỗi milestone, chỉ khi cả hai subtask trong milestone đó đạt điều kiện hoàn thành. Dùng một thông điệp Conventional Commits có phạm vi tương ứng, ví dụ feat(m3): prevent flash sale overselling. Các commit phải phản ánh thay đổi thực tế; không tạo commit rỗng để tăng số lượng.
