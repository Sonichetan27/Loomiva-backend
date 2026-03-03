import express from "express";
import { createProduct } from "../controllers/product.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { getAllProducts } from "../controllers/product.controller.js";
import { getProductBySlug } from "../controllers/product.controller.js";
import { updateProduct } from "../controllers/product.controller.js";
import { deleteProduct } from "../controllers/product.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/", protect, upload.single("image"), createProduct);

router.get("/", getAllProducts);

router.get("/:slug", getProductBySlug);

router.put("/:id", protect, upload.single("image"), updateProduct);

router.delete("/:id", protect, deleteProduct);

export default router;