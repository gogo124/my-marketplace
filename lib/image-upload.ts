import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

function resolveImageExtension(file: File) {
  const normalizedType = String(file.type || "").toLowerCase();
  const fileName = String(file.name || "").toLowerCase();

  if (normalizedType === "image/png" || fileName.endsWith(".png")) {
    return "png";
  }

  if (normalizedType === "image/webp" || fileName.endsWith(".webp")) {
    return "webp";
  }

  if (normalizedType === "image/jpeg" || normalizedType === "image/jpg" || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
    return "jpg";
  }

  throw new Error("Only JPG, JPEG, PNG, and WEBP images are allowed.");
}

export async function saveImageFiles(files: File[]) {
  const validFiles = files.filter((file) => file.size > 0);

  if (validFiles.length === 0) {
    return [];
  }

  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDirectory, { recursive: true });

  return Promise.all(
    validFiles.map(async (file) => {
      const extension = resolveImageExtension(file);
      const fileName = `${randomUUID()}.${extension}`;
      const filePath = path.join(uploadDirectory, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());

      await writeFile(filePath, buffer);

      return `/uploads/${fileName}`;
    })
  );
}
