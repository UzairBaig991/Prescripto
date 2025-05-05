// import express from 'express';
// import cors from 'cors';
// import 'dotenv/config';
// import connectDB from './config/mongodb.js';
// import adminRouter from './routes/adminRoute.js';
// import doctorRouter from './routes/doctorRoute.js';
// import userRouter from './routes/userRoute.js';
// import path from 'path';
// import fs from 'fs';
// import multer from 'multer';
// import { fileURLToPath } from 'url';

// // App config
// const app = express();
// const port = process.env.PORT || 4000;

// // Get __dirname equivalent in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Ensure uploads directory exists
// const uploadsDir = path.join(__dirname, 'Uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(UploadsDir, { recursive: true });
//   console.log('Created Uploads directory');
// }

// // Multer setup for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'Uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage });

// // Connect to MongoDB
// connectDB();

// // Middlewares
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));
// app.use(cors());

// // Serve static files from the Uploads folder
// app.use('/uploads', express.static(uploadsDir));

// // API endpoints
// app.use('/api/admin', adminRouter);
// app.use('/api/doctor', doctorRouter);
// app.use('/api/user', userRouter); // Note: Multer is applied in userRouter for specific routes

// // Root endpoint
// app.get('/', (req, res) => {
//   res.send('API WORKING');
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Global Server Error:', err);
//   res.status(500).json({ success: false, message: `Internal Server Error: ${err.message}` });
// });

// // Start server
// app.listen(port, () => console.log(`Server started on port ${port}`));

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';

// App config
const app = express();
const port = process.env.PORT || 4000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'Uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created Uploads directory');
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Connect to MongoDB
connectDB();

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Serve static files from the Uploads folder
app.use('/uploads', express.static(uploadsDir));

// API endpoints
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.send('API WORKING');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global Server Error:', err);
  res.status(500).json({ success: false, message: `Internal Server Error: ${err.message}` });
});

// Start server
app.listen(port, () => console.log(`Server started on port ${port}`));