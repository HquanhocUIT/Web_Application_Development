# Work Breakdown Structure (WBS)

## Homework 1: Production Enterprise Data-Grid (WCAG 2.2 AA)

### Nguyên tắc thực hiện

- Chỉ làm task được yêu cầu; trước khi code xác định props, state, luồng dữ liệu và cách kiểm tra.
- Dùng React, TypeScript, HTML semantic, CSS và JavaScript đã học; không dùng thư viện UI/Data-Grid để thay bài.
- Giữ bảng bằng `table`, `thead`, `tbody`, `th`, `td` và nút/điều khiển HTML native. Chỉ thêm ARIA khi cần và kiểm tra với accessibility tree/công nghệ hỗ trợ.
- Sau mỗi milestone, kiểm tra thay đổi, chạy `npm run build` và `npm run lint` khi có code, rồi tạo một commit riêng. Chỉ stage file thuộc `Lab2_HW/HW1`.
- Các trạng thái dưới đây ghi nhận tiến độ hiện tại; không viết lại hoặc sửa lịch sử Git của các commit cũ.

### Trạng thái milestone

| Milestone | Trạng thái |
|---|---|
| M0 — Khảo sát và lập kế hoạch | Hoàn thành |
| M1 — Khởi tạo React + TypeScript | Hoàn thành |
| M2 — Thiết kế Data, Props và State | Hoàn thành |
| M3 — Xây dựng Semantic DataGrid | Hoàn thành |
| M4 — Sorting và Filtering | Hoàn thành |
| M5 — Pagination | Hoàn thành |
| M6 — Keyboard Navigation và Accessibility | Chưa bắt đầu |
| M7 — Responsive, Testing, Lighthouse và AI Audit | Chưa bắt đầu |

## M0: Khảo sát và lập kế hoạch — Hoàn thành

### M0-01 — Khảo sát workspace và hướng dẫn [Hoàn thành]

- **Mô tả:** Kiểm tra thư mục bài tập, file hiện có, Git và hướng dẫn trong thư mục liên quan; xác định phạm vi được phép thay đổi.
- **Hoàn thành khi:** Đã xác định đúng thư mục HW1, project ban đầu và các file cần giữ nguyên.

### M0-02 — Chốt yêu cầu, tiêu chí kiểm tra và commit [Hoàn thành]

- **Mô tả:** Chuyển yêu cầu bài tập thành checklist chức năng, accessibility, responsive, Lighthouse và quy tắc commit theo milestone.
- **Hoàn thành khi:** Mỗi yêu cầu có milestone thực hiện và cách xác minh; quy tắc một commit sau mỗi milestone được ghi rõ.

## M1: Khởi tạo React + TypeScript — Hoàn thành

### M1-01 — Tạo project React + TypeScript bằng Vite [Hoàn thành]

- **Mô tả:** Khởi tạo template Vite React TypeScript trực tiếp trong HW1, giữ nguyên tài liệu WBS và rules.
- **Hoàn thành khi:** Project có cấu hình React, TypeScript và Vite chạy được trong đúng thư mục.

### M1-02 — Cài dependencies, xác minh và commit nền [Hoàn thành]

- **Mô tả:** Cài dependencies hiện có, rà soát cấu hình, chạy ứng dụng/build/lint, dọn file demo không cần thiết và commit milestone M1.
- **Hoàn thành khi:** Trang khởi tạo chạy được, build/lint thành công, diff chỉ có file HW1 cần thiết và có commit M1.

## M2: Thiết kế Data, Props và State — Hoàn thành

### M2-01 — Định nghĩa Employee và dữ liệu mẫu [Hoàn thành]

- **Mô tả:** Tạo kiểu `Employee` cùng khoảng 15–20 bản ghi có ID ổn định, nhiều phòng ban và trạng thái.
- **Hoàn thành khi:** Dữ liệu có kiểu rõ ràng, ID duy nhất dùng làm React key và đủ đa dạng để kiểm tra chức năng.

### M2-02 — Thiết kế cấu hình cột và DataGrid props [Hoàn thành]

- **Mô tả:** Tạo cấu hình cột generic dùng `keyof`, tiêu đề, khả năng sort/filter và định dạng; định nghĩa props bắt buộc/tùy chọn cho DataGrid.
- **Hoàn thành khi:** Có cấu hình Employee đủ sáu cột; API props tái sử dụng được với kiểu hàng khác mà không dùng `any`.

### M2-03 — Định nghĩa state, luồng dữ liệu và rà soát hợp đồng [Hoàn thành]

- **Mô tả:** Định nghĩa state sort/filter/page/focus/selection, giá trị khởi tạo, quy tắc chuyển trạng thái và ví dụ dùng component; rà soát/build và commit M2.
- **Hoàn thành khi:** Props, kiểu dữ liệu và state nhất quán; xác định rõ thứ tự filter → sort → pagination, focus/selection và hành vi Enter/Space.

## M3: Xây dựng Semantic DataGrid — Hoàn thành

### M3-01 — Tạo bố cục trang và render bảng semantic [Hoàn thành]

