import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

export enum AlertType {
  PRICE_VARIATION = "price_variation",
  SUSPICIOUS_PURCHASES = "suspicious_purchases",
  HIGH_RISK_USER = "high_risk_user",
}

export enum AlertSeverity {
  GREEN = "green",
  ORANGE = "orange",
  RED = "red",
}

@Entity("fraud_alerts")
export class FraudAlert {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    name: "alert_type",
    type: "enum",
    enum: AlertType,
  })
  alertType: AlertType;

  @Column({
    type: "enum",
    enum: AlertSeverity,
  })
  severity: AlertSeverity;

  @Column({ name: "user_id", type: "uuid", nullable: true })
  userId: string;

  @Column({ name: "article_id", type: "uuid", nullable: true })
  articleId: string;

  @Column({ type: "jsonb", nullable: true })
  details: Record<string, any>;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
