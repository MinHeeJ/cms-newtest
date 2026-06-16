import { createId } from "../../persistence/database.js";

export interface StoredObject {
  storageKey: string;
  publicUrl: string;
}

export interface ObjectStorageClient {
  putObject(input: { fileName: string; mimeType: string; sizeBytes: number }): Promise<StoredObject>;
  removeObject(storageKey: string): Promise<void>;
}

export class LocalObjectStorageClient implements ObjectStorageClient {
  constructor(private readonly baseUrl = process.env.STORAGE_BASE_URL ?? "http://localhost:3000/uploads") {}

  async putObject(input: { fileName: string; mimeType: string; sizeBytes: number }): Promise<StoredObject> {
    const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storageKey = `${createId()}-${safeName}`;
    return {
      storageKey,
      publicUrl: `${this.baseUrl.replace(/\/$/, "")}/${storageKey}`
    };
  }

  async removeObject(_storageKey: string): Promise<void> {
    return;
  }
}

export const storageClient = new LocalObjectStorageClient();
