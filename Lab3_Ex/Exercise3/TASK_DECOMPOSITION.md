# Work Breakdown Structure (WBS)

## Lab 3 — Exercise 3: KRAFTON PUBG Vietnam Series (PVS) Live Telemetry

### Quy tắc thực hiện

- Làm từng subtask riêng theo thứ tự; dừng sau subtask được giao.
- Dùng React 19, JavaScript/JSX, HTML semantic và CSS; không thêm thư viện UI nếu không cần.
- Chỉ làm trong `Lab3_Ex/Exercise3`; giữ nguyên Exercise1, Exercise2, Homework và thay đổi có sẵn ở Lab2_Ex.
- Chỉ tạo hai commit tại E3-05 và E3-09 với đúng message quy định.

## Các công việc

- [x] **E3-01 — Khảo sát workspace:** Kiểm tra nội dung Exercise3, project/runtime, cấu hình, Git và tài liệu cần giữ nguyên.
  - **Hoàn thành khi:** Đã ghi nhận project đã khởi tạo hay chưa, các file hiện có, trạng thái Git và những gì cần chuẩn bị; không sửa nội dung ngoài Exercise3.

- [x] **E3-02 — Thiết kế data schema, component contract và state machine:** Chốt dữ liệu ba đội, props/state, luồng tải, hủy và lỗi trước khi code.
  - **Hoàn thành khi:** Contract ghi đủ CES, TE, GE với tên, map, phase, alive, kills, wwcdProb và status đúng đề; xác định `squadId`, `retryTick`, bốn trạng thái `IDLE`, `LOADING`, `SUCCESS`, `ERROR`; quy định packet loss 35% chỉ cho Erangel/Miramar và xử lý riêng `AbortError`.

- [x] **E3-03 — Khởi tạo React 19 và chuẩn bị dữ liệu:** Tạo project Vite JavaScript/JSX ngay trong Exercise3 nếu cần và khai báo `PUBG_VN_SQUADS` với ID ổn định.
  - **Hoàn thành khi:** App React 19 chạy được; có đúng ba đội cùng dữ liệu được quy định trong contract; không dùng TypeScript hoặc UI library ngoài.

- [x] **E3-04 — Triển khai telemetry bất đồng bộ và AbortController:** Tạo `PubgMatchTelemetry.jsx`, chọn đội và tải dữ liệu giả lập bằng state machine; hủy request cũ trong cleanup của `useEffect`.
  - **Hoàn thành khi:** Đổi `squadId` bắt đầu request mới và gọi `controller.abort()` cho request trước; `AbortError` không hiện như lỗi mạng; response cũ không thể ghi đè đội mới; lỗi mạng chuyển sang `ERROR`.
  - **Trạng thái:** Đã thêm loader Promise có delay hủy được, dọn timer/listener, phân biệt `AbortError`, và packet loss 35% chỉ trên Erangel/Miramar. Sáu kiểm tra Node đạt: TE thành công ở ngưỡng 35%, Erangel/Miramar rớt gói ở ngưỡng kiểm soát, Taego thành công, abort trước/đang chờ, timer/listener được dọn; source assertion xác nhận cleanup và stale-response guards của effect. Build/lint đạt. Chưa kiểm tra tương tác React/browser khi đổi CES → TE → GE hoặc unmount; các integration checks này thuộc E3-08.

- [x] **E3-05 — Checkpoint Git commit 1:** Rà soát data, state machine, request bất đồng bộ và hủy request.
  - **Hoàn thành khi:** Đã chạy build/lint và kiểm tra phù hợp; chỉ stage file Exercise3 cần thiết; tạo đúng commit `feat(ex3): implement PUBG VN 4-state telemetry & AbortController`.
  - **Trạng thái:** Sáu kiểm tra Node, build, lint và `git diff --check` đạt; đã commit riêng các file Exercise3. Kiểm thử chuyển đội nhanh và unmount trong trình duyệt chưa thực hiện, được giữ lại cho E3-08.

- [ ] **E3-06 — Xây dựng Skeleton Loading và cảnh báo lỗi:** Hiển thị skeleton trong `LOADING` và thông báo lỗi semantic trong `ERROR`.
  - **Hoàn thành khi:** Skeleton card cao 220px có hiệu ứng pulsing Blue-Zone và `aria-busy="true"`; lỗi mạng hiển thị trong `section role="alert"`, không dùng `window.alert()`; có nút Reconnect.

- [ ] **E3-07 — Triển khai Retry bằng `retryTick`:** Kết nối nút Reconnect với request lại telemetry.
  - **Hoàn thành khi:** Mỗi lần retry tăng `retryTick`; effect theo dõi `retryTick` và `squadId`; loading, success và lỗi sau retry cập nhật đúng; retry không tạo request trùng hoặc render loop.

- [ ] **E3-08 — Kiểm thử race condition, packet loss, accessibility và responsive:** Kiểm tra các trạng thái, lựa chọn đội, lỗi, retry và bố cục.
  - **Hoàn thành khi:** Xác minh chuyển nhanh CES → TE → GE không bị response cũ ghi đè; packet loss 35% chỉ áp dụng Erangel/Miramar; thử loading, lỗi, AbortError và Retry; kiểm tra đủ telemetry fields, keyboard/labels/alert/`aria-busy`, responsive và console; ghi rõ các giới hạn nếu browser hoặc React DevTools không khả dụng.

- [ ] **E3-09 — Checkpoint Git commit 2:** Rà soát giao diện, Skeleton, lỗi, Retry và kết quả kiểm thử.
  - **Hoàn thành khi:** Build/lint và các kiểm tra phù hợp đạt; chỉ stage file trong Exercise3; tạo đúng commit `feat(ex3): add skeleton UI & retry alert`; không tạo commit khác hoặc push.

## Hai checkpoint Git bắt buộc

1. Sau E3-04: `feat(ex3): implement PUBG VN 4-state telemetry & AbortController`
2. Sau E3-08: `feat(ex3): add skeleton UI & retry alert`

Không tạo commit ngoài hai checkpoint trên. Chỉ tạo commit khi điều kiện checkpoint tương ứng đã được xác nhận.
