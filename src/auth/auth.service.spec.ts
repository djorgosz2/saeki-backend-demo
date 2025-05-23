import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../users/user.entity';

jest.mock('bcryptjs', () => ({
  compare: jest
    .fn()
    .mockImplementation((password) =>
      Promise.resolve(password === 'correctPassword'),
    ),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser: Partial<UserEntity> = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'correctPassword',
    };

    it('should successfully login with correct credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as UserEntity);
      configService.get.mockReturnValue('1h');
      jwtService.sign.mockReturnValue('mockJwtToken');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        token: 'mockJwtToken',
        tokenExpires: expect.any(Number),
        user: mockUser,
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        { expiresIn: '1h' },
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(undefined);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as UserEntity);
      const wrongLoginDto = { ...loginDto, password: 'wrongPassword' };

      await expect(service.login(wrongLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user has no password', async () => {
      const userWithoutPassword = {
        ...mockUser,
        password: undefined,
      } as unknown as UserEntity;
      usersService.findByEmail.mockResolvedValue(userWithoutPassword);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should use default expiration when config value is not set', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as UserEntity);
      configService.get.mockReturnValue(null);
      jwtService.sign.mockReturnValue('mockJwtToken');

      await service.login(loginDto);

      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Object), {
        expiresIn: '1h',
      });
    });
  });
});
