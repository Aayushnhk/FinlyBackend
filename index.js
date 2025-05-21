import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";

import CategoriesController from "./controllers/CategoriesController.js";
import BudgetsController from "./controllers/BudgetsController.js";
import FinancialReportsController from "./controllers/FinancialReportsController.js";
import TransactionsController from "./controllers/TransactionsController.js";
import AuthController from "./controllers/AuthController.js";

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Fallback for local dev
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "API Server Running",
    timestamp: new Date().toISOString(),
    environment: {
      frontend: process.env.FRONTEND_URL,
      node_version: process.version,
    },
  });
});

// API routes
app.use("/api/auth", AuthController);
app.use("/api/categories", CategoriesController);
app.use("/api/transactions", TransactionsController);
app.use("/api/budgets", BudgetsController);
app.use("/api/financialReports", FinancialReportsController);

app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: [
      "/api/auth",
      "/api/categories",
      "/api/transactions",
      "/api/budgets",
      "/api/financialReports",
    ],
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[Server Error]", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "An unexpected error occurred",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
