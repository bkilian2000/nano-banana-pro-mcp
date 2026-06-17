import { readFile, writeFile, mkdir } from "fs/promises";
import { dirname, resolve, extname } from "path";
import type { ImageInput, ResolvedImageInput } from "./types.js";

// Map of file extensions to MIME types for image inputs read from disk.
const MIME_BY_EXTENSION: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

/**
 * Decode base64 image data and write it to disk, creating parent directories
 * as needed. Returns the absolute path written to.
 */
export async function saveImageToFile(
  base64Data: string,
  outputPath: string
): Promise<string> {
  const absolutePath = resolve(outputPath);
  const dir = dirname(absolutePath);

  // Ensure directory exists
  await mkdir(dir, { recursive: true });

  // Decode base64 and write to file
  const buffer = Buffer.from(base64Data, "base64");
  await writeFile(absolutePath, buffer);

  return absolutePath;
}

/**
 * Resolve a single image input to inline base64 + mimeType. If `path` is set,
 * the file is read and base64-encoded, with the MIME type inferred from the
 * extension (unless `mimeType` is given explicitly). Otherwise inline `data`
 * and `mimeType` are passed through unchanged.
 */
export async function resolveImageInput(
  input: ImageInput
): Promise<ResolvedImageInput> {
  if (input.path) {
    const absolutePath = resolve(input.path);

    let mimeType = input.mimeType;
    if (!mimeType) {
      const ext = extname(absolutePath).toLowerCase();
      mimeType = MIME_BY_EXTENSION[ext];
      if (!mimeType) {
        throw new Error(
          `Cannot infer MIME type from file extension "${ext || "(none)"}" for ${input.path}. ` +
            `Pass an explicit mimeType or use a supported extension (${Object.keys(MIME_BY_EXTENSION).join(", ")}).`
        );
      }
    }

    let buffer: Buffer;
    try {
      buffer = await readFile(absolutePath);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read image file ${input.path}: ${reason}`);
    }

    return { data: buffer.toString("base64"), mimeType };
  }

  if (input.data && input.mimeType) {
    return { data: input.data, mimeType: input.mimeType };
  }

  throw new Error(
    "Each image must provide either a file `path` or inline `data` with `mimeType`."
  );
}

/**
 * Resolve an array of image inputs to inline base64 + mimeType.
 */
export async function resolveImageInputs(
  inputs: ImageInput[]
): Promise<ResolvedImageInput[]> {
  return Promise.all(inputs.map(resolveImageInput));
}
