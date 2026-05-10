# Project Clone: Rophims.vip

Dự án này nhằm mục đích xây dựng một bản clone hoàn chỉnh của trang web xem phim `https://rophims.vip/` sử dụng công nghệ Next.js cho Frontend và NestJS cho Backend. Dữ liệu phim sẽ được cào từ API của `ophim.cc`.

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS (hoặc Vanilla CSS theo yêu cầu)
- **State Management**: React Context API hoặc Redux Toolkit
- **UI Components**: Headless UI, Radix UI hoặc Shadcn/UI
- **Player**: ArtPlayer hoặc Video.js
- **Icons**: Lucide React

### Backend
- **Framework**: NestJS
- **Database**: MongoDB (Sử dụng Mongoose hoặc Prisma với MongoDB provider)
- **Caching**: Redis
- **Crawler**: NestJS Schedule + Axios (để fetch dữ liệu từ ophim.cc)
- **Auth**: JWT, Passport.js, Google OAuth2

## Các Task Kỹ Thuật Chính

### 1. Phân tích & Thiết kế (Planning)
- [ ] Phân tích cấu trúc dữ liệu từ API `ophim.cc`.
- [ ] Thiết kế cơ sở dữ liệu để lưu trữ thông tin phim, tập phim, danh mục, quốc gia.
- [ ] Thiết kế UI/UX dựa trên `rophims.vip`.

### 2. Backend Development (NestJS)
- [ ] Khởi tạo dự án NestJS.
- [ ] Cấu hình Database & ORM (Prisma/TypeORM).
- [ ] Xây dựng module **Crawler**:
    - [ ] Script cào danh sách phim mới.
    - [ ] Script cào chi tiết từng phim và danh sách tập phim.
    - [ ] Tự động cập nhật dữ liệu định kỳ (Cron job).
- [ ] Xây dựng các API cho Frontend:
    - [ ] API lấy danh sách phim (phân trang, lọc theo thể loại, quốc gia, năm).
    - [ ] API lấy chi tiết phim.
    - [ ] API tìm kiếm (Search).
- [ ] Xây dựng hệ thống Authentication & User:
    - [ ] Đăng ký/Đăng nhập.
    - [ ] Bookmark phim yêu thích.

### 3. Frontend Development (Next.js)
- [ ] Khởi tạo dự án Next.js với App Router.
- [ ] Xây dựng hệ thống Layout (Header, Footer, Sidebar).
- [ ] Phát triển các trang chính:
    - [ ] **Home Page**: Slider, danh sách phim theo section.
    - [ ] **Movie Detail Page**: Thông tin phim, danh sách tập.
    - [ ] **Watch Page**: Trình phát video, chuyển tập, chuyển server.
    - [ ] **Search & Filter Page**: Lọc phim đa năng.
- [ ] Tối ưu hóa SEO (Metadata, Open Graph).
- [ ] Tối ưu hóa hiệu năng (Image Optimization, ISR/SSR).

### 4. Deployment & Testing
- [ ] Kiểm thử luồng cào dữ liệu và hiển thị.
- [ ] Deploy Backend lên VPS (Docker/PM2).
- [ ] Deploy Frontend lên Vercel hoặc VPS.
