export const ACCEPTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_LISTING_IMAGES = 6;
export const ACCEPTED_IMAGE_INPUT = "image/png,image/jpeg,image/jpg,image/webp";

export function validateImageFiles({
  files,
  maxFiles,
  label
}: {
  files: File[];
  maxFiles: number;
  label: string;
}) {
  if (files.length > maxFiles) {
    return `You can upload up to ${maxFiles} ${label}.`;
  }

  for (const file of files) {
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      return "Only JPG, JPEG, PNG, and WEBP images are allowed.";
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return "Each image must be 5 MB or smaller.";
    }
  }

  return "";
}
