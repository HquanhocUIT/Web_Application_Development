# Component Contract — Exercise 3

Thiết kế trước khi khởi tạo React hoặc viết JSX/CSS ứng dụng.

## Data schema: `PUBG_VN_SQUADS`

Mỗi đội có `id` (string ổn định), `name`, `map`, `phase` (number), `alive` (number), `kills` (number), `wwcdProb` (number, đơn vị %) và `status`.

| id | name | map | phase | alive | kills | wwcdProb | status |
|---|---|---|---:|---:|---:|---:|---|
| `ces` | Cerberus Esports | Erangel | 6 | 4 | 14 | 68 | In Safe Zone |
| `te` | The Expendables | Miramar | 7 | 4 | 18 | 82 | Holding High Ground |
| `ge` | Genius Esports | Taego | 5 | 3 | 9 | 41 | Rotating Blue Zone |

## Components and props

- `App` giữ `squadId`, khởi đầu là `'te'`, cùng selector để chọn CES/TE/GE; đổi selector cập nhật `squadId` ở App.
- `PubgMatchTelemetry({ squadId = 'te' })` tải và hiển thị telemetry của đội được chọn. Không giữ một bản sao `squadId` trong component này.
- State của view là một object duy nhất: `{ status, data, error }`. State độc lập bổ sung là `retryTick`, khởi đầu `0`.
- Không tách trạng thái request thành nhiều state boolean như `isLoading`, `isError`, `isSuccess`.

## State machine

| State hiện tại | Sự kiện | State tiếp theo | Kết quả |
|---|---|---|---|
| `IDLE` | effect khởi chạy | `LOADING` | Xóa dữ liệu/lỗi cũ và bắt đầu request. |
| `LOADING` | request thành công | `SUCCESS` | Lưu dữ liệu đội hiện hành, `error: null`. |
| `LOADING` | lỗi mạng/packet loss thật | `ERROR` | Lưu thông báo lỗi, không giữ telemetry cũ. |
| `LOADING` | request bị abort | Không đổi sang `ERROR` | Bỏ qua `AbortError`; request đã bị hủy. |
| `SUCCESS` hoặc `ERROR` | `squadId` đổi | `LOADING` | Cleanup request cũ rồi tải đội mới. |
| `ERROR` | Retry | `LOADING` | Tăng `retryTick`, effect tải lại cùng đội. |

`IDLE` là trạng thái khởi tạo; effect tải ban đầu sẽ chuyển sang `LOADING`. Chỉ response còn hiệu lực của `squadId` hiện tại được phép cập nhật view.

## Telemetry loader, cancellation và packet loss

- API dự kiến: `fetchPubgTelemetry(squadId, { signal })`, trả Promise dữ liệu đội.
- Mỗi lần effect chạy tạo `AbortController` mới, truyền `controller.signal` vào loader và cleanup gọi `controller.abort()`.
- Thời gian chờ mô phỏng phải lắng nghe `signal`, hủy timer/listener và reject bằng lỗi `name === 'AbortError'` khi bị hủy; không chỉ bỏ qua kết quả sau khi request hoàn tất.
- Bỏ qua `AbortError`. Cleanup/cờ hiệu lực kết hợp với signal ngăn request cũ ghi đè kết quả sau khi đổi đội hoặc unmount.
- Effect phụ thuộc chính xác vào `[squadId, retryTick]`.
- Sau thời gian chờ, Erangel và Miramar có xác suất packet loss 35% cho mỗi request; khi xảy ra, loader reject lỗi mạng thông thường. Taego không áp dụng xác suất này.
- `AbortError` luôn được phân biệt với lỗi mạng và không tạo alert.

## UI semantic và accessibility

- `App`: `<main>`, `<label htmlFor>` và `<select>` có accessible name; các lựa chọn dùng key/id `ces`, `te`, `ge`.
- `LOADING`: Skeleton card cao 220px, hiệu ứng pulsing Blue-Zone; vùng tải có `aria-busy="true"` và thông báo loading có thể truy cập được.
- `SUCCESS`: `<section>` có heading; `<article>` hiển thị name và `<dl>` với map, phase, alive, kills, WWCD probability và status.
- `ERROR`: `<section role="alert">` có nội dung lỗi dễ hiểu và `<button type="button">Reconnect Satellite</button>`.
- Có focus style rõ ràng, bố cục responsive và hỗ trợ `prefers-reduced-motion` cho hiệu ứng pulse.

## Cơ chế Retry

Nút Reconnect chỉ xuất hiện ở `ERROR`. Khi kích hoạt, tăng `retryTick`; effect chạy lại với `squadId` hiện tại. Request mới tạo controller riêng, chuyển view sang `LOADING` và xóa lỗi cũ.

## Kế hoạch kiểm thử

- Ba bản ghi đúng schema/giá trị; component mặc định theo dõi `te` và selector cập nhật đúng prop.
- Tải thành công từng đội; đủ telemetry fields ở `SUCCESS`.
- Packet loss 35% trên Erangel/Miramar; Taego không chịu xác suất này. Có thể stub `Math.random()` trong unit test để tái hiện cả success và failure mà không chờ ngẫu nhiên.
- Hủy trong lúc delay: signal bị abort, Promise reject `AbortError`, timer dừng, không có alert.
- Đổi nhanh CES → TE → GE; response cũ hoàn tất sau response mới nhưng không ghi đè đội hiện hành.
- Unmount khi đang tải gọi cleanup/abort; không có state update muộn.
- Retry sau `ERROR` tăng `retryTick` và tạo request mới; thử cả retry thành công lẫn thất bại.
- Có thể kiểm thử loader và abortable delay bằng Node test runner với fake/stub random. Race-condition của React effect cần component/browser integration test khi môi trường hỗ trợ.
- Kiểm tra Skeleton/`aria-busy`, alert, keyboard/focus, responsive 375px, console và React DevTools/Slow 3G nếu khả dụng; ghi rõ giới hạn thay vì tự nhận đã kiểm tra.

## Điều kiện hoàn thành E3-02

- Hợp đồng ghi đúng ba đội và đầy đủ schema/giá trị.
- Đã xác định prop `squadId = 'te'`, selector do App quản lý, view-state object và bốn trạng thái.
- Đã mô tả loader bất đồng bộ, abort thực sự, stale-response guard, phân biệt `AbortError`, packet loss và Retry bằng `retryTick`.
- Đã chốt semantic UI/accessibility, các trường hợp kiểm thử và cách kiểm tra loader không cần browser.
- Chỉ tạo tài liệu hợp đồng; chưa khởi tạo project hay viết JSX/CSS ứng dụng.
