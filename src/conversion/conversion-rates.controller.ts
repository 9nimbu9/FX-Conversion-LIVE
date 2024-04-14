import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { cacheService } from 'src/cache-data/cache.provider';
import axios from 'axios';

@Controller()
export class conversionController {
  constructor(private readonly fxService: cacheService) { }

  @Post('fx-conversion')
  async convertAmount(@Body() body: { quoteId: string; from: string; to: string; amount: number }) {
    const { quoteId, from, to, amount } = body;

    try {
      // Fetch the latest quote ID from fx-rates endpoint
      const latestQuoteIdResponse = await axios.get('http://localhost:3000/fx-rates');
      const latestQuoteId = latestQuoteIdResponse.data.quoteId;
      const { rates } = latestQuoteIdResponse.data;

      if (quoteId !== latestQuoteId) {
        throw new HttpException('Quote ID does not exist. Request for a QuoteID from /fx-rates', HttpStatus.NOT_FOUND);
      }

      const conversionKey = `${from}_${to}`;
      if (rates.hasOwnProperty(conversionKey)) {
        const exchangeRate = rates[conversionKey].rate;
        const convertedAmount = exchangeRate * amount;
        return { quoteId, from, to, amount, convertedAmount };
      }

      // Check if the conversion exists in cache
      let convertedAmount = this.fxService.getConversion(quoteId, from, to, amount);

      // If not found in cache, calculate and cache the conversion
      if (convertedAmount === undefined) {
        const exchangeRate = await this.fxService.getExchangeRate(from, to);
        convertedAmount = exchangeRate * amount;
        this.fxService.cacheConversion(quoteId, from, to, amount, convertedAmount);
      }

      return { quoteId, from, to, amount, convertedAmount };
    } catch (error) {
      throw error;
    }
  }
}
