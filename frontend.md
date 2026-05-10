# Frontend Documentation: Next.js

Tài liệu này mô tả kiến trúc và các tính năng chính của Frontend cho dự án Clone Rophims sử dụng Next.js.

## Công nghệ sử dụng
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion (cho animation)
- **Data Fetching**: React Query (TanStack Query) hoặc Server Components
- **Video Player**: ArtPlayer.js

## Cấu trúc thư mục (Suggested)
```text
src/
├── app/               # Next.js App Router
│   ├── (auth)/        # Login, Register
│   ├── movie/         # [slug] detail page
│   ├── watch/         # [slug] player page
│   ├── search/        # Filter & Search results
│   └── layout.tsx     # Root layout
├── components/        # UI Components
│   ├── common/        # Header, Footer, Button, Input
│   ├── movie/         # MovieCard, MovieSlider, MovieList
│   ├── player/        # Custom Video Player
│   └── shared/        # Modals, Toast
├── hooks/             # Custom React Hooks
├── services/          # API calls
├── store/             # State management (Zustand/Context)
├── types/             # TypeScript interfaces
└── utils/             # Helper functions
```

## Các tính năng chính

### 1. Trang chủ (Home Page)
- **Hero Slider**: Hiển thị các phim hot/mới nhất với hiệu ứng chuyển cảnh mượt mà.
- **Section Grid**: Hiển thị phim theo các mục: Phim Lẻ Mới, Phim Bộ Mới, Anime, v.v.
- **Responsive Layout**: Tối ưu hiển thị trên Mobile, Tablet và Desktop.

### 2. Trang chi tiết phim (Movie Detail)
- Hiển thị đầy đủ thông tin: Poster, Backdrop, Title, IMDB, Year, Genre, Description.
- Danh sách tập phim (cho phim bộ) hoặc nút "Xem ngay" (cho phim lẻ).
- Phần đề xuất phim liên quan.

### 3. Trình phát phim (Watch Page)
- Tích hợp **ArtPlayer** hỗ trợ:
    - Chuyển đổi Server (từ API ophim).
    - Chỉnh tốc độ, chất lượng.
    - Chế độ rạp chiếu phim (Theater mode).
- Hệ thống tập phim hiển thị bên dưới hoặc bên cạnh player.

### 4. Tìm kiếm & Lọc (Search & Filter)
- Search Box với tính năng gợi ý kết quả (Debounce search).
- Trang lọc nâng cao theo: Thể loại, Quốc gia, Năm, Trạng thái (Đang chiếu/Hoàn thành).

### 5. SEO & Performance
- Sử dụng `next/image` để tối ưu dung lượng ảnh.
- Cấu hình Metadata động cho từng trang phim.
- Sử dụng Incremental Static Regeneration (ISR) cho các trang phim để đảm bảo tốc độ tải nhanh và dữ liệu luôn mới.

## Giao diện (Aesthetics)
- **Theme**: Dark Mode làm chủ đạo (Background: `#0f0f0f` hoặc `#1a1a1a`).
- **Accent Color**: Golden/Yellow (`#f8d68d`) cho các nút hành động và điểm nhấn.
- **Hiệu ứng**: Hover card phóng to nhẹ, skeleton loading khi tải dữ liệu.
