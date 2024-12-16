import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PaginationModule } from 'src/pagination/pagination.module';

@Module({
  imports: [PaginationModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
