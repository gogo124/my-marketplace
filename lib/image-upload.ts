function isValidImageUrl(value: string) {
  return value.startsWith("https://") || value.startsWith("http://") || value.startsWith("/");
}

export async function uploadImage(file: File) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured. Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });
  const data = await response.json();

  if (!response.ok) {
    const cloudinaryMessage =
      typeof data?.error?.message === "string" && data.error.message.trim().length > 0
        ? data.error.message.trim()
        : "Image upload failed.";

    if (cloudinaryMessage.toLowerCase().includes("unknown api key")) {
      throw new Error(`Cloudinary rejected the upload. Verify NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="${cloudName}".`);
    }

    if (cloudinaryMessage.toLowerCase().includes("upload preset")) {
      throw new Error(
        `Cloudinary rejected upload preset "${uploadPreset}". Verify that it exists and is unsigned.`
      );
    }

    throw new Error(cloudinaryMessage);
  }

  if (typeof data?.secure_url !== "string" || data.secure_url.length === 0) {
    throw new Error("Image upload did not return a secure URL.");
  }

  return data.secure_url as string;
}

export function getSubmittedImageUrls(formData: FormData, fieldName: string) {
  return formData
    .getAll(fieldName)
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);
}

export function validateSubmittedImageUrls({
  urls,
  maxFiles,
  label
}: {
  urls: string[];
  maxFiles: number;
  label: string;
}) {
  if (urls.length > maxFiles) {
    return `You can upload up to ${maxFiles} ${label}.`;
  }

  for (const url of urls) {
    if (!isValidImageUrl(url)) {
      return "Invalid image URL.";
    }
  }

  return "";
}
