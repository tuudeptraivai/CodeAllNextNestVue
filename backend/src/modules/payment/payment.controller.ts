import { Controller, Post, Body, Get, Query, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionMeta } from '../user/decorators/permission.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment-url')
  @ApiBearerAuth()
  @PermissionMeta({ name: 'Tạo yêu cầu nâng cấp tài khoản', module: 'Thanh toán', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Create payment URL for membership upgrade' })
  async createPaymentUrl(
    @Body() data: { pack: 'premium' | 'promax' },
    @Req() req: any,
  ) {
    const userId = req.user.userId || req.user.id;
    let ipAddr = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
      ipAddr = '127.0.0.1';
    }
    return this.paymentService.createPaymentUrl(userId, data.pack, ipAddr as string);
  }

  @Public()
  @Post('verify')
  @PermissionMeta({ name: 'Xác thực thanh toán', module: 'Thanh toán', systemModule: 'BUSINESS' })
  @ApiOperation({ summary: 'Verify payment from gateway' })
  async verifyPayment(@Body() queryParams: any) {
    return this.paymentService.verifyPayment(queryParams);
  }
}
