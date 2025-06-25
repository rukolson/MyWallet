import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js";
import uploadRoute from "./routes/uploadRoute.js";
import job from "./config/cron.js";

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || "development";

console.log(`Server running in ${NODE_ENV.toUpperCase()} mode`);

const allowedOrigins = [
  "http://localhost:8081",
  "http://localhost:5001",
  "https://wallet-f2fdbwbhfvhhbhc7.francecentral-01.azurewebsites.net"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(rateLimiter);
app.use(express.json({ limit: "10mb" }));

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Transactions API",
      version: "1.0.0",
    },
  },
  apis: ["./src/routes/*.js"],
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/transactions", transactionsRoute);
app.use("/api/upload", uploadRoute);

if (NODE_ENV === "production") {
  console.log("Starting CRON job (production only)");
  job.start();
} else {
  console.log("Skipping CRON job (development mode)");
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
