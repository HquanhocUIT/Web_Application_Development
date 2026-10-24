# Work Breakdown Structure (WBS)

## Homework 1: Production Enterprise Data-Grid (WCAG 2.2 AA)

### Nguyên tắc thực hiện

- Hoàn thành theo thứ tự task bên dưới; chỉ chuyển sang task phụ thuộc khi tiêu chí hoàn thành của task trước đã đạt.
- Trước khi viết từng phần giao diện hoặc hành vi, xác định rõ dữ liệu, props, state và cách kiểm tra phần đó.
- Sau mỗi task có thay đổi ứng dụng, chạy phần kiểm tra phù hợp, xem lại kết quả và tạo Git commit riêng theo milestone.
- Dùng React, TypeScript, HTML semantic, CSS và JavaScript đã học trên lớp; giữ phạm vi phụ thuộc gọn.
- Ưu tiên bảng HTML semantic (`table`, `thead`, `tbody`, `th scope="col"`, `button`); chỉ thêm ARIA khi cần cho tương tác grid và xác minh cách kết hợp với công nghệ hỗ trợ.

## M0: Khảo sát và xác định phạm vi

### M0-01 — Kiểm tra thư mục project hiện tại

- **Mô tả:** Kiểm tra nội dung `Lab2_HW`, trạng thái Git và các hướng dẫn trong thư mục cha/con; ghi nhận project đang trống hay có sẵn tệp cần giữ lại.
- **Hoàn thành khi:** Đã xác nhận đúng thư mục làm việc, biết các tệp hiện có và không ghi đè nội dung ngoài phạm vi bài tập.

### M0-02 — Chốt phạm vi và tiêu chí nghiệm thu

- **Mô tả:** Chuyển yêu cầu bài tập thành danh sách hành vi cần có: hiển thị dữ liệu, sorting, filtering, pagination, điều hướng bàn phím, lựa chọn, accessibility, responsive và mục tiêu Lighthouse.

#### Tiêu chí phạm vi và nghiệm thu

| Yêu cầu | Tiêu chí hoàn thành và cách kiểm tra | Task WBS |
|---|---|---|
| Component và hiển thị dữ liệu | DataGrid tái sử dụng nhận dữ liệu/cấu hình cột có kiểu TypeScript qua props; bảng hiển thị đúng tiêu đề, hàng, ô và trạng thái rỗng. Kiểm tra với dữ liệu và cấu hình cột mẫu. | M2-01–M2-05, M3-01–M3-05 |
| Sorting | Cột hỗ trợ sort chuyển đúng thứ tự tăng/giảm; trạng thái sort được nhận biết. Kiểm tra thứ tự kết quả và trạng thái công bố cho cột. | M4-01–M4-04 |
| Filtering | Kết quả chỉ gồm hàng khớp quy tắc lọc; xử lý được truy vấn rỗng/không có kết quả và phối hợp đúng với sort, pagination. Kiểm tra khớp, không khớp, xóa bộ lọc và trang hiện tại. | M5-01–M5-04 |
| Pagination | Điều hướng trang hiển thị đúng lát dữ liệu, phạm vi hàng và trạng thái biên; không có trang vượt giới hạn. Kiểm tra dữ liệu rỗng, một/nhiều trang và thay đổi filter/sort. | M6-01–M6-04 |
| Bàn phím và lựa chọn | Up/Down/Left/Right di chuyển focus giữa ô; Enter chọn/kích hoạt ô hoặc hàng đang hoạt động; Space bật/tắt lựa chọn. Kiểm tra toàn bộ luồng chỉ bằng bàn phím, gồm biên grid và focus nhìn thấy được. | M7-01–M7-05 |
| Accessibility và WCAG 2.2 AA | Dùng HTML semantic cho bảng và ARIA phù hợp cho grid, hàng, ô và trạng thái; screen reader đọc được header, sort, lựa chọn và kết quả/điều khiển. Kiểm tra accessibility tree, screen reader, bàn phím, focus, các tiêu chí WCAG liên quan và tương phản văn bản thường ít nhất 4.5:1. | M3-02–M3-04, M4-03, M5-02, M6-02, M7-03, M8-01–M8-04, M10-02 |
| Responsive | Bảng và điều khiển sử dụng được ở viewport hẹp 320 CSS px, tablet và desktop; nội dung không bị che, và cuộn ngang (nếu cần cho bảng) được giới hạn trong vùng bảng. Kiểm tra các kích thước viewport đã nêu. | M9-01–M9-03 |
| Lighthouse | Mục tiêu là 100/100 cho cả Accessibility và Best Practices. Chạy Lighthouse trên ứng dụng hoàn thiện, lưu điểm/báo cáo và xác minh lại sau khi sửa lỗi. | M10-03 |

