import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum ArticleStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  SOLD = "sold",
  DELETED = "deleted",
}

@Entity("articles")
export class Article {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({
    name: "previous_price",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  previousPrice: number;

  @Column({ name: "seller_id", type: "uuid" })
  sellerId: string;

  @Column({ type: "jsonb", default: [] })
  photos: string[];

  @Column({
    type: "enum",
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  status: ArticleStatus;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
