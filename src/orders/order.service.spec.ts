import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './infrastructure/persistence/relational/order.entity';
import { Customer } from './infrastructure/persistence/relational/customer.entity';
import { Material } from './infrastructure/persistence/relational/material.entity';
import { Repository } from 'typeorm';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

const mockOrderRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
});
const mockCustomerRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});
const mockMaterialRepository = () => ({
  findOne: jest.fn(),
});

describe('OrderService', () => {
  let service: OrderService;
  let orderRepo: jest.Mocked<Repository<Order>>;
  let customerRepo: jest.Mocked<Repository<Customer>>;
  let materialRepo: jest.Mocked<Repository<Material>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useFactory: mockOrderRepository },
        {
          provide: getRepositoryToken(Customer),
          useFactory: mockCustomerRepository,
        },
        {
          provide: getRepositoryToken(Material),
          useFactory: mockMaterialRepository,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepo = module.get(getRepositoryToken(Order));
    customerRepo = module.get(getRepositoryToken(Customer));
    materialRepo = module.get(getRepositoryToken(Material));
  });

  describe('createOrder', () => {
    it('should create a new order and customer if customer does not exist', async () => {
      customerRepo.findOne.mockResolvedValue(null);
      customerRepo.create.mockReturnValue({
        email: 'a@b.com',
        name: 'A',
      } as any);
      customerRepo.save.mockResolvedValue({
        customerId: 'cid',
        email: 'a@b.com',
        name: 'A',
      } as any);
      materialRepo.findOne.mockResolvedValue({ materialId: 'mid' } as any);
      orderRepo.create.mockReturnValue({ id: 'oid', status: 'pending' } as any);
      orderRepo.save.mockResolvedValue({ id: 'oid', status: 'pending' } as any);

      const dto = {
        customerEmail: 'a@b.com',
        customerName: 'A',
        file1Id: 'f1',
        file2Id: 'f2',
        materialId: 'mid',
      };
      const result = await service.createOrder(dto as any);
      expect(customerRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'a@b.com' },
      });
      expect(customerRepo.create).toHaveBeenCalled();
      expect(orderRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'oid');
    });

    it('should create a new order for existing customer', async () => {
      customerRepo.findOne.mockResolvedValue({
        customerId: 'cid',
        email: 'a@b.com',
      } as any);
      materialRepo.findOne.mockResolvedValue({ materialId: 'mid' } as any);
      orderRepo.create.mockReturnValue({ id: 'oid', status: 'pending' } as any);
      orderRepo.save.mockResolvedValue({ id: 'oid', status: 'pending' } as any);

      const dto = {
        customerEmail: 'a@b.com',
        customerName: 'A',
        file1Id: 'f1',
        file2Id: 'f2',
        materialId: 'mid',
      };
      const result = await service.createOrder(dto as any);
      expect(customerRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'a@b.com' },
      });
      expect(customerRepo.create).not.toHaveBeenCalled();
      expect(orderRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'oid');
    });
  });

  describe('getOrder', () => {
    it('should return an order with relations', async () => {
      orderRepo.findOne.mockResolvedValue({
        id: 'oid',
        status: 'pending',
        customer: {},
        material: {},
      } as any);
      const result = await service.getOrder('oid');
      expect(orderRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'oid' },
        relations: ['customer', 'material'],
      });
      expect(result).toHaveProperty('id', 'oid');
    });
    it('should throw if order not found', async () => {
      orderRepo.findOne.mockResolvedValue(null);
      await expect(service.getOrder('badid')).rejects.toThrow(
        'Order not found',
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      orderRepo.findOne.mockResolvedValue({
        id: 'oid',
        status: 'pending',
        save: jest.fn(),
      } as any);
      orderRepo.save.mockResolvedValue({
        id: 'oid',
        status: 'completed',
      } as any);
      const dto: UpdateOrderStatusDto = { status: 'completed' };
      const result = await service.updateOrderStatus('oid', dto.status);
      expect(orderRepo.findOne).toHaveBeenCalledWith({ where: { id: 'oid' } });
      expect(orderRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('status', 'completed');
    });
    it('should throw if order not found', async () => {
      orderRepo.findOne.mockResolvedValue(null);
      const dto: UpdateOrderStatusDto = { status: 'completed' };
      await expect(
        service.updateOrderStatus('badid', dto.status),
      ).rejects.toThrow('Order not found');
    });
    it('should throw if status is invalid', async () => {
      orderRepo.findOne.mockResolvedValue({
        id: 'oid',
        status: 'pending',
        save: jest.fn(),
      } as any);
      const dto: any = { status: 'notvalid' };
      await expect(
        service.updateOrderStatus('oid', dto.status),
      ).rejects.toThrow();
    });
  });
});
