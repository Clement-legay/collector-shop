import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

@Entity("purchase_events")
export class PurchaseEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "buyer_id" })
  buyerId: string;

  @Column({ name: "transaction_id" })
  transactionId: string;

  @Column({ name: "article_id" })
  articleId: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
