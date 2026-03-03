import Product from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { uploadFile } from "../utils/cloudinary.js";
import cloudinary from "../utils/cloudinary.js";

// Create Product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price and category are required",
      });
    }

    // Image check
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required",
      });
    }

    // Upload image to Cloudinary
    const uploadedImage = await uploadFile(req.file.path);
    if (!uploadedImage) {
      return res.status(400).json({
        success: false,
        message: "Image upload failed",
      });
    }


    // check category exist karti hai ya nahi
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product already exists",
      });
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      category,
      stock,
      image: uploadedImage
    });

    res.status(201).json({
      success: true,
      data: product,
    });

  } catch (error) {
    console.log("CREATE PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 🔥 Filtering Object
    let filter = {};

    // Category filter
    if (req.query.category && req.query.category !== "all") {
      const categoryDoc = await Category.findOne({
        slug: req.query.category,
      });

      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        // agar category exist nahi karti to empty result
        return res.status(200).json({
          success: true,
          count: 0,
          total: 0,
          page: 1,
          totalPages: 0,
          data: [],
        });
      }
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = Number(req.query.maxPrice);
      }
    }

    // Stock filter
    if (req.query.inStock === "true") {
      filter.stock = { $gt: 0 };
    }

    // 🔥 Search
    if (req.query.keyword) {
      filter.$or = [
        { name: { $regex: req.query.keyword, $options: "i" } },
        { description: { $regex: req.query.keyword, $options: "i" } },
      ];
    }


    // 🔥 Count after filter
    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      total: totalProducts,
      page,
      totalPages: Math.ceil(totalProducts / limit),
      data: products,
    });

  } catch (error) {
    console.log("GET PRODUCTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Get Product by Slug
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug })
      .populate("category", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });

  } catch (error) {
    console.log("GET PRODUCT BY SLUG ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const { name, description, price, category, stock, isActive } = req.body;

    // Update fields if provided
    if (name) {
      product.name = name;
      product.slug = name.toLowerCase().replace(/\s+/g, "-");
    }

    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (isActive !== undefined) product.isActive = isActive;

    // Image update
    // Agar new image aayi hai
    if (req.file) {
      // Old image delete
      if (product.image?.public_id) {
        await cloudinary.uploader.destroy(product.image.public_id);
      }

      // Upload new image
      const uploadedImage = await uploadFile(req.file.path);

      if (!uploadedImage) {
        return res.status(400).json({
          success: false,
          message: "Image upload failed",
        });
      }

      product.image = uploadedImage;
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });

  } catch (error) {
    console.log("UPDATE PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 🔥 Cloudinary image delete
    if (product.image?.public_id) {
      await cloudinary.uploader.destroy(product.image.public_id);
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {
    console.log("DELETE PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
