import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
} from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsOptional()
  @IsString()
  customerCompany?: string;

  @IsUUID()
  file1Id: string;

  @IsUUID()
  file2Id: string;

  @IsInt()
  materialId: number;

  @IsOptional()
  @IsString()
  purchaseOrderUrl?: string;
}
