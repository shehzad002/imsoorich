import { Upload } from "tus-js-client";

const CHUNK_SIZE = 6 * 1024 * 1024;

export function tusUploadWithProgress(options: {
  file: File;
  endpoint: string;
  token: string;
  bucket: string;
  objectName: string;
  onProgress: (loaded: number, total: number) => void;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    options.onProgress(0, options.file.size);

    const upload = new Upload(options.file, {
      endpoint: options.endpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        "x-signature": options.token,
        "x-upsert": "true",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: options.bucket,
        objectName: options.objectName,
        contentType: options.file.type || "application/octet-stream",
      },
      chunkSize: CHUNK_SIZE,
      onError: (error) => reject(error),
      onProgress: (bytesUploaded, bytesTotal) => {
        options.onProgress(bytesUploaded, bytesTotal);
      },
      onSuccess: () => resolve(),
    });

    upload.findPreviousUploads().then((previous) => {
      if (previous.length) {
        upload.resumeFromPreviousUpload(previous[0]);
      }
      upload.start();
    });
  });
}
