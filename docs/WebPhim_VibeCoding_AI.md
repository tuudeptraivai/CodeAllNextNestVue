# [Full Stack] WebPhim Clone Rophims - Vibe Coding với AI, Hiểu Như Senior 🚀

Chào các bạn, mình là **Tuu academy**. Hôm nay chúng ta sẽ cùng nhau xây dựng một dự án thực chiến: **Clone trang web xem phim Rophims.vip**.

Điểm đặc biệt của khóa học/dự án này là chúng ta không chỉ code thuần túy, mà sẽ áp dụng tư duy **Vibe Coding** - sử dụng AI (Cursor, Gemini, ChatGPT) để tăng tốc năng suất lên gấp 5, 10 lần nhưng vẫn đảm bảo hiểu sâu bản chất hệ thống.

---

## 1. Tại sao lại là dự án WebPhim?

Xây dựng một web phim là bài toán kinh điển để luyện tập Fullstack vì nó bao quát rất nhiều kỹ thuật khó:

- **Crawler**: Tự động hóa việc lấy dữ liệu từ bên thứ 3 (`ophim.cc`).
- **Streaming**: Xử lý trình phát video, đa server.
- **Performance**: Tối ưu hóa SEO, ISR (Incremental Static Regeneration), Caching với Redis.
- **UX/UI**: Giao diện mượt mà, dark mode chuẩn chỉnh.

---

## 2. Stack Công Nghệ (The Modern Stack)

Chúng ta sẽ sử dụng những công nghệ "hot" nhất hiện nay để xây dựng một hệ thống chịu tải tốt và dễ bảo trì:

| Thành phần | Công nghệ | Lý do chọn |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14+ (App Router)** | Tối ưu SEO cực tốt, Server Components, tốc độ nhanh. |
| **Backend** | **NestJS** | Framework Node.js mạnh mẽ, kiến trúc rõ ràng, dễ mở rộng. |
| **Database** | **MongoDB** | Phù hợp với dữ liệu phim linh hoạt, không cần schema quá cứng nhắc. |
| **Caching** | **Redis** | Tăng tốc độ truy xuất dữ liệu phim, giảm tải cho DB. |
| **Styling** | **Tailwind CSS** | Code giao diện cực nhanh, responsive dễ dàng. |
| **Player** | **ArtPlayer.js** | Tùy biến cao, hỗ trợ tốt m3u8 và nhiều server. |

---

## 3. Tư duy Vibe Coding: Prompt -> Generate -> Verify

Thay vì gõ từng dòng code, chúng ta sẽ làm việc theo quy trình chuyên nghiệp:

1. **Prompt Engineering**: Viết các câu lệnh rõ ràng, cung cấp đủ ngữ cảnh (Context) cho AI.
2. **Generate**: Để AI tạo ra khung xương (Skeletal code) hoặc các logic phức tạp.
3. **Understand**: Đọc và hiểu AI đang làm gì. **TUYỆT ĐỐI KHÔNG COPY-PASTE MÙ QUÁNG.**
4. **Verify & Debug**: Chạy thử, kiểm tra lỗi và tối ưu hóa theo kinh nghiệm cá nhân.

---

## 4. Lộ trình triển khai (The Roadmap)

### Phase 1: Planning & Design

- Phân tích API từ `ophim.cc`.
- Thiết kế Database Schema (Movie, Episode, Category, Country).
- Wireframe giao diện dựa trên mẫu `rophims.vip`.

### Phase 2: Backend Mastery (NestJS)

- Khởi tạo project NestJS với cấu trúc module.
- Xây dựng **Crawler Service**: Tự động fetch phim mới mỗi 30 phút bằng Cron Job.
- Viết các API RESTful cho: Trang chủ, Chi tiết phim, Tìm kiếm, Lọc phim.
- Tích hợp Redis để cache dữ liệu.

### Phase 3: Frontend Performance (Next.js)

- Setup Next.js với App Router & TypeScript.
- Xây dựng layout Header/Footer chuyên nghiệp.
- **Trang chủ**: Slider phim hot, các Section phim theo thể loại.
- **Trang xem phim**: Tích hợp ArtPlayer, logic chuyển tập, chuyển server mượt mà.
- Tối ưu SEO: Tự động tạo Metadata cho từng phim.