- **Hoàn thành khi:** Từng yêu cầu trong bảng có task WBS tương ứng và có cách kiểm tra đạt/không đạt cụ thể; dùng bảng này làm checklist nghiệm thu cuối bài.

### M0-03 — Lập kế hoạch kiểm tra và commit

- **Mô tả:** Chọn cách kiểm tra phù hợp với cấu hình project; xác định điểm kiểm tra và quy ước commit theo milestone để triển khai từng phần nhỏ.
- **Kế hoạch kiểm tra và commit:** Hoàn thành các task con của milestone, kiểm tra theo bảng dưới đây, sửa lỗi và chạy lại các bước bị ảnh hưởng. Chỉ tạo **một commit cho mỗi milestone**, sau khi milestone đó đạt tiêu chí; không commit riêng từng task con. Trước khi commit, rà soát diff và Git status, chỉ stage tệp thuộc Homework 1.

| Milestone | Kiểm tra sau khi hoàn thành | Git commit message (English) |
|---|---|---|
| M1 — Khởi tạo ứng dụng | Chạy `npm run dev`, mở trang và kiểm tra lỗi console; chạy `npm run build` để xác nhận cấu hình React, TypeScript và Vite. | `build: scaffold React TypeScript app with Vite` |
| M2 — Dữ liệu, props và state | Rà soát interface dữ liệu/cột/props/state và ví dụ sử dụng; chạy `npm run build` để kiểm tra kiểu TypeScript. | `feat(types): define DataGrid data and props contracts` |
| M3 — Bảng semantic và giao diện cơ bản | Chạy ứng dụng; kiểm tra header, hàng, ô, trạng thái rỗng, cấu trúc bảng semantic, hiển thị trực quan và console; chạy build. | `feat(grid): render semantic table foundation` |
| M4 — Sorting | Kiểm tra tăng dần, giảm dần, bỏ sort theo quy tắc đã chọn, kiểu giá trị mẫu, cột không hỗ trợ sort, thông báo trạng thái và không mutate dữ liệu gốc; chạy build. | `feat(grid): add sortable columns` |
| M5 — Filtering | Kiểm tra có kết quả, không kết quả, xóa filter và quy tắc so khớp; xác nhận phối hợp với sort/pagination, nhãn điều khiển và trang hợp lệ; chạy build. | `feat(grid): add table filtering` |
| M6 — Pagination | Kiểm tra dữ liệu rỗng, ít hơn một trang, đúng ranh giới trang, nhiều trang, nút đầu/cuối, thông tin phạm vi và thay đổi filter/sort; chạy build. | `feat(grid): add pagination controls` |
| M7 — Bàn phím và lựa chọn | Chỉ dùng bàn phím để kiểm tra bốn phím mũi tên và biên grid, Tab vào/ra, Enter chọn/kích hoạt, Space bật/tắt lựa chọn, focus nhìn thấy được và hành vi sau sort/filter/page; chạy build. | `feat(grid): add keyboard navigation and selection` |
| M8 — Accessibility và WCAG 2.2 AA | Rà soát accessibility tree và ARIA/semantic; kiểm tra screen reader, keyboard, nhãn/trạng thái, focus, tương phản văn bản tối thiểu 4.5:1 và các tiêu chí WCAG liên quan bằng công cụ cùng kiểm tra thủ công; chạy build. | `fix(a11y): address WCAG 2.2 AA issues` |
| M9 — Responsive | Kiểm tra viewport 320 CSS px, tablet và desktop; xác nhận nội dung/điều khiển không bị che, cuộn ngang nằm trong vùng bảng nếu cần, không tràn trang ngoài ý muốn; chạy build. | `style: improve responsive DataGrid layout` |
| M10 — Kiểm thử và đánh giá cuối | Chạy lại build và hồi quy các chức năng/trường hợp biên; chạy Lighthouse và ghi điểm Accessibility/Best Practices (mục tiêu 100/100 mỗi loại); hoàn thiện `AI_FAILURE_AUDIT.md` bằng lỗi AI thực tế, cách phát hiện/sửa và bằng chứng. | `test: verify DataGrid behavior and Lighthouse criteria` |

