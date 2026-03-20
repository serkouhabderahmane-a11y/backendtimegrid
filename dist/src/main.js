"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const corsOrigin = process.env.CORS_ORIGIN || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:5173';
    app.enableCors({
        origin: corsOrigin,
        credentials: true,
    });
    const port = process.env.PORT || process.env.VERCEL_PORT || 3000;
    await app.listen(port);
    console.log(`Application running on port: ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map