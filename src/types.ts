export interface GeminiImageConfig {
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  imageSize?: "1K" | "2K" | "4K";
}

export interface GeminiRequest {
  contents: Array<{
    parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>;
  }>;
  generationConfig: {
    responseModalities: string[];
    imageConfig?: GeminiImageConfig;
  };
}

export interface GeminiResponsePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: GeminiResponsePart[];
    };
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

// Image input as accepted from a tool call. Provide either inline base64
// (`data` + `mimeType`) or a `path` to an image file on disk. When `path` is
// used, the MIME type is inferred from the file extension unless `mimeType`
// is given explicitly.
export interface ImageInput {
  data?: string;      // base64 encoded image data
  mimeType?: string;  // e.g., "image/png", "image/jpeg"
  path?: string;      // path to an image file on disk
}

// An image input after path resolution: always inline base64 + mimeType.
export interface ResolvedImageInput {
  data: string;
  mimeType: string;
}

export interface GenerateImageOptions {
  prompt: string;
  aspectRatio?: GeminiImageConfig["aspectRatio"];
  imageSize?: GeminiImageConfig["imageSize"];
  model?: string;
  images?: ResolvedImageInput[];  // optional reference images
}

export interface GeneratedImage {
  mimeType: string;
  base64Data: string;
  description?: string;
}

export interface DescribeImageOptions {
  images: ResolvedImageInput[];
  prompt?: string;  // optional custom prompt for analysis
  model?: string;
}
