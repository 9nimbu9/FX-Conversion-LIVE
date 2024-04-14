import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { conversionController } from './conversion/conversion-rates.controller';
import { cacheController } from './cache-data/cache.controller';
import { cacheService } from './cache-data/cache.provider';
import { AccountController } from './accounts/accounts.controller';
import { AccountService } from './accounts/accounts.service';
import { fxRatesController } from './rates/fetch-rates.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
// import { FxCacheController } from './cache-data/view-cache';

@Module({
  imports: [ScheduleModule.forRoot(),
    CacheModule.register(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 2,
    }]),
  ],
  controllers: [AppController, conversionController, cacheController, AccountController, fxRatesController],
  providers: [AppService, cacheService, AccountService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ThrottlerGuard
    }    
  ],
})
export class AppModule {}
