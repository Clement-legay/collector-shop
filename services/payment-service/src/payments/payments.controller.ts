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

  @Post(":id/complete")
  async completePayment(@Param("id", ParseUUIDPipe) id: string) {
    return this.paymentsService.completePayment(id);
  }
}
