import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../../config/config.module';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: any): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.UserRole;
        tenantId: string;
        tenant: {
            id: string;
            slug: string;
            domain: string | null;
            name: string;
            settings: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
export {};
