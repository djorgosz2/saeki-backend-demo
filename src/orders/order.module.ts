import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './infrastructure/persistence/relational/order.entity';
import { Material } from './infrastructure/persistence/relational/material.entity';
import { Customer } from './infrastructure/persistence/relational/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Material, Customer])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