### Phase 4: Deployment & Optimization

- Deploy Backend lên VPS (Sử dụng Docker hoặc PM2).
- Deploy Frontend lên Vercel/VPS.
- Cấu hình Nginx, SSL và tối ưu hóa tốc độ tải trang.

---

## 5. Nhật Ký Vibe Coding (Thực tế từ Dự Án)

Để các bạn có cái nhìn thực tế nhất, dưới đây là tổng hợp các "câu lệnh" (Prompts) mà chúng ta đã sử dụng để điều khiển AI xử lý các bài toán khó trong tuần qua.

### 🎯 Nhóm 1: Khởi tạo & Kiến trúc (Core Development)

- **Prompt (Khởi tạo)**: *"Tôi muốn clone web này <https://rophims.vip/>, bạn hãy tạo project.md mô tả tất cả các task tech cần thiết. Viết frondend.md nextjs và backend.md nestjs. Biết backend api cào phim từ nguồn ophim.cc."*
- **Prompt (Scaffolding)**: *"Dựa trên Project và Backend docs, tạo dự án backend với đầy đủ chức năng bằng NestJS. Tạo docker-compose.yaml để tạo database Mongoose."*
- **Prompt (Database)**: *"Chạy lệnh docker yaml tạo db."*
- **Prompt (Security)**: *"Hãy giấu thông tin admin account vào .env cho an toàn."*
- **Prompt (Git Maintenance)**: *"Thêm file .gitignore chuẩn cho cả 3 dự án (Frontend, Backend, Admin) để loại bỏ node_modules và các file rác khỏi Git history."*

### 🛠️ Nhóm 2: API & Tính năng Backend

- **Prompt (Documentation)**: *"Hãy cài đặt Swagger cho dự án."*
- **Prompt (Swagger Fix)**: *"Swagger POST auth/login hiện tại chưa có payload để điền thông tin, hãy fix lại lỗi này. Và tất cả các POST API cần payload."*
- **Prompt (Admin Seeding)**: *"Hãy tạo seeding một account admin với quyền admin và password trước mã hóa là admin@123."*

### 🤖 Nhóm 3: Hệ thống Crawler Tự động (Automation)

- **Prompt (Automation)**: *"Hiện tại chức năng cào phim đang yêu cầu thực hiện bằng 2 API crawler. Hãy thiết kế chức năng cronjob tự động cào phim và lưu vào DB mà không cần tương tác trên giao diện admin page."*
- **Prompt (Logging)**: *"Hãy tạo chức năng log để lưu lại lịch sử cào phim."*
- **Prompt (Reference Fix)**: *"Tham khảo mã nguồn AdminCrawler.tsx (GitHub) để tối ưu hóa logic cào phim và xử lý URL hình ảnh."*
- **Prompt (Bypass Protection)**: *"Nghiên cứu cấu hình request headers và endpoint của ophim1.com để vượt qua lỗi 'hmmm!' (bot detection)."*
- **Prompt (Test API)**: *"Cho tôi lệnh curl để test API OPhim và kiểm tra tại sao lệnh curl không hoạt động ở môi trường local."*
- **Prompt (Actor Metadata)**: *"TMDB_API từ api trên có thể cào về thông tin quốc gia và tiểu sử của diễn viên theo tên diễn viên hay không, nếu được hãy viết cronjob cào các thông tin này."*
- **Prompt (Multi-page Crawler)**: *"Cào xong page 1 tiếp tục cào phim ở page 2 ... cho tới hết page, hiện tại cronjob chỉ cào phim page 1."*

### 🖥️ Nhóm 4: Admin Dashboard & Quản Trị Hệ Thống (Admin Management)

