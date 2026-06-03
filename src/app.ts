import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes";
import { generalLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. ATUR PROXY DI PALING ATAS (Wajib sebelum rateLimiter)
app.set("trust proxy", 1);

// 2. Global Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Pasang General Limiter setelah konfigurasi proxy siap
app.use(generalLimiter);

// 4. Routes 
app.use("/api", router);

app.get("/", (_req, res) => res.json({ message: "HashMicro API is running" }));

// 5. Error Handler 
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});