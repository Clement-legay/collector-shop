import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface Article {
    id: string;
    title: string;
    price: number;
    sellerId: string;
    status: string;
}

@Injectable()
export class ArticleClient {
    private readonly logger = new Logger(ArticleClient.name);
    private readonly baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>('ARTICLE_SERVICE_URL', 'http://localhost:3001');
    }

    async getArticle(articleId: string): Promise<Article | null> {
        try {
            const response = await firstValueFrom(
                this.httpService.get<Article>(`${this.baseUrl}/articles/${articleId}`),
            );
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to fetch article ${articleId}`, error);
            return null;
        }
    }

    async updateArticleStatus(articleId: string, status: string): Promise<boolean> {
        try {
            await firstValueFrom(
                this.httpService.put(`${this.baseUrl}/articles/${articleId}/status`, { status }),
            );
            return true;
        } catch (error) {
            this.logger.error(`Failed to update article ${articleId} status`, error);
            return false;
        }
    }
}
