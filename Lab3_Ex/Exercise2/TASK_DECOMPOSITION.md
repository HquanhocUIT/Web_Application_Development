# Work Breakdown Structure (WBS)

## Lab 3 — Exercise 2: Interactive Scientist & Pioneer Directory

### Quy tắc thực hiện

- Thực hiện từng subtask riêng, theo đúng thứ tự; dừng sau task được yêu cầu.
- Chỉ tạo ba commit tại các checkpoint E2-04, E2-07 và E2-10; không tạo commit khác.
- Chỉ làm trong `Lab3_Ex/Exercise2`; giữ nguyên Exercise1, các Homework và thay đổi có sẵn ở Lab2_Ex.
- Dùng React 19, JavaScript/JSX, HTML semantic và CSS; không dùng `useEffect` cho tìm kiếm, lọc hoặc sắp xếp.

## Các công việc

- [x] **E2-01 — Khảo sát workspace:** Kiểm tra nội dung Exercise2, vị trí danh sách `smartPeople` hiện có, cấu hình project, runtime và Git mà không sửa file.
  - **Hoàn thành khi:** Ghi nhận được project đã có/chưa có, vị trí dữ liệu nguồn và các tài liệu cần giữ nguyên; xác định các giới hạn kỹ thuật ảnh hưởng đến `.toSorted()`.

- [x] **E2-02 — Thiết kế dữ liệu và component contract:** Chốt schema người, props/state cần thiết, cấu trúc semantic và hành vi điều khiển trước khi viết component.
  - **Hoàn thành khi:** Hợp đồng xác định đủ bảy người với id ổn định (`sp-1`…`sp-7`) và tuổi/IQ đúng đề; `ScientistDirectory` quản lý `people`, `query`, `minIq`, `sortBy`; quy định Search không phân biệt hoa thường, input number dùng `valueAsNumber` và xử lý giá trị rỗng/`NaN`; `visiblePeople` là dữ liệu dẫn xuất, không phải state.

- [x] **E2-03 — Khởi tạo React 19 và chuẩn hóa dữ liệu:** Tạo project ngay trong Exercise2 nếu cần; chuyển danh sách ban đầu thành `SMART_PEOPLE` với schema thống nhất và id ổn định.
  - **Hoàn thành khi:** Ứng dụng chạy được; đủ chính xác bảy bản ghi theo đề, bao gồm Nguyen Phan Hoang Quan (20 tuổi, IQ 199); state khởi tạo mặc định từ `SMART_PEOPLE`, làm nguồn để Reset ở E2-08 khôi phục sau này; không thêm thư viện UI.

- [x] **E2-04 — Checkpoint commit 1:** Rà soát thay đổi setup/schema và tạo commit `feat(ex2): normalize smartPeople schema with stable IDs`.
  - **Hoàn thành khi:** Commit có đúng message; chỉ gồm thay đổi cần thiết cho setup và chuẩn hóa dữ liệu trong Exercise2; không chứa file build/dependency cache hoặc thay đổi ngoài phạm vi.

- [ ] **E2-05 — Xây dựng Search và IQ Filter:** Thêm điều khiển có label truy cập được và tính kết quả tìm kiếm/lọc từ state.
  - **Hoàn thành khi:** `useId()` kết hợp `label`/`htmlFor`; tìm tên không phân biệt hoa thường; input number đọc bằng `valueAsNumber`; giá trị rỗng không loại nhầm mọi kết quả; không dùng `useEffect` hay state riêng cho kết quả.

- [ ] **E2-06 — Xây dựng Sort và danh sách dẫn xuất:** Hoàn thiện lựa chọn sắp xếp theo IQ hoặc Age, danh sách hiển thị và thông báo số kết quả.
  - **Hoàn thành khi:** `visiblePeople` được tính trực tiếp từ state qua filter và `.toSorted()` mà không mutate `people`; danh sách dùng key theo id; số kết quả được thông báo bằng `<output role="status" aria-live="polite">` hoặc cấu trúc tương đương đúng ngữ nghĩa; nhập một ký tự không gây render loop.

- [ ] **E2-07 — Checkpoint commit 2:** Rà soát logic Search, IQ Filter, Sort và tạo commit `feat(ex2): add search, IQ filter & toSorted`.
  - **Hoàn thành khi:** Commit có đúng message; chỉ chứa tính năng tìm kiếm/lọc/sắp xếp đã kiểm tra trong Exercise2; chưa gộp Delete/Reset.

- [ ] **E2-08 — Xây dựng Delete và Reset:** Cho phép xóa theo id và khôi phục toàn bộ danh sách ban đầu.
  - **Hoàn thành khi:** Delete chỉ xóa đúng id; Reset khôi phục đủ bảy bản ghi gốc; React keys vẫn dựa trên id ổn định; thao tác xóa không làm focus keyboard biến mất nếu còn phần tử phù hợp để nhận focus.

- [ ] **E2-09 — Kiểm thử logic, accessibility và responsive:** Kiểm tra dữ liệu, Search/Filter/Sort, Delete/Reset, bàn phím, trạng thái thông báo và bố cục trên màn hình hẹp.
  - **Hoàn thành khi:** Các trường hợp có kết quả/không có kết quả, input IQ rỗng/biên, thứ tự IQ/Age, xóa/reset và tính đúng của bản ghi thứ bảy được kiểm tra; label/status/list semantics và focus được rà soát; giao diện responsive không tràn ngang; ghi rõ kết quả React DevTools Profiler khi công cụ khả dụng, nếu không nêu giới hạn.

- [ ] **E2-10 — Checkpoint commit 3:** Rà soát toàn bộ thay đổi Exercise2 và tạo commit `feat(ex2): implement delete and reset`.
  - **Hoàn thành khi:** Commit có đúng message; chỉ gồm Delete/Reset và phần hoàn thiện liên quan được kiểm tra; Git status xác nhận không stage hoặc commit thay đổi ngoài Exercise2.

## Ba checkpoint Git bắt buộc

1. Sau E2-03: `feat(ex2): normalize smartPeople schema with stable IDs`
2. Sau E2-06: `feat(ex2): add search, IQ filter & toSorted`
3. Sau E2-09: `feat(ex2): implement delete and reset`

Không tạo commit nào khác ngoài ba checkpoint trên. Chỉ tạo mỗi commit sau khi điều kiện hoàn thành checkpoint tương ứng đã được xác nhận.
