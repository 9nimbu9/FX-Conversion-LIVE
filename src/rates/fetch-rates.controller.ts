// import { Controller, Get } from '@nestjs/common';
// import { cacheService } from 'src/cache-data/cache.provider';
// import { ApiTags } from '@nestjs/swagger';

// @ApiTags('FX Rates')
// @Controller('fx-rates')
// export class fxRatesController {
//   private lastQuoteIdRequestTime: number = 0; // Track the last time a quote ID was requested
//   private existingQuoteId: { id: string; expiresAt: number } = null; // Track the existing quote ID and its expiration time

//   constructor(private readonly fxService: cacheService) {}

//   @Get()
//   getAllRates() {
//     const currentTime = Date.now();
//     // Check if 30 seconds have passed since the last quote ID request or if no existing quote ID is available
//     if (currentTime - this.lastQuoteIdRequestTime >= 60000 || !this.existingQuoteId) {
//       this.lastQuoteIdRequestTime = currentTime;
//       const quoteId = this.fxService.generateQuoteId();
//       this.existingQuoteId = { id: quoteId, expiresAt: currentTime + 60000 }; // Set expiration time to 30 seconds from now
//     }

//     const rates = this.fxService.getAllRates(this.existingQuoteId.id);
//     return { quoteId: this.existingQuoteId.id, expiresAt: this.existingQuoteId.expiresAt, rates };
//   }
// }


import { Controller, Get } from '@nestjs/common';
import { cacheService } from 'src/cache-data/cache.provider';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('FX Rates')
@Controller('fx-rates')
export class fxRatesController {
  private lastQuoteIdRequestTime: number = 0; // Track the last time a quote ID was requested
  private existingQuoteId: { id: string; expiresAt: number } | null = null; // Track the existing quote ID and its expiration time

  constructor(private readonly fxService: cacheService) { }

  @Get()
  async getAllRates() {
    const currentTime = Date.now();
    // Check if 60 seconds have passed since the last quote ID request or if no existing quote ID is available
    if (currentTime - this.lastQuoteIdRequestTime >= 60000 || !this.existingQuoteId) {
      this.lastQuoteIdRequestTime = currentTime;
      const quoteId = await this.fxService.generateQuoteId(); // Make sure to await for generateQuoteId since it returns a Promise
      this.existingQuoteId = { id: quoteId, expiresAt: currentTime + 60000 }; // Set expiration time to 60 seconds from now
    }

    const rates = this.fxService.getAllRates(this.existingQuoteId!.id); // Use optional chaining to avoid runtime error
    return { quoteId: this.existingQuoteId!.id, expiresAt: this.existingQuoteId!.expiresAt, rates };
  }
}
