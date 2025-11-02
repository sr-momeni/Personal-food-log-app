import { readFileAsDataUrl } from "./files";

const DEFAULT_OPTIONS = {
  maxDimension: 720,
  quality: 0.6,
  mimeType: "image/jpeg",
};

const isImageFile = (file) => file?.type?.startsWith("image/");

const loadImageElement = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = src;
  });

const createBitmap = async (file) => {
  if (typeof createImageBitmap !== "function") return null;
  try {
    return await createImageBitmap(file);
  } catch (error) {
    return null;
  }
};

const toBlob = (canvas, type, quality) =>
  new Promise((resolve, reject) => {
    if (!canvas.toBlob) {
      reject(new Error("Canvas toBlob is not supported in this browser."));
      return;
    }
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Unable to create image blob."));
      }
    }, type, quality);
  });

const getScaledDimensions = (width, height, maxDimension) => {
  const largestSide = Math.max(width, height);
  if (largestSide <= maxDimension) {
    return { width, height, scaled: false };
  }
  const scale = maxDimension / largestSide;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    scaled: true,
  };
};

const buildFileName = (originalName = "meal-photo", extension = "jpg") => {
  const base = originalName.replace(/\.[^/.]+$/, "") || "meal-photo";
  return `${base}.${extension}`;
};

export async function downscaleImageFile(file, options = {}) {
  if (!isImageFile(file)) {
    return {
      file,
      previewUrl: await readFileAsDataUrl(file),
    };
  }

  const settings = { ...DEFAULT_OPTIONS, ...options };
  const bitmap = await createBitmap(file);

  let width;
  let height;
  let releaseBitmap = () => undefined;

  if (bitmap) {
    width = bitmap.width;
    height = bitmap.height;
    releaseBitmap = () => {
      if (typeof bitmap.close === "function") {
        bitmap.close();
      }
    };
  } else {
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = await loadImageElement(objectUrl);
      width = image.naturalWidth;
      height = image.naturalHeight;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  if (!width || !height) {
    return {
      file,
      previewUrl: await readFileAsDataUrl(file),
    };
  }

  const { width: targetWidth, height: targetHeight, scaled } =
    getScaledDimensions(width, height, settings.maxDimension);

  let outputFile = file;

  if (scaled || file.size > 2 * 1024 * 1024) {
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d", { alpha: false });
    context.clearRect(0, 0, targetWidth, targetHeight);
    if (bitmap) {
      context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
      releaseBitmap();
    } else {
      const objectUrl = URL.createObjectURL(file);
      try {
        const image = await loadImageElement(objectUrl);
        context.drawImage(image, 0, 0, targetWidth, targetHeight);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    }

    try {
      const blob = await toBlob(canvas, settings.mimeType, settings.quality);
      const extension = settings.mimeType.split("/")[1] || "jpg";
      outputFile = new File([blob], buildFileName(file.name, extension), {
        type: settings.mimeType,
        lastModified: Date.now(),
      });
    } catch (error) {
      // Fall back to original file if compression fails.
      outputFile = file;
    }

    context.clearRect(0, 0, targetWidth, targetHeight);
    canvas.width = 0;
    canvas.height = 0;
  }

  const previewUrl = await readFileAsDataUrl(outputFile);

  return {
    file: outputFile,
    previewUrl,
  };
}

export default downscaleImageFile;
