import express from "express";
import dotenv from "dotenv";
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

// Swagger config
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

if (process.env.NODE_ENV === "production") {
job.start();
}

app.use(rateLimiter);
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get("/api/health", (req, res) => {
res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/transactions", transactionsRoute);

// Connect to MongoDB and start server
connectDB().then(() => {
app.listen(PORT, () => {
console.log("Server is running on port ${PORT}");
});
});