- **Prompt (Frontend Admin)**: *"Hãy tạo dự án FE Admin để quản lý dựa trên các nguồn MD và backend."*
- **Prompt (Configuration)**: *"Sửa lại port backend trong admin page là 3000 thay vì 3001 như hiện tại, cho link port api backend vào .env."*
- **Prompt (RBAC)**: *"Hoàn thiện chức năng người dùng trong project admin, gồm quản lý thêm sửa xoá role, thêm sửa xoá permission, thay đổi role và permission cho account."*
- **Prompt (API Development)**: *"Hãy tạo các API backend cần thiết (ví dụ: `GET /users/all`, `DELETE /films/:id`, `PUT /films/:id`) để phục vụ các chức năng quản lý trên Admin."*
- **Prompt (Pagination Fix)**: *"Hiện tại trong DB có 72 phim nhưng phần quản lý phim trong dự án admin chỉ show page 1 với 10 phim. Hãy sửa lại pagination cho đúng."*
- **Prompt (UI Optimization)**: *"Sửa lại quản lý phim lấy hai biến `releaseYear` và `category` hiển thị lại trường loại và năm. Bỏ trường tên phim, chỉ giữ lại trường tên gốc với nhãn là 'Tên phim'."*
- **Prompt (Feature Refinement)**: *"Bỏ chức năng thêm mới phim (vì đã có crawler), thêm chức năng sửa phim và tích hợp API sửa phim."*
- **Prompt (Search & Filter)**: *"Chức năng search phim theo tên phim và trạng thái chưa hoạt động, hãy kiểm tra lại backend và sửa."*
- **Prompt (Dashboard Integration)**: *"Hãy ghép API cho màn hình dashboard. Sử dụng API `/films` để lấy số lượng phim qua trường `total` và API `/users/all` để lấy số lượng user."*
- **Prompt (Genre & Actor CRUD)**: *"Tạo chức năng thêm sửa xoá xem cho giao diện Thể loại và Diễn viên trong Admin."*
- **Prompt (Actor Automation)**: *"Hãy viết Cronjob tự tìm và cào link ảnh diễn viên thông qua tên diễn viên (sử dụng TMDB API) tích hợp vào chức năng cào phim."*
- **Prompt (Admin Sync Button)**: *"Thêm nút cào thông tin actors vào quản lý diễn viên trong dự án admin."*

### 🎨 Nhóm 5: Tái thiết kế Frontend & Trải nghiệm người dùng (Frontend Redesign)

- **Prompt (Layout)**: *"Hãy tạo đủ 7 page như trong design lastdesign cho dự án frontend."*
- **Prompt (Refactoring)**: *"Hãy tạo db mockup, tách giao diện thành các component, dùng các hook như useState, useEffect..."*
- **Prompt (Hero Slider)**: *"Hãy thiết kế lại top của homepage theo như layout trong hình. Dùng thư viện swiper/react để tạo slide top."*
- **Prompt (Visual Polish)**: *"Hãy thay thế tất cả icon trong dự án frontend bằng fontawesome icon."*
- **Prompt (Featured Sections)**: *"Trên khối trending now thiết kế một khối phim hàn, phim trung và phim âu mỹ như trong hình. Cũng dùng slide ảnh."*
- **Prompt (Slider Navigation)**: *"Các slider ảnh ở mục hàn quốc, trung quốc, và âu mỹ hiện thiếu arrow trái phải hai bên để next và prev slide. Đồng thời fix lỗi slide trượt ra ngoài đè lên cả phần tiêu đề bên trái. Hãy ẩn khi slide trượt ra ngoài."*
- **Prompt (Top 10 Series)**: *"Hãy thay phần trending trong home page của frontend bằng top 10 phim bộ hay nhất (có đánh số thứ tự 1, 2, 3... lớn). Cập nhật api lọc ra thể loại phim bộ nhiều tập nếu backend chưa có."*
- **Prompt (UI Alignment)**: *"Căn lề trái khối top 10 phim bộ thẳng hàng với các khối khác. Đồng thời chỉnh hidden khi trượt slide ra ngoài."*
- **Prompt (State Sync)**: *"Sau khi đăng nhập hãy đồng bộ giao diện avatar profile trên nav top thông qua Redux."*
- **Prompt (Episode Pagination)**: *"Phần episodes của giao diện movie detail cần được phân trang tại frontend 50 item/page (và 56 item/page cho trang watch), không cần phân trang ở backend."*
- **Prompt (Consolidated Comments)**: *"Hãy gộp card reply với comment lại thành một khối."*
- **Prompt (Watch Navigation)**: *"Tất cả các nút play hoặc watch now ấn vào đều gọi tới trang watch."*
- **Prompt (Actor Links)**: *"Ở trang watch ấn vào item diễn viên chưa thấy điều hướng tới trang diễn viên, hãy áp dụng điều hướng (link chuẩn là /actors/)."*
- **Prompt (Actor Pagination)**: *"Hãy phân trang cho trang actors với 18 item/page."*
- **Prompt (Layout Fix)**: *"khối hàn, trung, mỹ bị lòi sang bên phải kìa. fix lại đi"*
- **Prompt (Z-Index Fix)**: *"popup bị ảnh thumnail bên phải và dưới che mất"*
- **Prompt (Spacing)**: *"3 khối hàn trung mỹ, top 10 phim bộ , và new release cách xa nhau quá , cho gần lại cách nhau 10px thôi"*
- **Prompt (Padding)**: *".py-80 { padding-top: 2rem; padding-bottom: 20rem; } chỉnh lại"*

