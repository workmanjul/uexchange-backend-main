import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { PaginationModule } from 'src/pagination/pagination.module';

@Module({
  imports: [PaginationModule],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
