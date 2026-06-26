/** XMLHttpRequest upload with progress (fetch has no upload progress). */
export function uploadWithProgress(
  method: string,
  url: string,
  body: FormData | File | Blob,
  options: {
    headers?: Record<string, string>;
    withCredentials?: boolean;
    totalSize?: number;
    onProgress: (loaded: number, total: number) => void;
  }
): Promise<{ ok: boolean; status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.withCredentials = options.withCredentials ?? false;

    const fallbackTotal =
      options.totalSize ??
      (body instanceof File ? body.size : body instanceof Blob ? body.size : 0);

    if (fallbackTotal > 0) {
      options.onProgress(0, fallbackTotal);
    }

    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        xhr.setRequestHeader(key, value);
      }
    }

    xhr.upload.onprogress = (event) => {
      const total = event.lengthComputable ? event.total : fallbackTotal;
      options.onProgress(event.loaded, total || event.loaded || 1);
    };

    xhr.onload = () => {
      if (fallbackTotal > 0) {
        options.onProgress(fallbackTotal, fallbackTotal);
      }

      let data: unknown = null;
      const text = xhr.responseText;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
      resolve({
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        data,
      });
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));
    xhr.send(body);
  });
}

function progressPercent(loaded: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((loaded / total) * 100));
}

export { progressPercent };
