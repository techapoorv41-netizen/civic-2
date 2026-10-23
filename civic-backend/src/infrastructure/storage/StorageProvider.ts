export interface UploadParams {
  buffer: Buffer;
  key: string;
  mimeType: string;
}

export interface UploadResult {
  key: string;
  url: string;
}

export interface DeleteParams {
  key: string;
}

export abstract class StorageProvider {
  abstract upload(params: UploadParams): Promise<UploadResult>;
  abstract delete(params: DeleteParams): Promise<any>;
}

export default StorageProvider;
