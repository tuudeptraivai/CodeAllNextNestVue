# Hướng dẫn chi tiết Deploy Dự án PhimVibeCoding lên aaPanel

Tài liệu này ghi lại chi tiết toàn bộ quá trình triển khai 3 dự án (Backend, Frontend, Admin) lên VPS sử dụng aaPanel.

---

## 1. Thông tin chuẩn bị

- **aaPanel URL**: `https://103.153.68.122:8888/6b9e8fd6`
- **Tài khoản**: `39hdjhe9` / `0c590ef0`
- **Password Terminal**: `bean1991`
- **Domain**:
  - Frontend: `fe.tuuvibecode.xyz`
  - Backend: `be.tuuvibecode.xyz`
  - Admin: `admin.tuuvibecode.xyz`

---

## 2. Cấu hình SSH Key kết nối GitHub

Để VPS có quyền clone code từ private repositories:

1. **Mở Terminal** trong aaPanel (Menu bên trái -> **Terminal**).
2. Nhập password terminal: `bean1991`.
3. **Xóa Key cũ (nếu có)**:
   ```bash
   rm -rf ~/.ssh/id_ed25519*
   ```
4. **Tạo SSH Key mới**:
   ```bash
   ssh-keygen -t ed25519 -C "vuvantuu.gl@gmail.com" -f ~/.ssh/id_ed25519 -N ""
   ```
