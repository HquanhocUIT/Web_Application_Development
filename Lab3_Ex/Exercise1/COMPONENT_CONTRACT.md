# Component Contract — Exercise 1

Thiết kế cho E1-02, trước khi khởi tạo React hoặc viết JSX/CSS ứng dụng. Tên người trong default dưới đây là nội dung placeholder để thay bằng dữ liệu profile thật khi triển khai.

## Components

### `DeveloperCard`

- Functional component trong `DeveloperCard.jsx`. Dùng ES6 default parameters và không chứa bất kỳ thẻ `<div>` nào.

| Prop | Kiểu dữ liệu | Giá trị mặc định | Ý nghĩa |
|---|---|---|---|
| `fullName` | string | `"Alex Morgan"` | Tên profile; cũng dùng để tính initials và nội dung `alt` của avatar. |
| `role` | string | `"Software Developer & Pro Gamer"` | Chức danh/mô tả vai trò. |
| `avatarUrl` | string hoặc `null` | `null` | URL ảnh tùy chọn; null hoặc URL không phải HTTPS sẽ dùng initials. |
| `metrics` | object gồm các cặp label/value dạng string hoặc number | `{}` | Metadata profile được render từ `Object.entries(metrics)`. |
| `skills` | array các skill object | `[]` | Kỹ năng chuyển thành danh sách `SkillBadge`. |

### `SkillBadge`

Component riêng trong `SkillBadge.jsx`, nhận một prop `skill` có dạng:

| Field | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | string hoặc number | Định danh ổn định, duy nhất trong danh sách; dùng làm React `key`. |
| `name` | string | Tên kỹ năng. |
| `level` | string | Mức độ kỹ năng, ví dụ `"Advanced"`. |

`SkillBadge` render một `<li>` bên trong `<ul>` của card, gồm tên và mức độ. Khi map danh sách, truyền dữ liệu bằng `<SkillBadge key={skill.id} skill={skill} />`.

## Cấu trúc semantic dự kiến

```text
article.card (aria-labelledby="titleId")
└── header.header
    ├── img.avatar OR span.avatarFallback
    └── hgroup.identity
        ├── h2.title (id="titleId")
        └── p.role
└── dl.metrics
    └── for each Object.entries(metrics):
        └── Fragment (key = metadata label)
            ├── dt.metricTerm
            └── dd.metricValue
└── ul.skillList
    └── for each skill:
        └── SkillBadge (key = skill.id), which renders li.skillBadge
```

Tạo `titleId` ổn định, duy nhất theo instance bằng React `useId()`. Gán ID đó cho `<h2>` và dùng đúng giá trị trong `aria-labelledby` của `<article>`. Metadata dùng `Object.entries(metrics).map(...)` và `<Fragment key={label}>` để mỗi `<dt>`/`<dd>` là cặp con trực tiếp của `<dl>`. Label là key ổn định vì object chỉ có một property cho mỗi key.

Không thêm wrapper `<div>`. Dùng React `Fragment` viết tường minh khi nhóm các cặp metadata.

## Avatar behavior

- Chỉ render `<img>` nếu `avatarUrl` parse được thành URL có protocol `https:`; bỏ qua URL HTTP, URL sai định dạng hoặc giá trị rỗng.
- Đặt thuộc tính HTML `width={96}` và `height={96}` trên ảnh để dành sẵn không gian và tránh layout shift; dùng `alt={fullName}`.
- Khi thiếu URL hoặc ảnh phát sinh `onError`, hiển thị initials tính từ tên, ví dụ `Alex Morgan` → `AM`.
- Không dùng `dangerouslySetInnerHTML`.

## CSS Module dự kiến

- File: `DeveloperCard.module.css`, được dùng bởi cả `DeveloperCard` và `SkillBadge`.
- Các class dự kiến: `.card`, `.header`, `.avatar`, `.avatarFallback`, `.identity`, `.title`, `.role`, `.metrics`, `.metricTerm`, `.metricValue`, `.skillList`, `.skillBadge`, `.skillName`, `.skillLevel`.
- Không dùng inline style; không cần global CSS cho card.

## Responsive 375px

- Card dùng `box-sizing: border-box`, `width: 100%`, giới hạn chiều rộng theo parent và padding phù hợp viewport hẹp.
- Các flex/grid child có `min-width: 0`; metadata và skills được phép wrap; tên dài được ngắt dòng.
- Trong media query cho viewport tối đa 375px, bố cục avatar/identity và danh sách kỹ năng phải co lại hoặc wrap, không tạo chiều rộng cố định vượt viewport.
- Tiêu chí xác nhận khi triển khai: đo ở viewport rộng 375 CSS px và xác nhận `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.

## Điều kiện hoàn thành E1-02

- Đã xác định props và default parameters của `DeveloperCard`, cùng cấu trúc `skill` gồm `id`, `name`, `level`.
- Đã mô tả cấu trúc dùng `article`, `header`, `hgroup`, `h2`, `dl`, `dt`, `dd`, `ul`, `li` và Fragment; không dùng `<div>` trong `DeveloperCard.jsx`.
- `aria-labelledby` liên kết article với tiêu đề; metadata render từ `Object.entries()` bằng Fragment có key ổn định; mỗi skill render qua `SkillBadge` với key là `skill.id`.
- Đã xác định quy tắc HTTPS, kích thước avatar và fallback initials, CSS Module/classes, cùng yêu cầu responsive 375px.
