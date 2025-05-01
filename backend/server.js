import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import adminRouter from "./routes/adminRoute.js";
import path from "path";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";

// App config
const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(express.json());
app.use(cors());

// Serve static files from the uploads folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

// Start server
app.listen(port, () => console.log("Server Started on port", port));
// import express from "express";
// import cors from "cors";
// import "dotenv/config";
// import connectDB from "./config/mongodb.js";
// import adminRouter from "./routes/adminRoute.js";
// import path from "path";
// import doctorRouter from "./routes/doctorRoute.js";
// import userRouter from "./routes/userRoute.js";
// import multer from 'multer';

// // App config
// const app = express();
// const port = process.env.PORT || 4000;

// // Connect to MongoDB
// connectDB();

// // Multer setup for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });
// const upload = multer({ storage });

// // Middlewares
// app.use(express.json());
// app.use(cors());

// // Serve static files from the uploads folder
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// // API endpoints
// app.use("/api/admin", adminRouter);
// app.use("/api/doctor", doctorRouter);
// app.use("/api/user", upload.single('image'), userRouter);

// app.get("/", (req, res) => {
//   res.send("API WORKING");
// });

// // Start server
// app.listen(port, () => console.log("Server Started on port", port));
// import express from "express";
// import cors from "cors";
// import "dotenv/config";
// import connectDB from "./config/mongodb.js";
// import adminRouter from "./routes/adminRoute.js";
// import path from "path";
// import doctorRouter from "./routes/doctorRoute.js";
// import userRouter from "./routes/userRoute.js";
// import fs from 'fs';

// // App config
// const app = express();
// const port = process.env.PORT || 4000;

// // Connect to MongoDB
// connectDB();

// // Ensure uploads directory exists
// const uploadsDir = path.join(process.cwd(), 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
//   console.log('Created uploads directory');
// }

// // Middlewares
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));
// app.use(cors());

// // Serve static files from the uploads folder
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// // API endpoints
// app.use("/api/admin", adminRouter);
// app.use("/api/doctor", doctorRouter);
// app.use("/api/user", userRouter);

// // Error handling middleware to ensure JSON responses
// app.use((err, req, res, next) => {
//   console.error('Global Server Error:', err);
//   res.status(500).json({ success: false, message: `Internal Server Error: ${err.message}` });
// });

// app.get("/", (req, res) => {
//   res.send("API WORKING");
// });

// // Start server
// app.listen(port, () => console.log("Server Started on port", port));