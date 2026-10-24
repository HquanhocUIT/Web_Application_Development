# Project Rules

Áp dụng các quy tắc này cho Homework 1: Production Enterprise Data-Grid (WCAG 2.2 AA), theo thứ tự trong `TASK_DECOMPOSITION.md`.

## Cách thực hiện

- Mỗi prompt chỉ thực hiện đúng **một task** trong WBS. Không tự chuyển sang task tiếp theo nếu người dùng chưa yêu cầu.
- Trước khi code một chức năng, xác định ngắn gọn dữ liệu, props, state, cách xử lý và cách kiểm tra của task đó.
- Không viết toàn bộ ứng dụng trong một lần. Chia thay đổi thành phần nhỏ, chỉ sửa tệp liên quan đến task hiện tại.
- Ưu tiên HTML, CSS, JavaScript, ReactJS và TypeScript đã học trên lớp. Dùng React functional components; dùng props, `useState` và `useEffect` khi phù hợp.
- Giữ code đơn giản, dễ đọc và phù hợp với trình độ sinh viên đang học ReactJS.

## Quy tắc triển khai

- Dùng HTML semantic, đặc biệt là `table`, `thead`, `tbody`, `th scope="col"` và `button` cho bảng; thêm ARIA phù hợp để đáp ứng yêu cầu WCAG 2.2 AA và hỗ trợ screen reader.
- Không dùng thư viện UI như Material UI, Ant Design hoặc thư viện Data-Grid để thay phần bài tập cần tự xây dựng.
- Không dùng `innerHTML` hoặc `dangerouslySetInnerHTML` để hiển thị dữ liệu không đáng tin cậy.
- Không dùng `Math.random()` hoặc array index làm `key` cho các dòng dữ liệu có thể thay đổi; dùng ID ổn định.
- Nếu đăng ký event listener hoặc timer, dọn dẹp đúng lúc, thường trong cleanup của `useEffect`.
- Không tự ý chỉnh sửa phần không liên quan đến task hiện tại.

## Kiểm tra và bàn giao từng task

- Sau mỗi task, kiểm tra thay đổi và lỗi liên quan; nếu task có sửa code sau khi project được khởi tạo, chạy `npm run build`.
- Tạo một Git commit riêng cho mỗi task hoàn thành, với message ngắn gọn mô tả thay đổi của task đó.
- Khi báo cáo, nêu ngắn gọn task đã làm, cách đã kiểm tra, kết quả và lỗi còn lại nếu có. Không tuyên bố kiểm tra đã chạy nếu chưa chạy.

## Hoàn tất bài tập

- Ở task cuối, kiểm tra Lighthouse cho Accessibility và Best Practices; ghi điểm số và kết quả thực tế.
- Tạo `AI_FAILURE_AUDIT.md` ghi lại 3 lỗi do AI thực sự tạo ra trong quá trình làm bài. Với từng lỗi, nêu lỗi, cách phát hiện, cách sửa và bằng chứng kiểm thử liên quan.
- Không bịa lỗi hoặc bằng chứng. Nếu quá trình làm bài chưa phát sinh đủ 3 lỗi AI có thể xác minh, ghi rõ giới hạn đó và chỉ báo cáo lỗi thực tế.
