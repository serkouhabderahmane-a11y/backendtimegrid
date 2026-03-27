import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    health(): {
        status: string;
        service: string;
        version: string;
        env: string;
        timestamp: string;
    };
    healthCheck(): {
        status: string;
        uptime: number;
        memory: NodeJS.MemoryUsage;
    };
}
