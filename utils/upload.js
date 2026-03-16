import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Creates a multer upload middleware that stores files on Cloudinary.
 *
 * @param {string} folder - The Cloudinary folder to store images in (e.g. "products", "categories")
 * @param {string} fieldName - The multipart form field name that carries the file (e.g. "image")
 * @returns Express middleware that:
 *   - Uploads the file to Cloudinary
 *   - Attaches `req.uploadedImage = { imageUrl, imagePublicId }` when a file is present
 *   - Does nothing (calls next()) when no file is present, so the handler can decide
 *     whether the image is required or optional.
 */
const createUploadMiddleware = (folder, fieldName = "image") => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      // Cloudinary will auto-detect the format; force jpeg/png/webp/gif/svg only
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "svg"],
      // Optional: apply a light transformation so the stored image is always
      // a web-ready JPEG (remove or adjust to taste)
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed"), false);
      }
      cb(null, true);
    },
  });

  // Return a composed middleware:
  //   1. multer single-file upload  →  2. attach structured data to req
  return [
    upload.single(fieldName),
    (req, _res, next) => {
      if (req.file) {
        // multer-storage-cloudinary exposes these on req.file
        req.uploadedImage = {
          imageUrl: req.file.path,         // public HTTPS URL – clicking it loads the image
          imagePublicId: req.file.filename, // Cloudinary public_id (used for deletion / transforms)
        };
      }
      next();
    },
  ];
};

// ─── Pre-built middleware instances ──────────────────────────────────────────

/** Use on product create / update routes */
export const uploadProductImage = createUploadMiddleware("products");

/** Use on category create / update routes */
export const uploadCategoryImage = createUploadMiddleware("categories");

// Export the factory so callers can create middleware for any folder
export default createUploadMiddleware;