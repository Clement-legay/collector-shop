export declare enum UserRole {
    BUYER = "buyer",
    SELLER = "seller",
    ADMIN = "admin"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
