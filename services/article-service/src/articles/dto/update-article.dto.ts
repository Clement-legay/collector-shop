import {
  IsString,
  IsNumber,
  IsArray,
  IsEnum,
  IsOptional,
  Min,
  MinLength,
} from "class-validator";
import { ArticleStatus } from "../entities/article.entity";

export class UpdateArticleDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @IsEnum(ArticleStatus)
  @IsOptional()
  status?: ArticleStatus;
}
