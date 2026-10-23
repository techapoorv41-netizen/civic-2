import { cloudinary } from "../../config/cloudinary";
import { StorageProvider, UploadParams, UploadResult, DeleteParams } from "./StorageProvider";

export class CloudinaryStorage extends StorageProvider {
  async upload({ buffer, key }: UploadParams): Promise<UploadResult> {
    const publicId = key.replace(/\.[^.]+$/, "");

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: "image",
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          if (!result) {
            return reject(new Error("Cloudinary upload failed: Empty result"));
          }
          resolve({
            key: result.public_id,
            url: result.secure_url,
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  async delete({ key }: DeleteParams): Promise<any> {
    try {
      return await cloudinary.uploader.destroy(key);
    } catch (error) {
      // Return error result or handle gracefully
      return { error };
    }
  }
}

export default CloudinaryStorage;
