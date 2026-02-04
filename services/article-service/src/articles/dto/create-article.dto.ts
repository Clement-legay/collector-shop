import { IsString, IsNumber, IsArray, IsUUID, IsEnum, IsOptional, Min, MinLength } from 'class-validator';
import { ArticleStatus } from '../entities/article.entity';

export class CreateArticleDto {
    @IsString()
    @MinLength(3)
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsUUID()
    sellerId: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    photos?: string[];

    @IsEnum(ArticleStatus)
    @IsOptional()
    status?: ArticleStatus;
}
