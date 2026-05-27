declare global {
  interface CloudinaryUploadWidgetResult {
    event: string;
    info?: {
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
      format: string;
    };
  }

  interface CloudinaryUploadWidgetOptions {
    cloudName: string;
    apiKey: string;
    uploadSignature: (
      callback: (signature: string) => void,
      paramsToSign: Record<string, string | number>
    ) => void;
    maxFileSize: number;
    resourceType: string;
    multiple: boolean;
    maxFiles?: number;
  }

  interface CloudinaryUploadWidget {
    open: () => void;
    close: () => void;
  }

  interface CloudinaryGlobal {
    createUploadWidget: (
      options: CloudinaryUploadWidgetOptions,
      callback: (error: Error | null, result: CloudinaryUploadWidgetResult) => void
    ) => CloudinaryUploadWidget;
  }

  interface Window {
    cloudinary?: CloudinaryGlobal;
  }
}

export {};
