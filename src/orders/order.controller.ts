import { Body, Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Get(':id/status')
  async getOrderStatus(@Param('id') id: string) {
    return this.orderService.getOrderStatus(id);
  }

  // @UseGuards(JwtAuthGuard, AdminGuard)
  // @Patch(':id/status')
  // async updateOrderStatus(
  //   @Param('id') id: string,
  //   @Body() dto: UpdateOrderStatusDto,
  // ) {
  //   return this.orderService.updateOrderStatus(id, dto.status);
  // }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.orderService.getOrder(id);
  }

  @Get()
  async getAllOrders() {
    return this.orderService.getAllOrders();
  }
}
