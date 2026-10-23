import env from "../../config/env";
import { StorageProvider } from "./StorageProvider";
import { LocalStorage } from "./LocalStorage";
import { CloudinaryStorage } from "./cloudinaryStorage";

export * from "./StorageProvider";
export * from "./LocalStorage";
export * from "./cloudinaryStorage";

export const storage: StorageProvider =
  env.STORAGE_DRIVER === "cloudinary" ? new CloudinaryStorage() : new LocalStorage();

export default storage;