- **Commit M0:** Sau khi rà soát thay đổi thuộc Homework 1, tạo một commit cho toàn bộ milestone M0 với message `docs: complete project planning and WBS`.
- **Hoàn thành khi:** Kế hoạch kiểm tra và commit đã có cho M1–M10; nguyên tắc commit một lần sau mỗi milestone được xác định rõ; các task M0 đã hoàn tất và tài liệu sẵn sàng được commit.

## M1: Khởi tạo ứng dụng

### M1-01 — Khởi tạo React + TypeScript bằng Vite

- **Mô tả:** Tạo ứng dụng Vite với template React TypeScript trong `Lab2_HW`, giữ cấu hình mặc định cần thiết và không thêm dependency chưa có lý do.
- **Hoàn thành khi:** Project có cấu trúc Vite React TypeScript chuẩn và các tệp khởi tạo chạy được.

### M1-02 — Xác minh cấu hình và ứng dụng khởi tạo

- **Mô tả:** Cài dependencies theo manifest, chạy lệnh kiểm tra/build có sẵn và mở ứng dụng khởi tạo để xác nhận cấu hình hoạt động.
- **Hoàn thành khi:** Cài đặt và build thành công; trang khởi tạo hiển thị; không có lỗi TypeScript hoặc lỗi console do phần khởi tạo.

### M1-03 — Rà soát cấu trúc và tạo commit nền

- **Mô tả:** Rà soát diff của phần khởi tạo, loại bỏ tệp demo không cần thiết nếu phù hợp và commit trạng thái nền.
- **Hoàn thành khi:** Diff chỉ gồm các thay đổi cần cho ứng dụng và có commit nền với thông điệp mô tả rõ.

## M2: Thiết kế dữ liệu, props và state

### M2-01 — Xác định kiểu dữ liệu cho một hàng

- **Mô tả:** Chọn dữ liệu mẫu phù hợp cho bảng và định nghĩa TypeScript interface/type cho một bản ghi, bao gồm khóa định danh ổn định.
- **Hoàn thành khi:** Mỗi trường dữ liệu cần hiển thị có kiểu rõ ràng; hàng có ID duy nhất, ổn định và dùng được làm React key.

### M2-02 — Xác định cấu hình cột

- **Mô tả:** Thiết kế interface cho cột, gồm khóa dữ liệu, tiêu đề, cách hiển thị, khả năng sort/filter và các thông tin cần cho accessibility.
- **Hoàn thành khi:** Cột được mô tả bằng kiểu TypeScript; cấu hình có thể dùng để render header và cell mà không cần viết riêng từng cột trong component.

### M2-03 — Xác định API props của DataGrid

- **Mô tả:** Thiết kế props công khai cho component tái sử dụng, tối thiểu gồm dữ liệu, cấu hình cột và các tùy chọn hành vi cần thiết; xác định props bắt buộc và tùy chọn.
- **Hoàn thành khi:** Interface props được ghi rõ và có thể mô tả cách dùng component với một bộ dữ liệu khác.

### M2-04 — Xác định state và quy tắc chuyển trạng thái

- **Mô tả:** Liệt kê state nội bộ/có kiểm soát cần cho sort, filter, pagination, ô đang focus và lựa chọn; xác định cách các chức năng phối hợp khi điều kiện dữ liệu thay đổi.
- **Hoàn thành khi:** Mỗi state có kiểu và ý nghĩa rõ; quy tắc như quay về trang đầu khi lọc/sort và hành vi Enter/Space được xác định trước khi code.

### M2-05 — Rà soát hợp đồng component và commit thiết kế

- **Mô tả:** Kiểm tra interface dữ liệu, cột, props và state cùng nhau; ghi chú ví dụ sử dụng dự kiến rồi commit thiết kế/types.
- **Hoàn thành khi:** Hợp đồng component nhất quán, đáp ứng yêu cầu tái sử dụng và có commit riêng cho phần thiết kế.

## M3: Dựng bảng semantic và giao diện cơ bản

### M3-01 — Tạo khung trang và vùng nội dung bảng

- **Mô tả:** Tạo bố cục trang tối thiểu với tiêu đề, hướng dẫn ngắn và vùng đặt DataGrid; dùng landmark HTML phù hợp.
- **Hoàn thành khi:** Nội dung có cấu trúc heading/landmark hợp lý và có vùng hiển thị bảng rõ ràng.

