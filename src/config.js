import { config } from "dotenv";

config();

export const PORT = process.env.PORT || 3001;
export const DB_HOST = process.env.DB_host || "localhost";
export const DB_USER = process.env.DB_user || "root";
export const DB_PASSWORD = process.env.DB_password || "Jake";
export const DB_PORT = process.env.DB_port || 3306;
export const DB_DATABASE = process.env.DB_database || "bookapp";
