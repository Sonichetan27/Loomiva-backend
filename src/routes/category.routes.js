import express from "express";
import { createCategory, getAllCategories, updateCategory, deleteCategory } from "../controllers/category.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get All Categories
router.get("/", getAllCategories);

// Create Category
router.post("/", protect, createCategory);

// Update Category
router.put("/:id", protect, updateCategory);

// Delete Category
router.delete("/:id", protect, deleteCategory);

export default router;