- **Mô tả:** Tạo khung trang và DataGrid generic; render header từ cấu hình, dữ liệu 18 Employee, định dạng ô và trạng thái rỗng bằng markup bảng semantic.
- **Hoàn thành khi:** Bảng dùng `table`, `thead`, `tbody`, `tr`, `th scope="col"`, `td`; dữ liệu/cột đến từ props và keys ổn định.

### M3-02 — Tạo CSS và focus cơ bản [Hoàn thành]

- **Mô tả:** Tạo giao diện header/hàng/cell, vùng cuộn bảng, hover, selected dự phòng và focus-visible; giữ bảng dễ đọc.
- **Hoàn thành khi:** Bảng không làm tràn trang ngoài vùng cuộn; có focus nhìn thấy được và CSS nền tảng được tạo. Contrast 4.5:1 được xác minh lại ở M6.

### M3-03 — Kiểm tra render và commit giao diện [Hoàn thành]

- **Mô tả:** Kiểm tra sáu cột, 18 hàng, empty state, semantic markup, keys, build/lint và giao diện trước khi commit M3.
- **Hoàn thành khi:** Render cơ bản chính xác, không lỗi đã biết trong phạm vi M3 và có commit M3.

## M4: Sorting và Filtering — Đang thực hiện

### M4-01 — Chốt kiểu, comparator và quy tắc sorting [Hoàn thành]

- **Mô tả:** Định nghĩa state sort, chu kỳ không sort → tăng dần → giảm dần → không sort; so sánh chuỗi/số, xử lý giá trị trống, ổn định và không sửa `rows` gốc.
- **Hoàn thành khi:** Comparator và quy tắc cho cột sortable/non-sortable được định nghĩa, có thể tái sử dụng.

### M4-02 — Kết nối sorting với header button [Hoàn thành]

- **Mô tả:** Bật nút cho cột sortable, cập nhật sort state và hiển thị dữ liệu theo thứ tự; đổi cột bắt đầu tăng dần.
- **Hoàn thành khi:** Chu kỳ sort, bỏ sort, mũi tên trực quan, thứ tự dữ liệu và tính nguyên vẹn của props được kiểm tra trên giao diện.

### M4-03 — Hoàn thiện trạng thái trợ năng của sort và filtering [Hoàn thành]

- **Mô tả:** Hoàn tất/xác minh `aria-sort` chỉ trên `th` đang sort (bỏ thuộc tính khi không sort), tên nút, Tab/Enter/Space, focus và thông báo screen reader nếu công cụ có sẵn. Thêm điều khiển lọc có label, lọc theo các cột `filterable`, quy tắc khớp không phân biệt hoa thường, xóa truy vấn và trạng thái không có kết quả; xử lý filter trước sort.
- **Hoàn thành khi:** Sort tăng/giảm/none có trạng thái truy cập đúng; filter khớp/không khớp/rỗng hoạt động, có label và phối hợp với sort; không mutate props; build/lint và kiểm tra trình duyệt hoàn tất. Commit M4 gồm cập nhật WBS cùng Sorting/Filtering sau khi milestone hoàn thành.

## M5: Pagination — Hoàn thành

### M5-01 — Áp dụng phân trang sau filter và sort [Hoàn thành]

- **Mô tả:** Tính số trang và lát hàng đang hiển thị sau thứ tự filter → sort → pagination; dùng page size đã chọn/giá trị mặc định.
- **Hoàn thành khi:** Trang hiện tại và page count luôn hợp lệ khi dữ liệu, filter, sort hoặc page size thay đổi; dữ liệu gốc không bị sửa.

### M5-02 — Tạo điều khiển và thông tin trang truy cập được [Hoàn thành]

- **Mô tả:** Tạo nút trang trước/sau (và đầu/cuối nếu phù hợp), nhãn truy cập được, trạng thái disabled cùng thông tin phạm vi hàng/trang.
- **Hoàn thành khi:** Điều khiển dùng được bằng bàn phím; trạng thái đầu/cuối, một trang và không có kết quả được thể hiện rõ.

### M5-03 — Kiểm tra pagination và commit M5 [Hoàn thành]

- **Mô tả:** Kiểm tra dữ liệu rỗng, ít hơn một trang, nhiều trang, biên trang và thay đổi filter/sort; chạy build/lint và rà soát diff.
- **Hoàn thành khi:** Đúng lát dữ liệu và phạm vi hàng trong mọi trường hợp đã chọn; có commit riêng M5 chỉ gồm file HW1.

## M6: Keyboard Navigation và Accessibility — Chưa bắt đầu

### M6-01 — Điều hướng ô bằng bàn phím

- **Mô tả:** Thực hiện mô hình focus đã chọn; Up/Down/Left/Right chuyển giữa các ô, xử lý biên grid, Tab vào/ra và thay đổi focus khi sort/filter/page làm hàng không còn hiển thị.
- **Hoàn thành khi:** Có thể thao tác grid chỉ bằng bàn phím; focus luôn hợp lệ, nhìn thấy được và không bị mất khi dữ liệu hiển thị thay đổi.

### M6-02 — Thực hiện chọn hàng bằng Enter và Space

