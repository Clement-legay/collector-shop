export declare class MetricsService {
    private readonly registry;
    private readonly usersRegisteredCounter;
    private readonly loginsCounter;
    constructor();
    incrementUsersRegistered(): void;
    incrementLogins(): void;
    getMetrics(): Promise<string>;
    getContentType(): string;
}
