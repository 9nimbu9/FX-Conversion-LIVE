import { Controller, Post, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AccountService } from './accounts.service';
import { ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) { }

  @Post('topup')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 100 },
        currency: { type: 'string', example: 'USD' }
      },
      required: ['amount', 'currency']
    }
  })
  topUp(@Body() body: { amount: number; currency: string }) {
    const { amount, currency } = body;
    this.accountService.topUp(amount, currency);
  }


  @Post('low')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 50 },
        currency: { type: 'string', example: 'USD' }
      },
      required: ['amount', 'currency']
    }
  })
  low(@Body() body: { amount: number; currency: string }) {
    const { amount, currency } = body;
    try {
      this.accountService.deduct(amount, currency);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

  }

  @Get('balance')
  getBalance() {
    return this.accountService.getAllBalances();
  }
}
