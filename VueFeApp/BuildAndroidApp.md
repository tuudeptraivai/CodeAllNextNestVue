# Hướng dẫn Build App Android (APK) cho VueFeApp

Tài liệu này tóm tắt các bước đã thực hiện để cấu hình và build file APK từ dự án Quasar + Capacitor.

## 1. Khởi tạo môi trường (Đã thực hiện)
Lệnh đã dùng để thêm Capacitor vào project:
```bash
npx quasar mode add capacitor
```

## 2. Cấu hình Java Version (Quan trọng)
Do máy hiện tại sử dụng **Java 17** nhưng Capacitor mới mặc định yêu cầu **Java 21**, chúng ta đã cấu hình ép hệ thống sử dụng Java 17 trong file:
`src-capacitor/android/build.gradle`

Đoạn mã đã thêm:
```gradle
subprojects {
    afterEvaluate { project ->
        if (project.hasProperty('android')) {
            project.android {
                compileOptions {
                    sourceCompatibility JavaVersion.VERSION_17
                    targetCompatibility JavaVersion.VERSION_17
                }
                if (project.plugins.hasPlugin('kotlin-android')) {
                    kotlinOptions {
                        jvmTarget = '17'
                    }
                }
            }
        }
    }
}
```

## 3. Các lệnh Build APK

### Cách A: Build bản Debug (Khuyên dùng để Test)
Bản này sẽ được tự động ký (signed) bằng debug key, giúp cài đặt trực tiếp lên điện thoại mà không bị lỗi "No Certificates".

1. Build code web:
   ```bash
   npm run build -- -m capacitor -T android
   ```
2. Build file APK:
   ```bash
   cd src-capacitor/android
   ./gradlew assembleDebug
   ```
**Vị trí file APK:** `src-capacitor/android/app/build/outputs/apk/debug/app-debug.apk`

### Cách B: Build bản Release (Đóng gói)
Bản này tối ưu dung lượng nhưng cần được ký (sign) thủ công mới cài được.
1. Chạy lệnh:
   ```bash
   npm run build -- -m capacitor -T android
   ```
**Vị trí file APK:** `src-capacitor/android/app/build/outputs/apk/release/app-release-unsigned.apk`

## 4. Các lỗi thường gặp và cách xử lý

### Lỗi `invalid source release: 21`
- **Nguyên nhân**: Gradle cố dùng Java 21.
- **Xử lý**: Kiểm tra lại file `src-capacitor/android/build.gradle` xem đoạn mã ép version 17 (ở mục 2) có còn không.

### Lỗi `INSTALL_PARSE_FAILED_NO_CERTIFICATES`
- **Nguyên nhân**: Cố cài bản Release chưa được ký (unsigned).
- **Xử lý**: Sử dụng bản **Debug** (Cách A) hoặc thực hiện ký số (Sign) cho bản Release.

## 5. Các lỗi thường gặp và cách xử lý (QUAN TRỌNG)

### A. Lỗi kết nối Backend (Đăng nhập thất bại)
Nếu App không kết nối được Backend, hãy kiểm tra 3 tầng bảo mật sau:

1.  **Tầng Code (API URL)**:
    -   Dùng IP máy tính (ví dụ: `192.168.1.16`) cho điện thoại thật.
    -   Dùng `10.0.2.2` cho trình giả lập (Emulator).
    -   File `src/services/api.ts` nên được kiểm tra kỹ địa chỉ này.

2.  **Tầng Capacitor (Lỗi Mixed Content)**:
    -   Android chặn gọi `http` từ trang `https`.
    -   Sửa `src-capacitor/capacitor.config.json`:
        ```json
        "server": {
          "androidScheme": "http",
          "hostname": "localhost",
          "cleartext": true
        }
        ```

3.  **Tầng Android (Network Security)**:
    -   Tạo file `src-capacitor/android/app/src/main/res/xml/network_security_config.xml` để cho phép Cleartext.
    -   Khai báo trong `AndroidManifest.xml`: `android:networkSecurityConfig="@xml/network_security_config"`.

### B. Lỗi biên dịch (Build Error)
-   **Node.js**: Đảm bảo dùng **Node 22** trở lên. Nếu dùng bản cũ (như v20), Quasar có thể build lỗi hoặc không cập nhật code mới vào APK.
    -   Lệnh nâng cấp: `nvm install 22 && nvm use 22`.
-   **Java**: Yêu cầu **JDK 17**. Nếu gặp lỗi `invalid source release: 21`, hãy kiểm tra cấu hình `JavaVersion.VERSION_17` trong các file `build.gradle`.

## 6. Công cụ Debug "Thần thánh"
Nếu vẫn lỗi, hãy dùng Chrome trên máy tính để "soi" lỗi trong App:
1.  Mở Emulator hoặc cắm điện thoại.
2.  Truy cập Chrome: `chrome://inspect/#devices`.
3.  Nhấn **Inspect** ở App của bạn để xem Console log và Network y hệt trên Web.

---
*Chúc bạn phát triển ứng dụng vui vẻ!*
