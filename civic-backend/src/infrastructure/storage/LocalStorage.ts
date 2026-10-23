import fs from "fs";
import path from "path";
import env from "../../config/env";
import { StorageProvider, UploadParams, UploadResult, DeleteParams } from "./StorageProvider";

export class LocalStorage extends StorageProvider {
  private baseDir: string;

  constructor(baseDir = "uploads") {
    super();
    this.baseDir = baseDir;
  }

  async upload({ buffer, key }: UploadParams): Promise<UploadResult> {
    const fullPath = path.join(this.baseDir, key);
    await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.promises.writeFile(fullPath, buffer);

    const publicUrl = `${env.PUBLIC_URL}/uploads/${key.replace(/\\/g, "/")}`;
    return {
      key,
      url: publicUrl,
    };
  }

  async delete({ key }: DeleteParams): Promise<void> {
    const fullPath = path.join(this.baseDir, key);
    try {
      await fs.promises.rm(fullPath, { force: true });
    } catch {
      // Ignore deletion errors for local cleanup
    }
  }
}

export default LocalStorage;
