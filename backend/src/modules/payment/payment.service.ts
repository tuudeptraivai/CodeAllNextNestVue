import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import * as crypto from 'crypto';
import * as qs from 'qs';
import * as dayjs from 'dayjs';

@Injectable()
export class PaymentService {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createPaymentUrl(
    userId: string,
    pack: 'premium' | 'promax',
    billing: 'monthly' | 'yearly',
    ipAddr: string,
  ) {
    const tmnCode = this.configService.get('VNP_TMN_CODE');
    const secretKey = this.configService.get('VNP_HASH_SECRET');
    let vnpUrl = this.configService.get('VNP_URL');
    const returnUrl = this.configService.get('VNP_RETURN_URL');

    const monthlyAmount = pack === 'premium' ? 100000 : 200000;
    // Yearly billing: 12 months at a 20% per-month discount.
    const amount =
      billing === 'yearly'
        ? Math.round(monthlyAmount * 12 * 0.8)
        : monthlyAmount;
    const createDate = dayjs().format('YYYYMMDDHHmmss');
    const expireDate = dayjs().add(15, 'minute').format('YYYYMMDDHHmmss');
    const orderId = dayjs().format('HHmmss') + Math.floor(Math.random() * 1000);

    const orderInfo = `MembershipUpgrade_${userId}_${pack}_${billing}`;

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = '190000'; // Thanh toán hóa đơn/dịch vụ
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_ExpireDate'] = expireDate;

    vnp_Params = this.sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnpUrl += '?' + signData + '&vnp_SecureHash=' + signed;

    console.log("Generated VNPay URL:", vnpUrl);
    return { url: vnpUrl };
  }

  async verifyPayment(queryParams: any) {
    const secureHash = queryParams['vnp_SecureHash'];
    const vnp_Params = { ...queryParams };
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const secretKey = this.configService.get('VNP_HASH_SECRET');
    const sortedParams = this.sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      if (queryParams['vnp_ResponseCode'] === '00') {
        const orderInfoStr = queryParams['vnp_OrderInfo'];
        const parts = orderInfoStr.split('_');
        const userId = parts[1];
        const pack = parts[2] as 'premium' | 'promax';
        const billing: 'monthly' | 'yearly' =
          parts[3] === 'yearly' ? 'yearly' : 'monthly';

        const expiresAt =
          billing === 'yearly'
            ? dayjs().add(365, 'day').toDate()
            : dayjs().add(30, 'day').toDate();
        await this.userModel.findByIdAndUpdate(userId, {
          membership: pack,
          membershipExpiresAt: expiresAt,
        });

        return { success: true, pack, billing };
      }
      return { success: false, message: 'Thanh toán không thành công' };
    }
    return { success: false, message: 'Chữ ký không hợp lệ' };
  }

  private sortObject(obj: any) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    }
    return sorted;
  }
}
