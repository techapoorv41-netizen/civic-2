import env from "./env";
import { ConnectOptions } from "mongoose";

export interface DatabaseConfig {
  uri: string;
  options: ConnectOptions;
}

export const databaseConfig: DatabaseConfig = {
  uri: env.DATABASE_URL,
  options: {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
    autoIndex: true,
  },
};

export default databaseConfig;