### 🔌 Nhóm 6: Kết nối API & Xử lý lỗi (API Integration & Debugging)

- **Prompt (Environment)**: *"Hãy đặt port cố định cho backend là 3000, admin là 3001, frontend là 3002. Đưa cấu hình port vào .env."*
- **Prompt (Data Mapping)**: *"Tương tự như trang quản lý phim trong dự án admin ta thấy thumbnail của phim lấy được ảnh. Hãy áp dụng cho homepage của dự án frontend vì hiện tại homepage chưa lấy được ảnh đại diện của phim (mapping poster_url và thumb_url)."*
- **Prompt (Filtering API)**: *"Ghép api lấy films theo thể loại hàn quốc, trung quốc, âu mỹ và category là phim bộ với limit 10 phim bộ. Từ api films/all mà có bộ lọc theo category/country."*
- **Prompt (Bug Fix - Casting)**: *"Sai rồi country chứ không phải type. Hiện bộ lọc api films/all chưa có lọc theo country.slug. Hãy thêm vào backend api này. Sau đó áp dụng vào homepage cho slide hàn, trung, âu mỹ."*
- **Prompt (Bug Fix - React)**: *"Fix lỗi frontend: Objects are not valid as a React child (found: object with keys {id, name, slug})."*
- **Prompt (Bug Fix - Logic)**: *"Hiện ấn vào watch now button chưa hiện ra giao diện xem phim hãy sửa lại code cho đúng."*
- **Prompt (Infrastructure)**: *"Docker file yaml trong thư mục backend. Chạy lệnh up docker và cấu hình lại MONGODB_URI trong .env dùng 127.0.0.1 thay vì localhost để fix lỗi kết nối."*
- **Prompt (Threaded Comments)**: *"Phần comment trong movie detail page chưa ghép api cho reply. Hãy ghép api để trả lời được bình luận (sau đó áp dụng tương tự cho trang movie watch)."*
- **Prompt (Port Fix)**: *"API trong watch page đang gọi sai port, tôi muốn gọi tới port 3000 như trong env."*
- **Prompt (Actor Pages API)**: *"Hãy ghép api actors cho trang actors, và actordetail."*
- **Prompt (Log Debugging)**: *"Sao chạy backend mà không thấy thông báo in ra log syncing actors detail?"*
- **Prompt (Bug Fix - ID)**: *"Sửa lỗi gọi API bị undefined film ID khi tương tác với các button trong popup/card."*

### 👤 Nhóm 7: Hệ thống Like & Trang cá nhân (Social & Profile)

