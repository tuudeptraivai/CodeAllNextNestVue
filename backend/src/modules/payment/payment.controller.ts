import { Controller, Post, Body, Get, Query, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Request } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment-url')
  async createPaymentUrl(
    @Body() data: { pack: 'premium' | 'promax' },
    @Req() req: any, // Use JwtAuthGuard to get user
  ) {
    const userId = req.user.id; // From JwtAuthGuard
    let ipAddr = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
      ipAddr = '127.0.0.1';
    }
    return this.paymentService.createPaymentUrl(userId, data.pack, ipAddr as string);
  }

  @Post('verify')
  async verifyPayment(@Body() queryParams: any) {
    return this.paymentService.verifyPayment(queryParams);
  }
}
