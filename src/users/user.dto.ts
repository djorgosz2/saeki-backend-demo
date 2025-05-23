import { IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  id: number;

  @IsEmail()
  email: string;

  @IsOptional()
  role?: string;

  @IsOptional()
  createdAt?: string;

  @IsOptional()
  updatedAt?: string;

  @IsOptional()
  deletedAt?: string | null;
}
