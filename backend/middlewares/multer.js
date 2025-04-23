import multer from "multer";
import path from "path";
import fs from "fs";

// Define storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        const uploadDir = "uploads/";
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        callback(null, uploadDir); // Save files in 'uploads/' folder
    },
    filename: function (req, file, callback) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        callback(null, `${basename}-${uniqueSuffix}${ext}`);
    }
});

// File filter to allow only images
const fileFilter = (req, file, callback) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
        callback(null, true);
    } else {
        callback(new Error("Only images (JPEG, JPG, PNG) are allowed!"), false);
    }
};

// Set Multer upload limits and apply filters
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter
});

export default upload;