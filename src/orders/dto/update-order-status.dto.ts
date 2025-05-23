import { IsIn } from 'class-validator';

export const ORDER_STATUS = [
  'pending',
  'in_progress',
  'completed',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];

export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUS)
  status: OrderStatus;
}