### M3-02 — Render header từ cấu hình cột

- **Mô tả:** Dựng `table`, `thead`, hàng tiêu đề và `th scope="col"` từ cấu hình cột; đặt nội dung tương tác trong `button` khi cần.
- **Hoàn thành khi:** Tên cột khớp cấu hình, quan hệ header được đánh dấu semantic và không có lỗi key của React.

### M3-03 — Render hàng và ô dữ liệu

- **Mô tả:** Dựng `tbody`, `tr` và ô dữ liệu từ props; xử lý danh sách rỗng và định dạng giá trị cần thiết.
- **Hoàn thành khi:** Dữ liệu truyền qua props hiển thị đúng hàng/cột; trạng thái không có dữ liệu được thông báo bằng văn bản.

### M3-04 — Tạo kiểu trực quan và trạng thái focus

- **Mô tả:** Tạo CSS cho bảng dễ đọc, phân cấp header/cell, focus nhìn thấy được, trạng thái hover/selected và thông báo trạng thái.
- **Hoàn thành khi:** Nội dung dễ quét, focus rõ ràng và màu chữ/nền đạt tương phản tối thiểu 4.5:1 cho văn bản thường.

### M3-05 — Kiểm tra render cơ bản và commit giao diện

- **Mô tả:** Chạy ứng dụng, kiểm tra dữ liệu mẫu, semantic markup, lỗi console và diff trước khi commit milestone giao diện.
- **Hoàn thành khi:** Bảng render đúng ở trạng thái cơ bản, không lỗi console và có commit riêng.

## M4: Sorting

### M4-01 — Định nghĩa kiểu và quy tắc sort

- **Mô tả:** Xác định cột có thể sort, kiểu so sánh giá trị và chu kỳ trạng thái tăng dần/giảm dần/không sort.
- **Hoàn thành khi:** Quy tắc sort có thể áp dụng đúng cho các kiểu dữ liệu trong mẫu và state sort được định kiểu.

### M4-02 — Triển khai sort qua header button

- **Mô tả:** Kết nối thao tác header với state sort và sắp xếp danh sách hiển thị; giữ nguyên dữ liệu props gốc.
- **Hoàn thành khi:** Bấm header đổi thứ tự đúng, cột không hỗ trợ sort không kích hoạt hành vi và dữ liệu gốc không bị mutate.

### M4-03 — Thông báo trạng thái sort và kiểm tra

- **Mô tả:** Thể hiện hướng sort trực quan và bằng thuộc tính accessibility phù hợp như `aria-sort`; kiểm tra bàn phím và trình đọc màn hình nếu có.
- **Hoàn thành khi:** Người dùng nhận biết được cột/trạng thái đang sort; sort phối hợp đúng với trang hiện tại và có kết quả kiểm tra được rà soát.

### M4-04 — Rà soát và commit sorting

- **Mô tả:** Kiểm tra các thứ tự tăng/giảm, cột không sort, dữ liệu rỗng và diff; commit chức năng sort.
- **Hoàn thành khi:** Các trường hợp chính hoạt động đúng và có commit riêng cho sorting.

## M5: Filtering

### M5-01 — Xác định phạm vi và kiểu filter

- **Mô tả:** Chọn filter toàn bảng hay theo cột, quy tắc so khớp, xử lý chữ hoa/thường và giá trị trống.
- **Hoàn thành khi:** Quy tắc lọc nhất quán với các trường dữ liệu và được phản ánh trong state/props đã thiết kế.

### M5-02 — Dựng điều khiển lọc có nhãn

- **Mô tả:** Tạo input/select lọc phù hợp với giao diện, nhãn hiển thị và hướng dẫn ngắn nếu cần.
- **Hoàn thành khi:** Mỗi điều khiển có label liên kết đúng và dùng được bằng bàn phím.

### M5-03 — Lọc dữ liệu và phối hợp với sort/page

- **Mô tả:** Lọc danh sách hiển thị mà không sửa dữ liệu gốc; phối hợp thứ tự xử lý filter, sort, pagination và trạng thái không có kết quả.
- **Hoàn thành khi:** Kết quả khớp quy tắc đã chốt; thay đổi filter đưa về trang hợp lệ; thông báo không có kết quả rõ ràng.

### M5-04 — Rà soát và commit filtering

