import path from "node:path";
import { unlink } from "node:fs/promises";

const uploadDirectory = path.resolve(process.cwd(), "public", "uploads");

function toUploadFilePath(filePath: string) {
  const normalizedPath = filePath.split("?")[0]?.split("#")[0]?.trim() || "";

  if (!normalizedPath.startsWith("/uploads/")) {
    return null;
  }

  const resolvedPath = path.resolve(process.cwd(), "public", normalizedPath.replace(/^\/+/, ""));

  if (resolvedPath !== uploadDirectory && !resolvedPath.startsWith(`${uploadDirectory}${path.sep}`)) {
    return null;
  }

  return resolvedPath;
}

export async function deleteUploadedFiles(paths: Array<string | null | undefined>) {
  const uniquePaths = Array.from(
    new Set(
      paths
        .filter((filePath): filePath is string => typeof filePath === "string" && filePath.trim().length > 0)
        .map((filePath) => filePath.trim())
    )
  );

  await Promise.all(
    uniquePaths.map(async (filePath) => {
      const fullPath = toUploadFilePath(filePath);

      if (!fullPath) {
        return;
      }

      try {
        await unlink(fullPath);
      } catch (error) {
        const nodeError = error as NodeJS.ErrnoException;

        if (nodeError?.code !== "ENOENT") {
          throw error;
        }
      }
    })
  );
}
