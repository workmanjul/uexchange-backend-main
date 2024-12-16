import { Module } from '@nestjs/common';
import { WholesaleService } from './wholesale.service';
import { WholesaleController } from './wholesale.controller';

@Module({
  controllers: [WholesaleController],
  providers: [WholesaleService]
})
export class WholesaleModule {}
