import { Module } from '@nestjs/common';
import { OnholdService } from './onhold.service';
import { OnholdController } from './onhold.controller';

@Module({
  controllers: [OnholdController],
  providers: [OnholdService]
})
export class OnholdModule {}
