import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsEnum,
  IsUUID,
} from "class-validator";
import { Type } from "class-transformer";
import { ArticleStatus } from "../entities/article.entity";

export class GetArticlesDto {
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