- **Prompt (Social Like)**: *"Khi ấn vào nút trái tim tại bất cứ đâu đều gọi api thích social và đổi màu trái tim."*
- **Prompt (Hero Like)**: *"Khối hero slider cũng cần có icon trái tim để người dùng có thể like phim ngay lập tức."*
- **Prompt (Like API)**: *"Tạo mới API like riêng biệt (POST /social/like/:id) thay vì dùng chung với bookmark để quản lý số lượng like của phim."*
- **Prompt (Visual Toggle)**: *"Sau khi like xong trái tim chuyển thành màu xanh lá, khi unlike thì chuyển lại thành màu trắng."*
- **Prompt (Redux Sync)**: *"Hãy dùng Redux để đồng bộ trạng thái LikeButton ở tất cả các trang (nếu cùng một bộ phim thì tất cả trái tim phải cùng đổi màu)."*
- **Prompt (Atomic Toggle)**: *"Sửa lỗi button like không toggle mà luôn báo đã xoá khỏi yêu thích bằng cách sử dụng các toán tử nguyên tử $addToSet và $pull trong MongoDB."*
- **Prompt (Profile UI)**: *"Trong trang profile đổi tab notification bằng tab liked films. Sau đó ghép api trả ra danh sách phim đã yêu thích của user."*
- **Prompt (Reactive List)**: *"Trong trang profile (tab liked films), khi ấn like button thì toggle màu, đồng thời remove phim đó ra khỏi danh sách hiển thị ngay lập tức."*
- **Prompt (Avatar System)**: *"Hãy ghép API tải lên ảnh avatar hoặc chọn từ 10 avatar diễn viên có sẵn (3 Á, 3 Âu, 3 Mỹ, 1 Phi). Hỗ trợ cả chức năng tự tải ảnh lên (Base64)."*
- **Prompt (Password Security)**: *"Ghép API đổi mật khẩu (PUT /users/change-password) và thiết kế form đổi mật khẩu trong tab Cài đặt tại trang Profile."*

### 🎥 Nhóm 8: Lịch sử xem & Tiến độ (Watch History & Playback Progress)

- **Prompt (UI Cleanup)**: *"Item phim trong danh sách chờ không cần hover popup, mà góc phải trên cùng có dấu X để ấn vào sẽ remove khỏi danh sách chờ."*
- **Prompt (Watch History Core)**: *"Hãy ghép API cho lịch sử xem, lưu lại tiến độ xem. Khi ấn vô item phim trong tab lịch sử xem của profile page thì mở ra watch page ở vị trí đang xem."*
- **Prompt (Progress Metadata)**: *"Hãy hiển thị số phút đã xem trong item phim của danh sách lịch sử xem."*
- **Prompt (Backend Metadata)**: *"Kiểm tra lại API thêm lịch sử phim và xem lịch sử phim. Hãy đảm bảo lưu thông tin gồm phim name, id phim, ảnh thumbnail, thời gian xem, tập phim ở backend."*
- **Prompt (API Optimization)**: *"Tôi muốn backend trả về thông tin tên phim, id, số tập hiện tại, thời lượng đã coi, ảnh thumbnail thay vì cấu hình nested cũ để FE dễ xử lý."*
- **Prompt (UI Mapping)**: *"Đã có thông tin nhưng FE chưa hiển thị, hãy hiển thị lịch sử xem bằng item phim chuyên nghiệp."*
- **Prompt (Advanced Tracking)**: *"Hãy tham khảo cách theo dõi thời gian xem phim để lưu vào lịch sử. Hiện tại chưa lấy được thời lượng đã xem để replay đúng thời gian, và vẽ progress bar cho item phim trong lịch sử phim."*
- **Prompt (Delete History)**: *"Tương tự danh sách chờ, item phim của lịch sử phim cũng có dấu X góc trên bên phải để remove khỏi danh sách lịch sử xem. Nếu chưa có API này hãy tạo và ghép API."*
- **Prompt (Bug Fix - Hooks)**: *"Sửa lỗi 'Rendered more hooks than during the previous render' trong WatchPage khi lưu lịch sử xem."*

### 🔍 Nhóm 9: Hệ thống Tìm kiếm & Lọc phim nâng cao (Search & Filtering)

