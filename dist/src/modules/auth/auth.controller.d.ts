import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    getDemoCredentials(): {
        demo: boolean;
        accounts: {
            role: string;
            email: string;
            passwordHint: string;
        }[];
    };
    register(tenantId: string, dto: CreateUserDto): Promise<{
        success: boolean;
        user_id: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
        role: import("@prisma/client").$Enums.UserRole;
        tenant_id: string;
        permissions: never[];
        token: string;
        refreshToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        success: boolean;
        user_id: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
        role: import("@prisma/client").$Enums.UserRole;
        tenant_id: string;
        permissions: never[];
        token: string;
        refreshToken: string;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    me(req: any): Promise<any>;
}
