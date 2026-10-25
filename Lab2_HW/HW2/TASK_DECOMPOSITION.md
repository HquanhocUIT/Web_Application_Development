# Homework 2: Concurrent FIFO Audio Visualizer Queue Engine

## Work Breakdown Structure

### Quy trình thực hiện

- Mỗi prompt chỉ thực hiện **một subtask**; không tự chuyển sang subtask tiếp theo.
- Trước khi code, xác định props, state và hành vi liên quan.
- Kiểm tra kết quả sau mỗi phần; chỉ commit **một lần sau khi hoàn tất toàn bộ milestone**.
- Dùng React, TypeScript, HTML, CSS, JavaScript và Web Audio API; ưu tiên code dễ đọc, không dùng thư viện UI/audio để làm thay yêu cầu.
- Chỉ ghi lỗi AI có thật và bằng chứng kiểm tra; screenshot phải là output thực tế của ứng dụng.

## M0 — Chuẩn bị project

**Trạng thái:** Hoàn thành.

**Xác minh:** `npm install` cài dependencies; `npm run dev` khởi động Vite và các route của ứng dụng trả HTTP 200; `npm run build` và `npm run lint` thành công. `.gitignore` bỏ qua `node_modules` và `dist`.

**Giới hạn:** Chưa xác minh giao diện bằng trình duyệt trực quan; chỉ xác minh server, module React được Vite chuyển đổi và production build.

### M0-01 — Khảo sát thư mục và chốt phạm vi

- **Mô tả:** Kiểm tra HW2, Git, hướng dẫn và tiêu chí bài; xác định phần nào đã có, phần nào cần làm.
- **Hoàn thành khi:** WBS và cấu trúc hiện có được đối chiếu; không ghi đè hoặc xóa file không liên quan.

### M0-02 — Khởi tạo và xác minh project

- **Mô tả:** Nếu chưa có, khởi tạo React + TypeScript bằng Vite trong HW2; cài dependencies cần thiết và giữ cấu trúc đơn giản.
- **Hoàn thành khi:** `npm run dev`, build và lint (nếu có script) chạy được; Git ignore `node_modules` và `dist`.

## M1 — FIFO Queue và AbortController

**Status:** Complete.

**Verification:** FIFO order and serial execution, queued and active cancellation, failure recovery, cleanup, and exactly-once Promise settlement passed with a fake processor. `npm run build`, `npm run lint`, and `git diff --check` passed.
### M1-01 — Định nghĩa hợp đồng queue và trạng thái task

- **Mô tả:** Xác định TypeScript types cho task, ID ổn định, trạng thái, kết quả/lỗi, `AbortSignal` và API của `AudioTaskQueue`.
- **Hoàn thành khi:** Kiểu dữ liệu phân biệt được task chờ, đang chạy, hoàn thành, bị hủy và lỗi; không dùng `any`.

### M1-02 — Triển khai FIFO và hủy task

- **Mô tả:** Xây queue chạy tuần tự đúng thứ tự thêm vào; xử lý nhiều yêu cầu gần đồng thời và hủy task chờ hoặc đang chạy qua `AbortController`.
- **Hoàn thành khi:** Kiểm tra được thứ tự FIFO; hủy một task không làm sai thứ tự hoặc ngăn các task còn lại chạy; trạng thái được cập nhật đúng.

## M2 — Web Audio API và Audio Decoding

**Status:** Implemented; real-browser verification pending.

**Verification:** Mock checks passed for FIFO load/decode, shared `AudioContext`, queued/fetch/decode cancellation, URL/network/HTTP/decode failures, cleanup, and pipeline wiring with FFT 256/512. `npm run build`, `npm run lint`, and `git diff --check` passed.

**Environment limit:** Node.js has no real `AudioContext`; playback and analyser output from a real audio file have not been verified in a browser.
### M2-01 — Đưa tải và decode vào queue FIFO

- **Mô tả:** Tích hợp tải audio và `decodeAudioData` thành một đơn vị công việc trong queue; truyền `AbortSignal` cho fetch và xử lý lỗi mạng/decode.
- **Hoàn thành khi:** Các yêu cầu đồng thời hoàn tất theo thứ tự FIFO; hủy fetch được xử lý rõ ràng và queue tiếp tục với task sau.

### M2-02 — Thiết lập pipeline Web Audio

- **Mô tả:** Tạo `AudioContext`, kết nối buffer source với `AnalyserNode` và output; đặt `fftSize` là 256 hoặc 512.
- **Hoàn thành khi:** Audio đã decode có thể phát; analyser trả dữ liệu tần số hợp lệ; lỗi Audio API được hiển thị/xử lý rõ ràng.

## M3 — Audio Visualizer

**Status:** Implemented; browser and FPS verification pending.

**Verification:** Mock scheduler checks passed for recurring RAF, analyser changes, cleanup/unmount, and StrictMode-style setup/cleanup replay. Drawing helper checks passed for 128/256 bins. Code inspection confirms the null-analyser guard, DPR resizing, and no React state updates per frame. `npm run build`, `npm run lint`, and `git diff --check` passed.

