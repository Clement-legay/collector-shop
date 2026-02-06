import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseUUIDPipe,
    ParseEnumPipe,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto, UpdatePriceDto } from './dto';
import { ArticleStatus } from './entities/article.entity';

@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    @Post()
    async create(@Body() createArticleDto: CreateArticleDto) {
        return this.articlesService.create(createArticleDto);
    }

    @Get()
    async findAll(
        @Query('status', new ParseEnumPipe(ArticleStatus, { optional: true })) status?: ArticleStatus,
        @Query('sellerId') sellerId?: string,
    ) {
        return this.articlesService.findAll({ status, sellerId });
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.articlesService.findOne(id);
    }

    @Put(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateArticleDto: UpdateArticleDto,
    ) {
        return this.articlesService.update(id, updateArticleDto);
    }

    @Put(':id/price')
    async updatePrice(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updatePriceDto: UpdatePriceDto,
    ) {
        return this.articlesService.updatePrice(id, updatePriceDto);
    }

    @Put(':id/status')
    async updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('status') status: ArticleStatus,
    ) {
        return this.articlesService.updateStatus(id, status);
    }

    @Delete(':id')
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.articlesService.remove(id);
    }
}