- **Mô tả:** Enter chọn/kích hoạt hàng đang focus; Space bật/tắt lựa chọn; cập nhật callback lựa chọn nếu được truyền và công bố trạng thái lựa chọn.
- **Hoàn thành khi:** Hai phím có hành vi riêng, `aria-selected`/trạng thái tương ứng chính xác và lựa chọn được giữ/xóa theo quy tắc đã định.

### M6-03 — Hoàn thiện semantic/ARIA và kiểm tra WCAG

- **Mô tả:** Kiểm tra cấu trúc bảng và accessibility tree; xác minh `role="grid"`, `role="row"`, `role="gridcell"` cùng tên header/cell và trạng thái sort/filter/page/selection; kiểm tra thông báo thay đổi, contrast, focus và screen reader.
- **Hoàn thành khi:** Semantic table vẫn được giữ; vai trò/trạng thái cần cho tương tác grid được accessibility tree công bố đúng; kiểm tra keyboard/screen reader và tiêu chí WCAG 2.2 AA liên quan được ghi lại; chữ thường đạt 4.5:1 và trạng thái không chỉ dựa vào màu. Có commit M6.

## M7: Responsive, Testing, Lighthouse và AI Audit — Chưa bắt đầu

### M7-01 — Hoàn thiện responsive

- **Mô tả:** Điều chỉnh bố cục trang, bảng và điều khiển cho viewport 320 CSS px, tablet và desktop; giới hạn cuộn ngang trong vùng bảng khi cần.
- **Hoàn thành khi:** Không che/cắt nội dung hay điều khiển thiết yếu, không tràn ngang toàn trang ngoài chủ đích và vẫn dùng được bằng bàn phím.

### M7-02 — Kiểm thử hồi quy và Lighthouse

- **Mô tả:** Kiểm tra lại sorting, filtering, pagination, bàn phím, lựa chọn, trạng thái rỗng, responsive và console; chạy build/lint cùng Lighthouse Accessibility và Best Practices.
- **Hoàn thành khi:** Lưu bằng chứng kiểm tra và điểm Lighthouse thực tế; mục tiêu mỗi mục 100/100 đạt được hoặc giới hạn còn lại được ghi rõ và xử lý trong phạm vi.

### M7-03 — Hoàn thiện AI_FAILURE_AUDIT.md và commit cuối

- **Mô tả:** Ghi ít nhất ba lỗi AI thực tế đã phát hiện trong quá trình làm bài, cách phát hiện, cách sửa và bằng chứng kiểm tra; rà soát diff/status và hoàn tất commit M7.
- **Hoàn thành khi:** Mỗi lỗi có bằng chứng thực tế và kết quả xác minh sau sửa; không tạo lỗi giả. Nếu chưa đủ ba sự cố thực, tiếp tục rà soát code/kết quả thực tế trước khi hoàn tất audit; có commit cuối chỉ gồm file Homework 1.

## Tiêu chí nghiệm thu toàn bài

| Yêu cầu | Cách xác minh | Milestone |
|---|---|---|
| DataGrid tái sử dụng, kiểu dữ liệu/props rõ ràng, semantic table và trạng thái rỗng | Rà soát interfaces/config; DOM có header, hàng, ô và 18 dữ liệu mẫu; thử danh sách rỗng. | M2–M3 |
| Sorting và trạng thái sort | Thử cột sortable/non-sortable, chu kỳ tăng/giảm/none, chuỗi/số/giá trị trống, dữ liệu gốc; xác nhận `aria-sort` trên header đang sort. | M4 |
| Filtering | Thử truy vấn khớp/không khớp/rỗng, xóa filter, không phân biệt hoa thường và phối hợp với sort. | M4 |
| Pagination | Thử dữ liệu rỗng, một/nhiều trang, đầu/cuối, phạm vi hàng và thay đổi filter/sort. | M5 |
| Bàn phím và lựa chọn | Thử Up/Down/Left/Right, biên grid, Tab vào/ra, Enter chọn và Space bật/tắt; xác nhận focus/selection sau sort/filter/page. | M6 |
| WCAG 2.2 AA và screen reader | Rà soát semantic/ARIA/accessibility tree, tên và trạng thái điều khiển, focus-visible, contrast 4.5:1, đích tương tác và screen reader có sẵn. | M4, M6–M7 |
| Responsive | Kiểm tra viewport 320 CSS px, tablet, desktop; nội dung không bị che và cuộn ngang nằm trong vùng bảng. | M7 |
| Lighthouse | Chạy và lưu kết quả Accessibility, Best Practices; mục tiêu 100/100 cho mỗi hạng mục. | M7 |
| AI failure audit | `AI_FAILURE_AUDIT.md` có ít nhất ba lỗi thực tế, phát hiện, sửa và bằng chứng kiểm tra; không bịa lỗi. | M7 |

### Quy tắc commit

Tạo một commit sau khi tất cả task trong milestone đạt tiêu chí; không commit riêng từng subtask. Giữ nguyên lịch sử commit M0–M3. Commit M4 sau khi hoàn tất cả sort/accessibility và filtering, bao gồm thay đổi WBS này; chỉ stage file thuộc `Lab2_HW/HW1`.
