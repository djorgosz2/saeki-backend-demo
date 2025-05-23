import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './infrastructure/persistence/relational/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ORDER_STATUS, OrderStatus } from './dto/update-order-status.dto';
import { Material } from './infrastructure/persistence/relational/material.entity';
import { Customer } from './infrastructure/persistence/relational/customer.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const material = await this.materialRepository.findOne({
      where: { materialId: createOrderDto.materialId },
    });
    if (!material) throw new Error('Material not found');

    let customer = await this.customerRepository.findOne({
      where: { email: createOrderDto.customerEmail },
    });
    if (!customer) {
      customer = this.customerRepository.create({
        name: createOrderDto.customerName,
        email: createOrderDto.customerEmail,
        company: createOrderDto.customerCompany,
      });
      customer = await this.customerRepository.save(customer);
    }

    const order = this.orderRepository.create({
      ...createOrderDto,
      material,
      customer,
      status: 'pending',
    });
    return this.orderRepository.save(order);
  }

  async getOrderStatus(id: string): Promise<{ status: OrderStatus }> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new Error('Order not found');
    return { status: order.status as OrderStatus };
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    if (!ORDER_STATUS.includes(status)) {
      throw new Error('Invalid order status');
    }
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new Error('Order not found');
    order.status = status;
    return this.orderRepository.save(order);
  }

  async getOrder(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'material'],
    });
    if (!order) throw new Error('Order not found');
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['customer', 'material'] });
  }
}
