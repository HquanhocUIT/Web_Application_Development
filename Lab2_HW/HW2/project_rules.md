# HW2 Project Rules

- Chủ yếu dùng HTML, CSS, JavaScript, ReactJS và TypeScript; ưu tiên code đơn giản, dễ hiểu.
- Không dùng thư viện Audio Visualizer hoặc Queue để làm thay yêu cầu. Ưu tiên Web Audio API, `AnalyserNode`, `AudioBufferSourceNode`, `AbortController` và `requestAnimationFrame`.
- Mỗi prompt chỉ thực hiện **một subtask** trong `TASK_DECOMPOSITION.md`; không tự chuyển sang task tiếp theo.
- Trước khi code, xác định dữ liệu, props, state và luồng xử lý. Không xây toàn bộ ứng dụng trong một lần.
- Queue phải xử lý đúng FIFO; quản lý tải và decode để không có tác vụ chạy đồng thời ngoài ý muốn.
- Dùng `AbortController` để hủy tải; phân biệt tải có thể hủy với `decodeAudioData`, vốn không nhận `AbortSignal` để dừng decode trực tiếp.
- Xử lý rõ lỗi tải, decode và cancellation; không dùng `innerHTML` hoặc `dangerouslySetInnerHTML` với dữ liệu không tin cậy.
- Visualizer dùng Canvas hoặc SVG và `requestAnimationFrame`, hướng đến 60 FPS; không cập nhật React state liên tục theo frame.
- Cleanup source node, audio context, animation frame, listener và tài nguyên liên quan khi cần.
- Sau mỗi subtask, kiểm tra chức năng liên quan; khi project đã khởi tạo, chạy build/lint nếu có script phù hợp.
- Chỉ tạo **một Git commit sau khi hoàn thành toàn bộ milestone**, không commit từng subtask.
- Không sửa file ngoài thư mục `HW2`; không tự ý thay đổi phần không liên quan đến subtask hiện tại.
- Cuối bài cần có screenshot output thực tế và `AI_FAILURE_AUDIT.md` ghi ít nhất 3 lỗi AI có bằng chứng, cách phát hiện và sửa.
- Không bịa lỗi, screenshot hoặc kết quả kiểm thử; ghi rõ giới hạn nếu chưa thể xác minh.
