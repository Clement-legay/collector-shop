import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { InitiatePaymentDto } from "./dto";
import { Transaction } from "./entities/transaction.entity";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async initiatePayment(@Body() initiatePaymentDto: InitiatePaymentDto) {
    return this.paymentsService.initiatePayment(initiatePaymentDto);
  }

  @Get()
  async findAll() {
    return this.paymentsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.paymentsService.findOne(id);
  }

  @Get("user/:userId")
  async findByUser(@Param("userId", ParseUUIDPipe) userId: string) {
    return this.paymentsService.findByUser(userId);
  }

  @Get("seller/:userId")
  async findBySeller(@Param("userId", ParseUUIDPipe) userId: string) {
    return this.paymentsService.findSalesBySeller(userId);
  }

  @Post(":id/validate")
  async validate(
    @Param("id") id: string,
    @Body("approved") approved: boolean,
  ): Promise<Transaction> {
    return this.paymentsService.validateTransaction(id, approved);
  }

  @Post(":id/complete")
  async completePayment(@Param("id", ParseUUIDPipe) id: string) {
    return this.paymentsService.completePayment(id);
  }
}