- **Prompt (Advanced Search)**: *"Tích hợp trang tìm kiếm chuyên sâu (/search) dựa trên thiết kế lastdesign. Sử dụng API films/all để lọc theo thể loại, năm phát hành và từ khóa tìm kiếm."*
- **Prompt (Slug Optimization)**: *"Cập nhật Navbar: Thay đổi các đường dẫn thành /phim-le và /phim-bo. Đồng thời cập nhật Backend API để lọc chính xác phim lẻ (1 tập) và phim bộ (nhiều hơn 1 tập)."*
- **Prompt (UI Cleanup)**: *"Loại bỏ ô tìm kiếm nhanh trên Navbar vì đã có trang Khám phá (Search) chuyên dụng để làm gọn giao diện."*

### 🚀 Nhóm 10: Triển khai dự án lên VPS (Deployment)

- **Prompt (Deployment)**: *"hãy deploy 3 dự án fe, be, admin lên vps theo tài liệu đính kèm. Lưu ý nhớ kĩ mỗi lần nhập input phải xoá trắng input trước đã. Đã tạo ssh key và thêm vào github rồi"*
- **Prompt (Database Setup)**: *"đã fix lỗi nhập kí tự bị loạn chữ, hãy vào database tạo mới db mongo vì db cũ đã xoá rồi"*
- **Prompt (Input Discipline)**: *"nhớ phải xoá rỗng input trước khi nhập liệu. tôi yêu cầu bạn nhớ"*
- **Prompt (Config Fix)**: *"nhầm rồi, fe port 3002"*
- **Prompt (PM2 Cleanup)**: *"xoá pm2 admin-fe và admin-vibe đi sau đó chạy lại admin-fe"*

### 🤖 Nhóm 11: Tự động hóa CI/CD & Điều hướng nâng cao (CI/CD & Navigation)

- **Prompt (CI/CD Setup)**: *"Hãy thêm github action vào 3 dự án (Backend, Frontend, Admin) để tự động hóa quy trình CI/CD dựa trên tài liệu deploy.md."*
- **Prompt (Navigation Logic)**: *"Trong dự án frontend, hãy thay đổi logic điều hướng: khi nhấn vào icon Play thì chuyển đến trang xem phim (/watch), còn khi nhấn nút 'Xem ngay' (PlayNow) thì chuyển đến trang chi tiết phim (/movie)."*
- **Prompt (Troubleshooting Actions)**: *"Đã cài đặt nhưng GitHub Actions vẫn chưa hoạt động, hãy kiểm tra và bật Browser để check nguyên nhân (ví dụ: tài khoản bị gắn cờ/flagged)."*
- **Prompt (Git Migration)**: *"Làm sao để xóa kết nối Git cũ, thêm remote Git mới và đồng bộ lại code khi chuyển đổi tài khoản GitHub trên terminal?"*
- **Prompt (SSH Management)**: *"Hướng dẫn cách tạo SSH Key mới cho email mới và cấu hình vào GitHub Secrets/SSH Keys để CI/CD có thể hoạt động sau khi đổi tài khoản."*
- **Prompt (Workflow Fix)**: *"Tạo lại file deploy.yml cho dự án Frontend để sửa lỗi cú pháp và thêm tính năng trigger thủ công (workflow_dispatch)."*
- **Prompt (Account Flag Fix)**: *"Deploy thủ công thành công nhưng push không tự chạy Action do lỗi 'Actions has been disabled for this user', hãy phân tích và đưa ra hướng xử lý."*
- **Prompt (Conflict Resolution)**: *"Lấy code hiện tại ở máy làm gốc (Current), xử lý tất cả các xung đột (Conflict) và đẩy lên Repository mới."*

---

## 6. Lời kết

Dự án này không chỉ giúp bạn có một sản phẩm "xịn" để bỏ vào CV, mà quan trọng hơn là rèn luyện **tư duy giải quyết vấn đề** trong kỷ nguyên AI. Hãy nhớ: **"Công cụ chỉ là công cụ, tư duy mới là thứ tạo nên sự khác biệt."**

Chúc các bạn có những giờ phút "Vibe Coding" thật thăng hoa!

---
*Tài liệu được biên soạn bởi Tuu academy & Antigravity AI.*