**Environment limit:** No browser/DOM test runtime is available here, so actual Canvas rendering and FPS were not measured.
### M3-01 — Xác định API và vẽ visualizer

- **Mô tả:** Chốt props/state cần thiết rồi tạo visualizer bằng Canvas hoặc SVG, đọc dữ liệu từ `AnalyserNode`.
- **Hoàn thành khi:** Visualizer phản ánh thay đổi âm thanh và hỗ trợ kích thước màn hình khác nhau.

### M3-02 — Tối ưu vòng cập nhật và dừng animation

- **Mô tả:** Dùng `requestAnimationFrame` để cập nhật mục tiêu gần 60 FPS; không cập nhật React state theo từng frame; dừng frame khi playback dừng hoặc component unmount.
- **Hoàn thành khi:** Không có RAF lặp sau khi dừng/unmount; cập nhật hình ảnh không gây render React liên tục theo frame.

## M4 — Giao diện và quản lý tài nguyên

**Status:** Implemented; real-browser verification pending.

**Verification:** Mock checks passed for FIFO/serial execution, pending and active cancellation, stopping/replacing playback, natural playback end, source/analyser disconnection, buffer and callback release, decoder cleanup, shared `AudioContext`, FFT 256/512, and RAF cleanup during analyser changes and StrictMode-style setup/cleanup replay. SSR confirmed the initial controls and empty states; `npm run build`, `npm run lint`, and `git diff --check` passed.

**Issue found and fixed:** Playback cleanup previously did not clear the ended callback or release the source's `AudioBuffer` reference; decoder cleanup also did not stop playback pipelines it had created. The decoder now tracks pipelines and disconnects/releases their nodes on stop, natural end, and cleanup.

**Environment limit:** Chrome could not complete a headless launch because its GPU process crashed, and Node.js does not provide a real `AudioContext` or DOM. Real audio playback, mouse/keyboard interactions, and browser StrictMode behavior remain unverified.

### M4-01 — Xây giao diện quản lý audio và queue

- **Mô tả:** Tạo giao diện semantic để thêm audio, xem trạng thái/thứ tự queue, phát/dừng và hủy task; cung cấp thông báo dễ hiểu.
- **Hoàn thành khi:** Người dùng thao tác được bằng chuột và bàn phím; trạng thái queue và lỗi được trình bày rõ ràng.

### M4-02 — Hoàn thiện lifecycle và cleanup

- **Mô tả:** Quản lý và giải phóng `AudioBufferSourceNode`, `AudioContext`, RAF, listener và tài nguyên liên quan khi dừng, hủy hoặc unmount.
- **Hoàn thành khi:** Không phát chồng ngoài ý muốn hoặc để lại tài nguyên chạy sau cleanup; có thể chạy nhiều lượt mà không tích lũy source/frame cũ.

## M5 — Kiểm thử, AI Failure Audit và hoàn thiện bài

**M5-01 status:** Partial; mock and code-review checks passed, real-browser checks and screenshots are pending.

**Current evidence:** See `TEST_RESULTS.md`. The dev server and application modules returned HTTP 200. FIFO, cancellation, decode errors, playback lifecycle, FFT sizing, Canvas drawing helpers, and RAF cleanup passed mock checks. No real screenshot was captured.

**Environment limit:** Chrome and Edge headless both failed because the GPU process crashed. Real audio, direct UI interaction, actual viewport layout, browser memory, and measured FPS remain unverified.

### M5-01 — Kiểm thử chức năng, accessibility và hiệu năng

- **Mô tả:** Kiểm tra FIFO, yêu cầu đồng thời, cancellation, lỗi tải/decode, playback, cleanup, responsive và hiệu năng visualizer; sửa lỗi có bằng chứng.
- **Hoàn thành khi:** Kết quả kiểm tra được ghi lại; xác nhận không còn lỗi nghiêm trọng hoặc ghi rõ giới hạn môi trường; có screenshot output thực tế chứng minh chức năng.

### M5-02 — Lập AI Failure Audit và rà soát cuối

- **Mô tả:** Tạo `AI_FAILURE_AUDIT.md` bằng tiếng Anh đơn giản, ghi ít nhất 3 lỗi AI thực tế cùng prompt liên quan, code lỗi, rủi ro, cách phát hiện/sửa và bằng chứng kiểm tra.
- **Hoàn thành khi:** Mỗi lỗi có thể đối chiếu với code/commit/kiểm thử; không bịa lỗi; README, screenshot và các kiểm tra cuối được rà soát; commit milestone M5.

**M5-02 status:** Complete; the audit records 3 evidence-backed implementation failures, final build/lint checks passed, and this milestone documentation is committed. M5 overall remains partial because M5-01 still lacks real-browser verification and genuine screenshots.

**Evidence reviewed:** `TEST_RESULTS.md` records mock results and browser-only checks still marked Not Tested. `screenshots/` contains an explanatory README and no captured images. See `AI_FAILURE_AUDIT.md` for the three implementation issues and evidence.
