import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ExperimentModule } from "./experiment/experiment.module";
import { RoleModule } from "./role/role.module";
import { UserModule } from "./user/user.module";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { NewsModule } from "./news/news.module";
import { PaginationModule } from "./pagination/pagination.module";
import { PermissionModule } from "./permission/permission.module";
import { FaqModule } from "./faq/faq.module";
import { ExchangeRateModule } from "./exchange_rate/exchange_rate.module";
import { OfficeLocationModule } from "./office_location/office_location.module";
import { TradingModule } from "./trading/trading.module";
import { InventoryModule } from "./inventory/inventory.module";
import { CustomerModule } from "./customer/customer.module";
import { MailerModule } from "@nestjs-modules/mailer";
import { SMTP_HOST, SMTP_PASSWORD, SMTP_USER, SMTP_PORT } from "src/config";
import { SettingsModule } from "./settings/settings.module";
import { WholesaleModule } from "./wholesale/wholesale.module";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { join } from "path";
import { OnholdModule } from './onhold/onhold.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ExperimentModule,
    RoleModule,
    UserModule,
    NewsModule,
    PaginationModule,
    PermissionModule,
    FaqModule,
    ExchangeRateModule,
    OfficeLocationModule,
    TradingModule,
    InventoryModule,
    CustomerModule,
    MailerModule.forRoot({
      transport: {
        host: SMTP_HOST,
        port: SMTP_PORT,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD,
        },
      },
      template: {
        dir: join(__dirname, "..", "mails"),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    SettingsModule,
    WholesaleModule,
    OnholdModule,
  ],
  controllers: [AppController],
  providers: [Reflector, AppService],
})
export class AppModule {}
