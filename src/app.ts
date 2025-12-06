import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import budgetRoutes from "./routes/budgetRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/categories", categoryRoutes);
app.use("/budgets", budgetRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/test", (req, res) => {
  const result = req.body;
  const { email } = result;
  let name = result.name;
  if (!name) {
    name = email.split("@")[0];
  }
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = regexEmail.test(email);
  res.status(200).json({ result });
});

// Error handler middleware (must be last)
app.use(errorHandler);

export default app;
