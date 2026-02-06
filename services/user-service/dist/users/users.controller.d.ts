import { UsersService } from "./users.service";
import { RegisterDto, LoginDto, UpdateUserDto } from "./dto";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(registerDto: RegisterDto): Promise<{
        user: import("./entities/user.entity").User;
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: import("./entities/user.entity").User;
        token: string;
    }>;
    findAll(): Promise<import("./entities/user.entity").User[]>;
    findOne(id: string): Promise<import("./entities/user.entity").User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("./entities/user.entity").User>;
}
