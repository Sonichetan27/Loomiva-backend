import express from "express";
import cors from "cors";
import categoryRoutes from "./routes/category.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/categories", categoryRoutes);

app.get("/", (req, res) => {
  res.send("Loomiva API Running");
});

app.use("/api/admin", adminRoutes);

app.use("/api/products", productRoutes);

app.use("/api/auth", authRoutes);

export default app;
