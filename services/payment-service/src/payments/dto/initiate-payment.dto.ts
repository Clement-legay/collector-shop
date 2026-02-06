import { IsUUID, IsNumber, Min } from "class-validator";

export class InitiatePaymentDto {
  @IsUUID()
  articleId: string;

  @IsUUID()
  buyerId: string;

  @IsNumber()
  @Min(0)
  amount: number;
}
