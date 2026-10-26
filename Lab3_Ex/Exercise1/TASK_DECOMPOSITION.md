# Work Breakdown Structure (WBS)

## Lab 3 — Exercise 1: Semantic Engineer & Pro-Gamer Profile Card

### Quy tắc thực hiện

- Thực hiện từng subtask theo thứ tự; mỗi lần chỉ làm một subtask và dừng sau khi hoàn thành nó.
- Chỉ tạo hai Git commits tại các checkpoint ghi dưới đây; không tạo commit khác.
- Chỉ làm trong thư mục Exercise 1; không sửa Exercise hoặc Homework khác.
- Ưu tiên HTML, CSS, JavaScript và React đã học; dùng React 19, CSS Modules và JavaScript.
- WBS quy định thứ tự công việc và các checkpoint. Project được khởi tạo và triển khai theo từng subtask đã được cho phép.

## Các công việc

- [x] **E1-01 — Khảo sát project và chốt phạm vi:** Kiểm tra cấu trúc, công nghệ và quy ước có sẵn trong thư mục bài tập; đối chiếu yêu cầu Exercise 1.
  - **Hoàn thành khi:** Ghi nhận được trạng thái project và xác định rõ các file/component cần có cho `DeveloperCard`, `SkillBadge` và CSS Modules; không sửa file ứng dụng.

- [x] **E1-02 — Thiết kế props và cấu trúc semantic:** Chốt dữ liệu props cho profile và kỹ năng, cùng cấu trúc HTML, metadata và quan hệ nhãn truy cập.
  - **Hoàn thành khi:** Kế hoạch chỉ rõ `DeveloperCard` dùng functional component với ES6 default parameters; dùng `article`, `header`, `hgroup`, `h2`, `dl`, `dt`, `dd`, `ul`, `li`, Fragment và `aria-labelledby`; không có `div` trong `DeveloperCard.jsx`; danh sách metadata dùng Fragment có `key`; `SkillBadge` nhận kỹ năng qua props.

- [x] **E1-03 — Triển khai `DeveloperCard` và `SkillBadge`:** Tạo hai component bằng React 19 và JavaScript, với dữ liệu profile/kỹ năng truyền qua props.
  - **Hoàn thành khi:** Hai component đáp ứng cấu trúc và props đã chốt; `DeveloperCard.jsx` không chứa thẻ `div`; ảnh avatar dùng URL HTTPS, khai báo `width`/`height` và có fallback initials khi ảnh lỗi.

- [x] **E1-04 — Checkpoint commit 1:** Rà soát diff phần component và tạo commit `feat(ex1): implement semantic DeveloperCard and SkillBadge`.
  - **Hoàn thành khi:** Chỉ commit thay đổi thực tế của phần component liên quan; commit có đúng nội dung nêu trên và không gộp thay đổi ngoài phạm vi.

- [ ] **E1-05 — Tạo CSS Module và responsive 375px:** Tạo style riêng cho card/badge, không dùng inline style hoặc thêm global CSS không cần thiết.
  - **Hoàn thành khi:** Component dùng CSS Modules; bố cục và nội dung card hiển thị, đọc được ở viewport rộng 375px mà không tràn ngang.

- [ ] **E1-06 — Kiểm thử semantic, accessibility, responsive và ảnh:** Kiểm tra DOM, quan hệ nhãn, danh sách, ảnh lỗi và bố cục tại 375px bằng cách phù hợp với project.
  - **Hoàn thành khi:** Có kết quả kiểm tra xác nhận đủ semantic elements và không có `div` trong `DeveloperCard`; `aria-labelledby` trỏ đúng tiêu đề; các Fragment metadata có key; kỹ năng được render từ props; giao diện dùng được tại 375px; avatar chỉ dùng HTTPS, có kích thước rõ ràng và fallback hoạt động khi ảnh lỗi. Ghi rõ kiểm tra nào chưa thể chạy và lý do.

- [ ] **E1-07 — Checkpoint commit 2:** Rà soát diff styling và kết quả kiểm tra, sau đó tạo commit `style(ex1): add responsive 375px CSS module`.
  - **Hoàn thành khi:** Chỉ commit thay đổi CSS Module/responsive thuộc checkpoint; commit có đúng nội dung nêu trên và không tạo thêm commit nào.

## Hai checkpoint Git bắt buộc

1. Sau E1-03: `feat(ex1): implement semantic DeveloperCard and SkillBadge`
2. Sau E1-06: `style(ex1): add responsive 375px CSS module`

Không tạo commit nào khác ngoài hai checkpoint này. Mỗi checkpoint chỉ được thực hiện khi các điều kiện hoàn thành tương ứng đã đạt.
