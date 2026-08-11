import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { MenusModule } from './modules/menus/menus.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { FilesModule } from './modules/files/files.module';
import { ProductsModule } from './modules/products/products.module';
import { TaxesModule } from './modules/taxes/taxes.module';
import { ModifierGroupsModule } from './modules/modifier-groups/modifier-groups.module';
import { ModifiersModule } from './modules/modifiers/modifiers.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { DiningTablesModule } from './modules/dining-tables/dining-tables.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { HttpExceptionFilter } from './common/filters';
import { TransformInterceptor } from './common/interceptors';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig()),
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    MenusModule,
    CategoriesModule,
    FilesModule,
    ProductsModule,
    TaxesModule,
    ModifierGroupsModule,
    ModifiersModule,
    PaymentMethodsModule,
    DiscountsModule,
    DiningTablesModule,
    OrdersModule,
    PaymentsModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
