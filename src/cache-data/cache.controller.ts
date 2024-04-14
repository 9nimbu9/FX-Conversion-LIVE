import { Controller, Post, Body } from '@nestjs/common';
import { cacheService } from './cache.provider';
import { ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('FX Conversion')
// @Controller()
// export class cacheController {
//   constructor(private readonly fxService: cacheService) {}

//   @Post('fx-conversion')

//   async getExchangeRate(@Body() body: { from: string; to: string; amount: number }) {
//     const { from, to, amount } = body;

//     try {
//       const exchangeRate = await this.fxService.getExchangeRate(from, to);
//       return exchangeRate * amount;
//     } catch (error) {
//       throw error;
//     }
//   }
// }


@Controller()
export class cacheController {
  constructor(private readonly fxService: cacheService) { }

  @Post('fx-conversion')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quoteId: { type: 'string', example: "5678908765678" },
        from: { type: 'string', example: "USD" },
        to: { type: 'string', example: "INR" },
        amount: { type: 'number', example: 100 }
      },
      required: ['quoteId', 'from', 'to', 'amount']
    }
  })
  async convertAmount(@Body() body: { quoteId: string; from: string; to: string; amount: number }) {
    const { quoteId, from, to, amount } = body;

    // Check if the conversion exists in cache
    let convertedAmount = this.fxService.getConversion(quoteId, from, to, amount);

    // If not found in cache, calculate and cache the conversion
    if (convertedAmount === undefined) {
      const exchangeRate = await this.fxService.getExchangeRate(from, to);
      convertedAmount = exchangeRate * amount;
      this.fxService.cacheConversion(quoteId, from, to, amount, convertedAmount);
    }

    return { quoteId, from, to, amount, convertedAmount };
  }
}

