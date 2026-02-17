// config/cloudinary.js

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

// ------------------------------------------------------------------
// 1. Cloudinary config (reads from .env)
// ------------------------------------------------------------------

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ------------------------------------------------------------------
// 2. Upload from a Buffer (Multer memoryStorage gives you req.file.buffer)
// ------------------------------------------------------------------

export const uploadFromBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "greek-restaurant",
        resource_type: "image",
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

// ------------------------------------------------------------------
// 3. Delete a Cloudinary asset by public_id
// ------------------------------------------------------------------

export const destroy = (publicId) => cloudinary.uploader.destroy(publicId);

export { cloudinary };