- **Mô tả:** Kiểm tra khớp/không khớp, nhập rỗng, dữ liệu rỗng, tương tác bàn phím và diff; commit chức năng lọc.
- **Hoàn thành khi:** Trường hợp chính hoạt động đúng và có commit riêng cho filtering.

## M6: Pagination

### M6-01 — Xác định state và quy tắc phân trang

- **Mô tả:** Chọn kích thước trang mặc định, cách tính trang, hành vi khi filter/sort làm thay đổi số hàng và cách xử lý dữ liệu rỗng.
- **Hoàn thành khi:** Công thức số trang và quy tắc trang hiện tại được xác định rõ cho mọi số lượng hàng.

### M6-02 — Dựng điều khiển pagination

- **Mô tả:** Tạo nút trang trước/sau, hiển thị số trang và thông tin hàng đang xem; dùng button semantic và nhãn dễ hiểu.
- **Hoàn thành khi:** Điều khiển có tên truy cập được, trạng thái disabled đúng và có thể thao tác bằng bàn phím.

### M6-03 — Áp dụng phân trang lên dữ liệu đã xử lý

- **Mô tả:** Chỉ hiển thị lát dữ liệu của trang hiện tại sau filtering và sorting; bảo đảm trang luôn nằm trong phạm vi hợp lệ.
- **Hoàn thành khi:** Chuyển trang hiển thị đúng hàng, thông tin phạm vi chính xác và không xuất hiện trang vượt giới hạn.

### M6-04 — Rà soát và commit pagination

- **Mô tả:** Kiểm tra dữ liệu ít hơn/mất đúng một trang/nhiều trang, trang đầu/cuối và thay đổi filter; commit chức năng phân trang.
- **Hoàn thành khi:** Các biên trang hoạt động đúng và có commit riêng cho pagination.

## M7: Điều hướng bàn phím và lựa chọn

### M7-01 — Chốt mô hình focus cho grid

- **Mô tả:** Chọn cách quản lý focus (ví dụ roving `tabIndex` hoặc `aria-activedescendant`), vị trí focus ban đầu và hành vi khi dữ liệu/trang thay đổi.
- **Hoàn thành khi:** Mô hình cho phép Tab vào/ra grid hợp lý và xác định được ô đang hoạt động.

### M7-02 — Di chuyển bằng phím mũi tên

- **Mô tả:** Xử lý Up/Down/Left/Right để di chuyển giữa ô trong phạm vi grid, có quy tắc rõ tại biên hàng, biên cột và khi grid rỗng.
- **Hoàn thành khi:** Mỗi phím đưa focus đến ô dự kiến, không cuốn trang ngoài ý muốn và focus luôn nhìn thấy.

### M7-03 — Xử lý Enter, Space và trạng thái lựa chọn

- **Mô tả:** Triển khai Enter để chọn/kích hoạt ô hoặc hàng đang hoạt động và Space để bật/tắt lựa chọn theo mô hình đã chốt; thông báo trạng thái lựa chọn bằng thuộc tính phù hợp.
- **Hoàn thành khi:** Enter và Space có hành vi riêng, nhất quán, có thể dùng chỉ bằng bàn phím và trạng thái được đọc/nhận biết rõ.

### M7-04 — Kiểm tra kết hợp điều hướng với sort/filter/page

- **Mô tả:** Kiểm tra focus và lựa chọn khi danh sách thay đổi, chuyển trang, thay bộ lọc hoặc đổi thứ tự; xử lý focus nếu ô hiện tại không còn.
- **Hoàn thành khi:** Focus không mất vào vị trí không tồn tại và lựa chọn tuân theo quy tắc đã định.

### M7-05 — Rà soát và commit keyboard interaction

- **Mô tả:** Thực hiện walkthrough chỉ bằng bàn phím, rà soát code xử lý phím và commit milestone.
- **Hoàn thành khi:** Có thể vào, di chuyển, chọn, bỏ chọn và rời grid bằng bàn phím; có commit riêng.

## M8: Accessibility và WCAG 2.2 AA

### M8-01 — Hoàn thiện cấu trúc semantic và ARIA

- **Mô tả:** Rà soát bảng semantic và quyết định cách bổ sung `role="grid"`, `role="row"`, `role="gridcell"` cùng tên/quan hệ truy cập được; tránh xung đột giữa role ARIA và semantics của bảng.
- **Hoàn thành khi:** Cấu trúc được kiểm tra với accessibility tree; vai trò và tên được công nghệ hỗ trợ công bố như dự định.

