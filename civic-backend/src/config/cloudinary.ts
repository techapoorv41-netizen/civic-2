import { v2 as cloudinary } from "cloudinary";
import env from "./env";

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export const cloudinaryConfig: CloudinaryConfig = {
  cloudName: env.CLOUDINARY_CLOUD_NAME,
  apiKey: env.CLOUDINARY_API_KEY,
  apiSecret: env.CLOUDINARY_API_SECRET,
};

export const configureCloudinary = (): typeof cloudinary => {
  if (cloudinaryConfig.cloudName && cloudinaryConfig.apiKey && cloudinaryConfig.apiSecret) {
    cloudinary.config({
      cloud_name: cloudinaryConfig.cloudName,
      api_key: cloudinaryConfig.apiKey,
      api_secret: cloudinaryConfig.apiSecret,
      secure: true,
    });
  }
  return cloudinary;
};

export { cloudinary };
export default configureCloudinary();
