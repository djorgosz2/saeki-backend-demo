import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { Order } from '../src/orders/infrastructure/persistence/relational/order.entity';
import { Customer } from '../src/orders/infrastructure/persistence/relational/customer.entity';
import { Material } from '../src/orders/infrastructure/persistence/relational/material.entity';
import { UserEntity } from '../src/users/user.entity';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';

describe('Order Creation (e2e, sqlite in-memory)', () => {
  let app: INestApplication;
  let material: Material;
  let orderId: string;
  const customerEmail = 'testuser@example.com';
  let adminToken: string;
  const allResponses: any[] = [];

  function saveResponse(name: string, data: any) {
    allResponses.push({ name, data });
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [Order, Customer, Material, UserEntity],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Order, Customer, Material, UserEntity]),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Seed an admin user for login
    const userRepo = app.get(getRepositoryToken(UserEntity));
    await userRepo.save(
      userRepo.create({
        email: 'admin@admin.com',
        password: await bcrypt.hash('adminpassword', 10),
        role: 'admin',
      }),
    );

    // Login as admin to get token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@admin.com', password: 'adminpassword' });
    adminToken = loginRes.body.token;

    // Seed a material for the order
    const materialRepo = app.get(getRepositoryToken(Material));
    material = await materialRepo.save(
      materialRepo.create({ materialName: 'PLA' }),
    );
  });

  afterAll(async () => {
    await app.close();
    fs.writeFileSync(
      'test/api-responses.json',
      JSON.stringify(allResponses, null, 2),
    );
  });

  it('should create a new order and a new customer', async () => {
    const orderDto = {
      customerName: 'Test User',
      customerEmail,
      file1Id: '11111111-1111-1111-1111-111111111111',
      file2Id: '22222222-2222-2222-2222-222222222222',
      materialId: material.materialId,
    };

    const res = await request(app.getHttpServer())
      .post('/orders')
      .send(orderDto)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.customer).toHaveProperty('email', orderDto.customerEmail);
    expect(res.body.material).toHaveProperty('materialId', material.materialId);
    expect(res.body.status).toBeDefined();
    orderId = res.body.id;
  });

  it('should get the new order by id and see all fields', async () => {
    const res = await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    // Log response to file for testing quick
    fs.writeFileSync(
      'test/order-get-by-id-response.json',
      JSON.stringify(res.body, null, 2),
    );
    expect(res.body).toHaveProperty('id', orderId);
    expect(res.body.customer).toHaveProperty('email', customerEmail);
    expect(res.body.material).toHaveProperty('materialId', material.materialId);
    expect(res.body.status).toBe('pending');
  });

  it('should create a second order for the same customer and customer should have both orders', async () => {
    const orderDto = {
      customerName: 'Test User',
      customerEmail,
      file1Id: '33333333-3333-3333-3333-333333333333',
      file2Id: '44444444-4444-4444-4444-444444444444',
      materialId: material.materialId,
    };
    const res = await request(app.getHttpServer())
      .post('/orders')
      .send(orderDto)
      .expect(201);
    expect(res.body).toHaveProperty('id');
    // Check customer in DB has two orders
    const customerRepo = app.get(getRepositoryToken(Customer));
    const customer = await customerRepo.findOne({
      where: { email: customerEmail },
      relations: ['orders'],
    });
    expect(customer).toBeDefined();
    expect(customer.orders.length).toBe(2);
  });

  it('should get order status by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/orders/${orderId}/status`)
      .expect(200);
    expect(res.body).toHaveProperty('status', 'pending');
  });

  it('should list all orders with admin rights', async () => {
    const res = await request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    saveResponse('list-orders-success', res.body);
  });
});
