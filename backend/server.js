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
app.use("/api/doctor",doctorRouter);
app.use("/api/user",userRouter);

app.get("/", (req, res) => {
    res.send("API WORKING");
});

// Start server
app.listen(port, () => console.log("Server Started on port", port));
