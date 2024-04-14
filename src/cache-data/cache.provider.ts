import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

@Injectable()
export class cacheService {
  private ratesCache: { [key: string]: { rate: number; expiresAt: number } } = {};
  private quoteIdCache: { [quoteId: string]: { rates: { [key: string]: { rate: number; expiresAt: number } } } } = {};
  private conversionCache: { [quoteId: string]: number } = {};

  async getExchangeRate(from: string, to: string): Promise<number> {
    const apiKey = '83DZYC838OCO689Q';
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${apiKey}`;

    const cachedRate = this.ratesCache[`${from}_${to}`];
    if (cachedRate && cachedRate.expiresAt > Date.now()) {
      return cachedRate.rate;
    }

    try {
      const response = await axios.get(url);
      const exchangeRate = parseFloat(response.data['Realtime Currency Exchange Rate']['5. Exchange Rate']);

      // Cache the rate with a 30-second expiration time
      this.ratesCache[`${from}_${to}`] = {
        rate: exchangeRate,
        expiresAt: Date.now() + 30000, // 30 seconds from now
      };

      return exchangeRate;
    } catch (error) {
      throw error;
    }
  }

  getAllRates(quoteId: string) {
    return this.quoteIdCache[quoteId]?.rates;
  }

  // generateQuoteId() {
  //   const quoteId = uuidv4(); // Assuming you have a method to generate unique IDs
  //   this.quoteIdCache[quoteId] = { rates: { ...this.ratesCache } };
  //   return quoteId;
  // }

  async generateQuoteId() {
    const quoteId = uuidv4(); // Generate a new quote ID
    const currentTime = Date.now();

    // Check if ratesCache is initialized and not empty before proceeding
    if (this.ratesCache !== null && this.ratesCache !== undefined && Object.keys(this.ratesCache).length > 0) {
      // Iterate through each currency pair in the cache
      for (const currencyPair in this.ratesCache) {
        // Ensure ratesCache hasOwnProperty method exists
        if (Object.prototype.hasOwnProperty.call(this.ratesCache, currencyPair)) {
          const [from, to] = currencyPair.split('_');

          try {
            // Fetch the latest exchange rate data for the currency pair
            const exchangeRate = await this.getExchangeRate(from, to);

            // Update the cache with the latest exchange rate data and expiration time
            this.ratesCache[currencyPair] = {
              rate: exchangeRate,
              expiresAt: currentTime + 30000, // 30 seconds from now
            };
          } catch (error) {
            console.error(`Failed to update cache for ${from}_${to}: ${error.message}`);
          }
        }
      }

      // Remove old cache entries that are no longer valid
      for (const currencyPair in this.ratesCache) {
        // Ensure ratesCache hasOwnProperty method exists
        if (Object.prototype.hasOwnProperty.call(this.ratesCache, currencyPair)) {
          if (this.ratesCache[currencyPair].expiresAt < currentTime) {
            delete this.ratesCache[currencyPair];
          }
        }
      }
    }

    // Update the quoteIdCache with the new quote ID and updated cache data
    this.quoteIdCache[quoteId] = { rates: { ...this.ratesCache } };

    return quoteId;
  }


  getConversion(quoteId: string, from: string, to: string, amount: number) {
    const key = `${quoteId}_${from}_${to}_${amount}`;
    return this.conversionCache[key];
  }

  cacheConversion(quoteId: string, from: string, to: string, amount: number, convertedAmount: number) {
    const key = `${quoteId}_${from}_${to}_${amount}`;
    this.conversionCache[key] = convertedAmount;
  }

}
