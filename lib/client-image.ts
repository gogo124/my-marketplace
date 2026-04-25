"use client";

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not load image."));
    };
    image.src = objectUrl;
  });
}

export async function compressImageIfPossible(file: File) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }

  if (!file.type.startsWith("image/")) {
    return file;
  }

  try {
    const image = await loadImage(file);
    const maxDimension = 1800;
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");

    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const preferredType = file.type === "image/png" ? "image/webp" : file.type;
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, preferredType, 0.82);
    });

    if (!blob || blob.size >= file.size) {
      return file;
    }

    const extension = preferredType === "image/webp" ? "webp" : preferredType === "image/png" ? "png" : "jpg";
    const nextName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${nextName}.${extension}`, { type: preferredType, lastModified: Date.now() });
  } catch {
    return file;
  }
}

export async function compressImagesIfPossible(files: File[]) {
  return Promise.all(files.map((file) => compressImageIfPossible(file)));
}