5. **Lấy Public Key**:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
6. **Thêm vào GitHub**:
   - Truy cập [GitHub Settings -> SSH Keys](https://github.com/settings/keys).
   - Nhấn **New SSH key**, đặt tên là `VPS-Deploy` và dán nội dung public key vào.
7. **Kiểm tra kết nối**:
   ```bash
   ssh -T git@github.com
   ```
   (Nếu hiện "Hi [username]! You've successfully authenticated" là thành công).

---

## 3. Cài đặt Môi trường (App Store)

Vào menu **App Store** (hoặc Software Store) và cài đặt:

1. **Nginx**: Phiên bản bất kỳ (thường dùng 1.22 hoặc 1.24).
2. **MongoDB**: Phiên bản 6.0.
3. **Node.js Version Manager**: Sau khi cài xong, mở lên và cài đặt **Node.js v22** (hoặc v18/v20 stable).
4. **PM2 Manager**: Cài đặt để quản lý các tiến trình Node.js.

---

## 4. Cấu hình Database (MongoDB)

Bạn có thể thực hiện qua giao diện aaPanel hoặc Terminal.

### Cách 1: Qua giao diện aaPanel

1. Vào menu **Database** -> Tab **MongoDB**.
2. Nhấn **Add Database**:
   - **Database Name**: `movie_db`
   - **Username**: `movie_user`
   - **Password**: `movie_password_123`
   - **Permissions**: `readWrite`
3. Nhấn **Confirm**.

### Cách 2: Qua Terminal (Dùng lệnh)

Để tạo đúng user và database cho link kết nối `mongodb://movie_user:movie_password_123@127.0.0.1:27017/movie_db?authSource=movie_db`:

1. Mở Terminal và gõ lệnh để vào trình quản lý MongoDB:
   ```bash
   mongosh
   ```
2. Tạo database và User bằng các lệnh javascript sau (Copy và dán từng đoạn):
   ```javascript
   // Chuyển sang database movie_db (nếu chưa có nó sẽ tự tạo)
   use movie_db

   // Tạo user với quyền readWrite trên database này
   db.createUser({
     user: "movie_user",
     pwd: "movie_password_123",
     roles: [{ role: "readWrite", db: "movie_db" }]
   })
   ```
3. Thoát khỏi mongosh:
   ```bash
   exit
   ```

---

## 5. Tạo Website trên aaPanel

Vào menu **Website** -> **Add site**:

Thực hiện tạo 3 site lần lượt với thông tin:
- **Domain**: `fe.tuuvibecode.xyz`, `be.tuuvibecode.xyz`, `admin.tuuvibecode.xyz`.
- **PHP version**: Chọn `Pure HTML`.
- **SSL**: Có thể tích chọn để tạo luôn hoặc tạo sau.

---

## 6. Triển khai Backend (`be.tuuvibecode.xyz`)

1. **Vào Terminal** và chạy các lệnh:
   ```bash
   cd /www/wwwroot/be.tuuvibecode.xyz
   rm -rf *
   git clone git@github.com:Tuudeptrai/BeVibeCodingFilms.git .

   # Tạo file .env
   cat <<EOF > .env
   PORT=3000
   MONGODB_URI=mongodb://movie_user:movie_password_123@127.0.0.1:27017/movie_db?authSource=movie_db
   CRAWLER_CRON=0 */30 * * * *
   CRAWLER_ENABLED=true
   CRAWLER_STARTUP_SYNC=true
   CRON_ENABLED=false
   OPHIM_API_BASE_URL=https://ophim1.com
   ADMIN_EMAIL=admin@gmail.com
   ADMIN_PASSWORD=admin@123
   JWT_SECRET=yoursecretkeyhere
   TMDB_API_KEY=1dd43aecf3fa24c44722ef70370107e4
   EOF

   npm install
   npm run build
   pm2 start dist/main.js --name be-vibe
   ```

---

## 7. Triển khai Frontend (`fe.tuuvibecode.xyz`)

1. **Vào Terminal**:
   ```bash
   cd /www/wwwroot/fe.tuuvibecode.xyz
   rm -rf *
   git clone git@github.com:Tuudeptrai/FeVibeCodingFilms.git .

   # Tạo file .env
   cat <<EOF > .env
   PORT=3002
   NEXT_PUBLIC_API_URL=https://be.tuuvibecode.xyz
   EOF

   npm install
   npm run build
   pm2 start npm --name fe-vibe -- start -- -p 3002
   ```

---

## 8. Triển khai Admin (`admin.tuuvibecode.xyz`)

Dự án Admin là Vite (SPA), sẽ build ra file tĩnh.

1. **Vào Terminal**:
   ```bash
   cd /www/wwwroot/admin.tuuvibecode.xyz
   rm -rf *
   git clone git@github.com:Tuudeptrai/FeAdminVibeCodingFilms.git .

   # Tạo file .env
   cat <<EOF > .env
   VITE_API_BASE_URL=https://be.tuuvibecode.xyz
   VITE_PORT=3001
   PORT=3001
   TMDB_API_KEY=1dd43aecf3fa24c44722ef70370107e4
   EOF

   npm install
   npm run build
   ```

---

## 9. Cấu hình Nginx & SSL

Vào menu **Website**, nhấn vào **Conf** (Configuration) của từng site:

### A. SSL (Cài đặt cho cả 3 site)

- Chọn tab **SSL** -> **Let's Encrypt**.
- Tích chọn domain và nhấn **Apply**.
- Sau khi thành công, bật **Force HTTPS**.

### B. Reverse Proxy (Cho Backend và Frontend)

- **be.tuuvibecode.xyz**:
  - Tab **Reverse Proxy** -> **Add reverse proxy**.
  - **Proxy name**: `be_proxy`.
  - **Target URL**: `http://127.0.0.1:3000`.
  - **Sent Domain**: `$host`.
- **fe.tuuvibecode.xyz**:
  - Tab **Reverse Proxy** -> **Add reverse proxy**.
  - **Proxy name**: `fe_proxy`.
  - **Target URL**: `http://127.0.0.1:3002`.
  - **Sent Domain**: `$host`.

### C. Site Directory (Cho Admin)

- **admin.tuuvibecode.xyz**:
  - Tab **Site directory**.
  - **Running directory**: Chọn `/dist`.
  - Nhấn **Save**.

### D. URL Rewrite (Cho Admin - SPA Routing)

- Để tránh lỗi 404 khi reload trang trong React:
  - Tab **URL rewrite**.
  - Dán đoạn mã sau:
    ```nginx
    location / {
      try_files $uri $uri/ /index.html;
    }
    ```
  - Nhấn **Save**.

---

## 10. Mở Cổng Firewall (Security)

Vào menu **Security** -> Tab **Firewall**. Thêm từng cổng (Add Port Rule):
- **80** (HTTP)
- **443** (HTTPS)
- **3000** (Backend)
- **3001** (Admin)
- **3002** (Frontend)
*(Lưu ý: aaPanel yêu cầu thêm từng cổng một, không nhập dải cổng).*

---

## 11. Kiểm tra cuối cùng

- Truy cập [https://fe.tuuvibecode.xyz](https://fe.tuuvibecode.xyz) (Người dùng).
- Truy cập [https://admin.tuuvibecode.xyz](https://admin.tuuvibecode.xyz) (Quản trị).
- Truy cập [https://be.tuuvibecode.xyz/api/docs](https://be.tuuvibecode.xyz/api/docs) (API Swagger).
- Kiểm tra PM2: `pm2 status` (Tất cả phải ở trạng thái `online`).

---

## 12. Triển khai Landing Page Khuyến Mãi (`khuyenmai.tuuvibecode.xyz`)

Trang này là mã nguồn HTML tĩnh. Quy trình triển khai bằng cách upload trực tiếp lên aaPanel:

1. **Chuẩn bị file**:
   - Tại máy cục bộ, nén toàn bộ nội dung trong thư mục `ads-landing-page` thành file `.zip` (Lưu ý: Nén các file bên trong, không nén cả thư mục cha để tránh bị lồng thư mục).

2. **Tạo Website trên aaPanel**:
   - **Domain**: `khuyenmai.tuuvibecode.xyz`
   - **PHP version**: `Pure HTML`
   - **SSL**: Cài đặt Let's Encrypt và Force HTTPS.

3. **Upload và Giải nén**:
   - Vào menu **Files** trên aaPanel.
   - Tìm đến thư mục: `/www/wwwroot/khuyenmai.tuuvibecode.xyz`.
   - Nhấn **Upload**, chọn file `.zip` đã nén ở bước 1.
   - Sau khi upload xong, nhấn chuột phải vào file và chọn **Unzip**.

4. **Kiểm tra và Cập nhật**:
   - Mỗi khi có thay đổi (như vừa thêm mã GA), bạn chỉ cần upload đè file `index.html` mới lên thư mục này qua tab **Files**.
   - Google Analytics sẽ bắt đầu nhận sự kiện `generate_lead` ngay khi file mới được áp dụng.
