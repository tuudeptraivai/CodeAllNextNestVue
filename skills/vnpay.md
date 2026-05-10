# Hướng dẫn tích hợp Thanh toán VNPay

Tài liệu này hướng dẫn cách tích hợp cổng thanh toán VNPay vào dự án sử dụng NestJS (Backend) và Next.js (Frontend) dựa trên thư viện mẫu `bevnpay` và `fevnpay`.

## 1. Cấu hình môi trường (.env)

Bạn cần đăng ký tài khoản sandbox tại [VNPay Test Portal](https://sandbox.vnpayment.vn/test-portal/) để lấy các thông tin sau:

```env
VNP_TMN_CODE=XXXXXX      # Mã định danh website (Terminal ID)
VNP_HASH_SECRET=XXXXXX   # Chuỗi bí mật để tạo mã hash (Checksum)
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3000/vnpay_return # URL nhận kết quả sau thanh toán
```

---

## 2. Triển khai Backend (NestJS)

### Cài đặt thư viện cần thiết
```bash
npm install qs dayjs
```

### Tạo URL thanh toán
Trong Controller, xử lý việc tạo URL để chuyển hướng người dùng sang VNPay.

```typescript
import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import * as crypto from 'crypto';
import * as qs from 'qs';

@Controller('payment')
export class PaymentController {
  constructor(private configService: ConfigService) {}

  @Post('create-payment-url')
  async createPaymentUrl(@Body() data: any) {
    const tmnCode = this.configService.get('VNP_TMN_CODE');
    const secretKey = this.configService.get('VNP_HASH_SECRET');
    let vnpUrl = this.configService.get('VNP_URL');
    const returnUrl = this.configService.get('VNP_RETURN_URL');

    const createDate = dayjs().format('YYYYMMDDHHmmss');
    const orderId = dayjs().format('DDHHmmss'); // Mã đơn hàng duy nhất
    const amount = data.amount; // Số tiền thanh toán
    const orderInfo = data.orderInfo; // Thông tin đơn hàng (string hoặc JSON)

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100; // VNPay tính theo đơn vị đồng (x100)
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = '127.0.0.1';
    vnp_Params['vnp_CreateDate'] = createDate;

    // Sắp xếp params theo alphabet (Bắt buộc)
    vnp_Params = this.sortObject(vnp_Params);

    // Tạo chữ ký (Secure Hash)
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    return { url: vnpUrl };
  }

  // Hàm helper để sắp xếp object
  private sortObject(obj: any) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }
}
```

### Xác thực kết quả thanh toán (Verify)
Khi VNPay redirect về `returnUrl`, bạn cần xác thực chữ ký để đảm bảo dữ liệu không bị thay đổi.

```typescript
@Post('verify-checkout')
async verifyCheckout(@Body() queryParams: any) {
  const secureHash = queryParams['vnp_SecureHash'];
  delete queryParams['vnp_SecureHash'];
  delete queryParams['vnp_SecureHashType'];

  const secretKey = this.configService.get('VNP_HASH_SECRET');
  const sortedParams = this.sortObject(queryParams);
  const signData = qs.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  if (secureHash === signed) {
    if (queryParams['vnp_ResponseCode'] === '00') {
      return { status: 'success', data: queryParams };
    }
    return { status: 'failed', message: 'Thanh toán không thành công' };
  }
  return { status: 'error', message: 'Chữ ký không hợp lệ' };
}
```

---

## 3. Triển khai Frontend (Next.js/React)

### Gửi yêu cầu thanh toán
Tại trang giỏ hàng hoặc thanh toán:

```typescript
const handlePayment = async () => {
  const payload = {
    amount: 100000, // Ví dụ: 100,000 VND
    orderInfo: "Thanh toán đơn hàng #123"
  };

  try {
    const res = await axios.post('/api/payment/create-payment-url', payload);
    if (res.data.url) {
      window.location.href = res.data.url; // Chuyển hướng sang VNPay
    }
  } catch (error) {
    console.error("Lỗi tạo link thanh toán", error);
  }
};
```

### Xử lý kết quả tại trang `vnpay_return`
Tạo route `/vnpay_return` (Next.js App Router: `app/vnpay_return/page.tsx`) để hiển thị thông báo kết quả.

```tsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function VnpayReturn() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      // Gửi toàn bộ query params nhận từ VNPay về Backend để verify
      const params = Object.fromEntries(searchParams.entries());
      try {
        const res = await axios.post('/api/payment/verify-checkout', params);
        setResult(res.data);
      } catch (error) {
        console.error("Lỗi verify", error);
      }
    };
    verifyPayment();
  }, [searchParams]);

  if (!result) return <div>Đang xử lý kết quả...</div>;

  return (
    <div>
      {result.status === 'success' ? (
        <h1>Thanh toán thành công!</h1>
      ) : (
        <h1>Thanh toán thất bại: {result.message}</h1>
      )}
    </div>
  );
}
```

---

## 4. Các lưu ý quan trọng

1.  **Số tiền (vnp_Amount)**: VNPay yêu cầu số tiền nhân với 100 (Ví dụ: 10,000 VND phải gửi là `1000000`).
2.  **Sắp xếp tham số**: Các tham số gửi đi và nhận về để tạo mã Hash **bắt buộc** phải được sắp xếp theo thứ tự alphabet của key.
3.  **Bảo mật**: Tuyệt đối không thực hiện việc tạo mã Hash hoặc lưu `secretKey` ở phía Frontend. Mọi thao tác ký số phải thực hiện ở Backend.
4.  **IPN (Instant Payment Notification)**: Ngoài trang Return, VNPay còn gửi kết quả qua một link IPN (Server-to-Server). Bạn nên triển khai thêm route IPN để cập nhật trạng thái đơn hàng ngay cả khi người dùng đóng trình duyệt sau khi thanh toán.
5.  Ngân hàng	NCB
9704198526191432198
Tên chủ thẻ	NGUYEN VAN A
Ngày phát hành	07/15
Mật khẩu OTP	123456
