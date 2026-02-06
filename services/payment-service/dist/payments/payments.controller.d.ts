import { PaymentsService } from "./payments.service";
import { InitiatePaymentDto } from "./dto";
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    initiatePayment(initiatePaymentDto: InitiatePaymentDto): Promise<import("./entities/transaction.entity").Transaction>;
    findAll(): Promise<import("./entities/transaction.entity").Transaction[]>;
    findOne(id: string): Promise<import("./entities/transaction.entity").Transaction>;
    findByUser(userId: string): Promise<import("./entities/transaction.entity").Transaction[]>;
    completePayment(id: string): Promise<import("./entities/transaction.entity").Transaction>;
}
