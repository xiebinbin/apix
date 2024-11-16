declare namespace NodeJS {
    declare interface ProcessEnv {
        DATABASE_URL: string;
        API_PORT: number;
        REDIS_URL: string;
        MAX_REQUEST_COUNT: number;
    }
}