### M8-02 — Bổ sung trạng thái và thông báo cho screen reader

- **Mô tả:** Rà soát label, mô tả, sort, lựa chọn, kết quả lọc, phân trang và thông báo cập nhật động; dùng live region khi có ích.
- **Hoàn thành khi:** Các hành động và kết quả quan trọng được công bố rõ, không lặp thông tin gây nhiễu.

### M8-03 — Kiểm tra focus, contrast và tiêu chí WCAG

- **Mô tả:** Kiểm tra focus nhìn thấy được, tương phản văn bản tối thiểu 4.5:1, trạng thái không chỉ dựa vào màu sắc, kích thước/đích tương tác và các tiêu chí WCAG 2.2 AA liên quan.
- **Hoàn thành khi:** Các kiểm tra thủ công và công cụ chỉ ra không còn lỗi đã biết trong phạm vi giao diện; vấn đề phát hiện được ghi nhận và xử lý.

### M8-04 — Kiểm tra bằng screen reader và commit accessibility

- **Mô tả:** Dùng screen reader sẵn có để đọc header, điều hướng ô, sort, lựa chọn và pagination; rà soát diff và commit các cải thiện accessibility.
- **Hoàn thành khi:** Luồng chính có thể hiểu và thao tác qua screen reader; ghi lại công cụ/môi trường đã kiểm tra và có commit riêng.

## M9: Responsive và hoàn thiện giao diện

### M9-01 — Xác định hành vi bảng ở màn hình hẹp

- **Mô tả:** Chọn cách giữ khả năng đọc và thao tác khi viewport nhỏ, chẳng hạn cuộn ngang trong vùng bảng; xác định thông tin nào cần luôn nhìn thấy.
- **Hoàn thành khi:** Hành vi mobile/tablet/desktop được mô tả và không làm mất dữ liệu hay điều khiển thiết yếu.

### M9-02 — Triển khai CSS responsive

- **Mô tả:** Điều chỉnh bố cục trang, vùng cuộn bảng, kích thước chữ/đích tương tác và vị trí điều khiển theo breakpoint phù hợp.
- **Hoàn thành khi:** Nội dung dùng được ở viewport hẹp và rộng; không có cuộn ngang toàn trang ngoài chủ đích.

### M9-03 — Kiểm tra responsive và commit giao diện

- **Mô tả:** Kiểm tra viewport di động, tablet và desktop; xem focus, tương phản và các điều khiển tại từng kích thước; commit milestone.
- **Hoàn thành khi:** Không có nội dung hoặc thao tác bị che/cắt trong các kích thước đã chọn và có commit riêng.

## M10: Kiểm thử và đánh giá cuối

### M10-01 — Kiểm tra logic dữ liệu và chức năng

- **Mô tả:** Kiểm tra các luồng sort, filter, pagination, điều hướng phím và lựa chọn trên dữ liệu thường, dữ liệu rỗng và trường hợp biên bằng phương pháp phù hợp với project.
- **Hoàn thành khi:** Kết quả mong đợi được xác nhận cho các trường hợp chính; lỗi phát hiện được sửa và kiểm tra lại.

### M10-02 — Kiểm tra accessibility tự động và thủ công

- **Mô tả:** Chạy kiểm tra accessibility phù hợp, rà soát semantic/ARIA, keyboard walkthrough và screen reader; phân biệt lỗi thực với cảnh báo cần đánh giá.
- **Hoàn thành khi:** Không còn lỗi WCAG nghiêm trọng đã biết trong phạm vi; kết quả và giới hạn kiểm tra được ghi lại.

### M10-03 — Chạy Lighthouse Accessibility và Best Practices

- **Mô tả:** Chạy Lighthouse trên bản build/serve phù hợp, xem báo cáo, khắc phục vấn đề thuộc phạm vi và chạy lại.
- **Hoàn thành khi:** Báo cáo đạt mục tiêu 100/100 cho Accessibility và Best Practices hoặc các giới hạn còn lại được ghi rõ kèm lý do.

### M10-04 — Rà soát cuối và tạo commit hoàn tất

- **Mô tả:** Chạy lại build và các kiểm tra đã chọn, rà soát diff/status Git, loại bỏ thay đổi thừa và commit trạng thái hoàn tất.
- **Hoàn thành khi:** Build và kiểm tra cuối thành công, working tree được rà soát và có commit mô tả phần hoàn thiện.
