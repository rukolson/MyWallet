import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js";
import job from "./config/cron.js";

// Swagger
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// 🔐 Dozwolone originy (frontend + Swagger UI)
const allowedOrigins = [
  "http://localhost:8081",
  "http://localhost:5001"
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

// ✅ Middleware
app.use(rateLimiter);
app.use(express.json());

// ✅ Swagger setup
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

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ✅ API routes
app.use("/api/transactions", transactionsRoute);

// ✅ Start background job
if (process.env.NODE_ENV === "production") {
  job.start();
}

// ✅ MongoDB + start serwera
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
