import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountService {
  private balances: { [currency: string]: number } = {};

  topUp(amount: number, currency: string) {
    if (!this.balances[currency]) {
      this.balances[currency] = 0;
    }
    this.balances[currency] += amount;
  }

  deduct(amount: number, currency: string) {
    // Check if the specified currency exists in the balances
    if (!this.balances[currency]) {
      throw new Error(`Deduction failed: Currency "${currency}" not found`);
    }

    // Check if deducting the amount will result in a negative balance
    if (this.balances[currency] - amount < 0) {
      throw new Error('Deduction failed: Insufficient balance');
    }

    // Deduct the amount from the balance
    this.balances[currency] -= amount;
  }

  getBalance(currency: string) {
    return this.balances[currency] || 0;
  }

  getAllBalances() {
    return this.balances;
  }
}
