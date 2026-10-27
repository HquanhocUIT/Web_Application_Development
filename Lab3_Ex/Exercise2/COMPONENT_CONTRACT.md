# Component Contract — Exercise 2

Thiết kế cho E2-02. Đây là hợp đồng dữ liệu và component để dùng trước khi khởi tạo React hoặc viết JSX/CSS ứng dụng.

## Data schema: `SMART_PEOPLE`

Mỗi phần tử là một object có `id` ổn định (string), `name` (string), `age` (number) và `iq` (number). Mảng ban đầu phải gồm đúng bảy người:

| id | name | age | iq |
|---|---|---:|---:|
| `sp-1` | Johann Goethe | 82 | 210 |
| `sp-2` | Albert Einstein | 76 | 205 |
| `sp-3` | Leonardo da Vinci | 67 | 180 |
| `sp-4` | Isaac Newton | 84 | 190 |
| `sp-5` | James Maxwell | 48 | 190 |
| `sp-6` | William Sidis | 46 | 200 |
| `sp-7` | Nguyen Phan Hoang Quan | 20 | 199 |

`SMART_PEOPLE` là nguồn mặc định để khởi tạo danh sách và khôi phục dữ liệu khi Reset. Không sửa trực tiếp mảng nguồn.

## Component: `ScientistDirectory`

- File dự kiến: `ScientistDirectory.jsx`.
- Functional component nhận `initialData` qua props, với ES6 default parameter `initialData = SMART_PEOPLE`.
- `people` khởi tạo từ `initialData`; thao tác Delete tạo mảng mới.
- Khi dùng `initialData` tùy chỉnh, Reset khôi phục đúng danh sách ban đầu đó; khi dùng mặc định, Reset phải trả lại đủ bảy bản ghi trên.

### State độc lập

Chỉ dùng `useState` cho các giá trị độc lập:

| State | Kiểu/giá trị ban đầu | Vai trò |
|---|---|---|
| `people` | array, lấy từ `initialData` | Danh sách đang quản lý sau Delete/Reset. |
| `query` | string rỗng | Nội dung Search. |
| `minIq` | number `0` | Ngưỡng IQ; `0` biểu thị không giới hạn. |
| `sortBy` | `'iq'` | Tiêu chí sort ban đầu; lựa chọn còn lại là `'age'`. |

Không lưu `visiblePeople` hoặc số lượng kết quả trong state. Không dùng `useEffect` cho Search, Filter hoặc Sort.

## Derived list pipeline

Tính `visiblePeople` trực tiếp trong render, theo thứ tự:

1. Chuẩn hóa tên tìm kiếm bằng `query.trim().toLowerCase()`.
2. Dùng `people.filter()` để giữ người có tên chứa chuỗi đã chuẩn hóa (cũng chuyển tên người sang chữ thường); chuỗi rỗng không lọc tên.
3. Lọc IQ theo `person.iq >= minIq`; `minIq === 0` không loại người nào.
4. Sắp xếp kết quả mới bằng `toSorted()` giảm dần theo `sortBy` (`iq` hoặc `age`), không gọi `sort()` trên state.

Mỗi item trong danh sách dùng `key={person.id}`. Khi cùng giá trị sort, giữ thứ tự ổn định do `toSorted()`.

### IQ input

- Dùng `<input type="number">` và đọc `event.target.valueAsNumber`.
- Giữ `minIq` luôn là số hữu hạn: nếu giá trị đọc được là `NaN` hoặc không hữu hạn (ví dụ input rỗng), đặt về `0`, nghĩa là không áp dụng ngưỡng.
- Nếu input được controlled, biểu diễn `0` dưới dạng giá trị rỗng để người dùng thấy ô trống khi không lọc; nhập `0` cũng có nghĩa là không giới hạn.

## Semantic HTML và accessibility

Cấu trúc dự kiến:

```text
section (aria-labelledby=directoryHeadingId)
├── h2#directoryHeadingId
├── form
│   ├── label[htmlFor=searchId] + input[type=search]#searchId
│   ├── label[htmlFor=minIqId] + input[type=number]#minIqId
│   ├── label[htmlFor=sortId] + select#sortId (IQ / Age)
│   └── button[type=button] Reset
├── output[role=status][aria-live=polite] (số kết quả)
├── ul
│   └── li[key=person.id]
│       └── article (thông tin person và button Delete)
└── p (thông báo khi không có kết quả, nếu cần)
```

Dùng `useId()` cho ID input và tiêu đề; mỗi `label` trỏ tới input/select bằng `htmlFor`. `output` thông báo số kết quả sau Search, Filter hoặc Delete. Nút Delete có tên truy cập rõ ràng gắn với người tương ứng; các nút form dùng `type="button"` khi không gửi form.

## Delete, Reset và trạng thái rỗng

- Delete theo ID bằng cập nhật bất biến: `setPeople((prev) => prev.filter((person) => person.id !== id))`. Không dùng `splice()` hoặc mutate mảng nguồn.
- Nếu xóa phần tử đang focus, chuyển focus tới nút Delete của hàng kế tiếp; nếu không có thì hàng trước đó; nếu danh sách rỗng thì chuyển tới ô Search. Giữ key theo `person.id`, không dùng vị trí hàng làm key.
- Reset khôi phục danh sách từ `initialData`. Đồng thời xóa Search, đặt `minIq` về `0` và `sortBy` về `'iq'` để người dùng thấy toàn bộ danh sách ban đầu.
- Khi không có kết quả, output thông báo `0`; hiển thị trạng thái rỗng dễ hiểu và không render hàng giả.

## Các trường hợp cần kiểm thử

- Có đúng bảy bản ghi, đúng tên/age/IQ/ID; sp-7 có mặt khi khởi tạo và sau Reset.
- Search phân biệt chữ thường/hoa không ảnh hưởng kết quả; kiểm tra trim khoảng trắng, chuỗi rỗng và không có kết quả.
- IQ threshold: input rỗng/NaN trở về không giới hạn; ngưỡng bằng, thấp hơn và cao hơn IQ của các bản ghi.
- Sort IQ giảm dần và Age giảm dần; các giá trị bằng nhau; xác nhận danh sách nguồn không bị mutate.
- Delete đúng ID, key của các mục còn lại ổn định; Reset sau khi xóa và sau khi đang lọc.
- Kiểm tra label/ID, output status, thao tác keyboard và focus sau Delete trong browser.
- Trong React DevTools Profiler, ghi một profile khi gõ đúng một ký tự vào Search; báo số commit/render đo được và những component cập nhật. Nếu DevTools không khả dụng, ghi rõ chưa đo, không tự khẳng định số lần render.
- Kiểm tra responsive và overflow tại kích thước hẹp; ghi lại kích thước và kết quả thực tế.

## Điều kiện hoàn thành E2-02

- Đã chốt schema cùng đủ bảy bản ghi, gồm yêu cầu bổ sung sp-7.
- Đã xác định props/state và pipeline derived `visiblePeople` bằng filter + `toSorted()`, không dùng state/effect riêng.
- Đã quy định xử lý Search, IQ rỗng/NaN, sort giảm dần, Delete bất biến, Reset và trạng thái rỗng.
- Đã mô tả cấu trúc semantic/accessibility, focus mong đợi và kế hoạch kiểm thử/Profiler.
- Tài liệu hợp đồng được tạo mà không khởi tạo project hoặc viết JSX/CSS ứng dụng.
