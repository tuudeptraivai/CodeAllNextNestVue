# Backend Documentation: NestJS

Tài liệu này mô tả cấu trúc Backend và hệ thống cào dữ liệu (Crawler) từ `ophim.cc`.

## Công nghệ sử dụng
- **Framework**: NestJS
- **Database**: MongoDB
- **ORM**: Mongoose
- **Crawler**: Axios + NestJS Schedule (Cron Job)
- **Validation**: Class-validator + Class-transformer

## Database Schema (MongoDB / Mongoose)
Dự kiến các Model chính:
- **Category**: Danh mục phim (Hành động, Tình cảm...).
- **Country**: Quốc gia.
- **Movie**: Thông tin chi tiết phim (name, origin_name, content, thumb_url, poster_url, type, status, year...).
- **Episode**: Thông tin tập phim.
- **Server**: Các server lưu trữ video (tên server, link m3u8/embed).

## API Integration: ophim.cc

### Các Endpoint quan trọng:
1. **Danh sách phim mới**: `https://ophim1.cc/api/danh-sach/phim-moi-cap-nhat?page={page}`
2. **Chi tiết phim**: `https://ophim1.cc/api/phim/{slug}`

### Quy trình Crawler:
1. **Fetch Phim Mới**: Chạy định kỳ (mỗi 30 phút) để lấy danh sách phim vừa cập nhật.
2. **Check & Sync**: So sánh slug phim với database:
    - Nếu phim chưa có: Gọi API chi tiết phim -> Lưu vào DB.
    - Nếu phim đã có: Kiểm tra số lượng tập phim, nếu có tập mới -> Cập nhật thêm tập.
3. **Download Images (Optional)**: Có thể tải ảnh về server riêng hoặc sử dụng trực tiếp link của ophim (nên dùng proxy hoặc lưu link để tiết kiệm tài nguyên).

## Cấu trúc Module
```text
src/
├── modules/
│   ├── movie/         # Quản lý phim, danh mục, quốc gia
│   ├── crawler/       # Logic cào dữ liệu từ ophim.cc
│   ├── episode/       # Quản lý tập phim và link stream
│   ├── auth/          # JWT, Google Login
│   └── user/          # Quản lý người dùng, bookmark
├── common/            # DTOs, Entities, Interceptors, Filters
├── config/            # Cấu hình biến môi trường
└── main.ts            # Entry point
```

## Các tính năng Backend cần xử lý
- **Caching**: Sử dụng Redis để cache các API lấy danh sách phim trang chủ và chi tiết phim để giảm tải cho database.
- **Search**: Hỗ trợ tìm kiếm không dấu và có dấu (Sử dụng MongoDB Text Index hoặc đơn giản là regex `$regex`).
- **Slug Management**: Đảm bảo slug phim trùng khớp với cấu trúc URL của frontend để SEO tốt nhất.
- **Streaming Proxy (Nâng cao)**: Nếu link m3u8 bị chặn, cần viết một proxy nhỏ để bypass.

## Hướng dẫn triển khai Crawler
1. Tạo một `CrawlerService`.
2. Sử dụng `@Cron(CronExpression.EVERY_30_MINUTES)` để tự động quét phim mới.
3. Sử dụng `Axios` để fetch dữ liệu.
4. Xử lý đồng bộ dữ liệu vào MongoDB thông qua Mongoose.
