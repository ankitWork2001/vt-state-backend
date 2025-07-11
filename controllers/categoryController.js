import blogModel from "../models/blogModel.js";
import CategoryModel from "../models/categoryModel.js";
import SubcategoryModel from "../models/subcategoryModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import cloudinaryUtils from "../config/cloudinary.js";
import multer from 'multer';

// Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const categoryImage = req.file;

    // Log request for debugging
    console.log('Create Category request:', { name, description, categoryImage: categoryImage ? 'Present' : 'Missing' });

    // Validate input
    if (!name || !description || !categoryImage) {
      const error = new ApiError(400, "Name, description, and category image are required");
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, error.message));
    }

    // Check if category already exists
    const existingCategory = await CategoryModel.findOne({ name });
    if (existingCategory) {
      const error = new ApiError(400, "Category already exists");
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, error.message));
    }

    // Upload category image to Cloudinary
    const categoryImageUrl = await cloudinaryUtils.uploadImage(categoryImage.buffer, 'category_images');

    // Create new category
    const newCategory = new CategoryModel({
      name: name.trim(),
      description: description.trim(),
      categoryImage: categoryImageUrl
    });

    // Save the new category to the database
    await newCategory.save();

    // Return success response
    const response = new ApiResponse(
      201,
      "Category created successfully",
      newCategory
    );
    console.log('Create Category called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle Multer errors
    if (error instanceof multer.MulterError && error.code === 'LIMIT_UNEXPECTED_FILE') {
      const err = new ApiError(400, "Invalid form-data field name. Use 'categoryImage' for the file.");
      return res
        .status(err.statusCode)
        .json(new ApiResponse(err.statusCode, err.message));
    }

    // Handle other errors
    const err = new ApiError(
      500,
      "Internal Server Error",
      [error.message],
      error.stack
    );
    console.error('Create Category error:', error);
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, err.message));
  }
};

// Create Subcategory
export const createSubcategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { categoryId } = req.params;

    // Validate input
    if (!name || !categoryId) {
      const error = new ApiError(400, "Name and category ID are required");
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, error.message));
    }

    // Check if the provided category exists
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      const error = new ApiError(404, "Category not found");
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, error.message));
    }

    // Create new subcategory
    const newSubcategory = new SubcategoryModel({
      name,
      categoryId,
    });

    // Save the new subcategory to the database
    await newSubcategory.save();

    // Return success response
    const response = new ApiResponse(
      201,
      "Subcategory created successfully",
      newSubcategory
    );
    console.log('Create Subcategory called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle errors
    const err = new ApiError(
      500,
      "Internal Server Error",
      [error.message],
      error.stack
    );
    console.error('Create Subcategory error:', error);
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, err.message));
  }
};

// Get All Categories with Subcategories 
export const getAllCategories = async (req, res) => {
  try {
    // Fetch all categories
    const categories = await CategoryModel.find().lean(); // use `.lean()` for plain JS objects

    // Fetch subcategories and group them by categoryId
    const subcategories = await SubcategoryModel.find({}, "name categoryId").lean();

    const groupedSubcategories = subcategories.reduce((acc, subcat) => {
      const key = subcat.categoryId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push({ id: subcat._id, name: subcat.name });
      return acc;
    }, {});

    // Map categories to include only required fields and attach subcategories
    const formattedCategories = categories.map((cat) => ({
      id: cat._id,
      name: cat.name,
      categoryImage: cat.categoryImage,
      subcategories: groupedSubcategories[cat._id.toString()] || [],
    }));

    return res
      .status(200)
      .json(new ApiResponse(200, "Fetched all categories", formattedCategories));
  } catch (error) {
    const err = new ApiError(
      500,
      "Internal Server Error",
      [error.message],
      error.stack
    );
    console.error('Get All Categories error:', error);
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, err.message));
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const categoryImage = req.file;

    // Log request for debugging
    console.log('Update Category request:', { name, description, categoryImage: categoryImage ? 'Present' : 'Missing' });

    // Check if the category exists
    const category = await CategoryModel.findById(id);
    if (!category) {
      const error = new ApiError(404, "Category not found");
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, error.message));
    }

    // Prepare update object
    const updateData = {};
    if (name) {
      // Check if new name already exists (excluding current category)
      const existingCategory = await CategoryModel.findOne({ name, _id: { $ne: id } });
      if (existingCategory) {
        const error = new ApiError(400, "Category name already exists");
        return res
          .status(error.statusCode)
          .json(new ApiResponse(error.statusCode, error.message));
      }
      updateData.name = name.trim();
    }
    if (description) updateData.description = description.trim();
    if (categoryImage) {
      const categoryImageUrl = await cloudinaryUtils.uploadImage(categoryImage.buffer, 'category_images');
      updateData.categoryImage = categoryImageUrl;
    }

    // Ensure at least one field is provided for update
    if (Object.keys(updateData).length === 0) {
      const error = new ApiError(400, "At least one field (name, description, or category image) must be provided");
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, error.message));
    }

    // Update category
    Object.assign(category, updateData);
    await category.save();

    // Return success response
    const response = new ApiResponse(
      200,
      "Category updated successfully",
      category
    );
    console.log('Update Category called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle Multer errors
    if (error instanceof multer.MulterError && error.code === 'LIMIT_UNEXPECTED_FILE') {
      const err = new ApiError(400, "Invalid form-data field name. Use 'categoryImage' for the file.");
      return res
        .status(err.statusCode)
        .json(new ApiResponse(err.statusCode, err.message));
    }

    // Handle other errors
    const err = new ApiError(
      500,
      "Internal Server Error",
      [error.message],
      error.stack
    );
    console.error('Update Category error:', error);
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, err.message));
  }
};

// Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await CategoryModel.findById(id);
    if (!category) {
      const error = new ApiError(404, "Category not found");
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, error.message));
    }

    const blogExists = await blogModel.exists({ categoryId: id });
    if (blogExists) {
      return res
        .status(400)
        .json(new ApiResponse(400, `Category ${id} contains related blogs. Delete them first.`));
    }

    // Check for related subcategories
    const subcategoryExists = await SubcategoryModel.exists({ categoryId: id });
    if (subcategoryExists) {
      return res
        .status(400)
        .json(new ApiResponse(400, `Category ${id} contains related subcategories. Delete them first.`));
    }

    // Remove the category from the database
    await category.deleteOne();

    // Return success response after deletion
    const response = new ApiResponse(200, "Category deleted successfully");
    console.log('Delete Category called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle unexpected errors
    const err = new ApiError(
      500,
      "Internal Server Error",
      [error.message],
      error.stack
    );
    console.error('Delete Category error:', error);
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, err.message));
  }
};

// Update Subcategory
export const updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json(
        new ApiResponse(400, "Subcategory name is required")
      );
    }

    const subcategory = await SubcategoryModel.findById(id);

    if (!subcategory) {
      return res.status(404).json(
        new ApiResponse(404, "Subcategory not found")
      );
    }

    subcategory.name = name;
    await subcategory.save();

    return res.status(200).json(
      new ApiResponse(200, "Subcategory updated successfully", subcategory)
    );
  } catch (error) {
    const err = new ApiError(
      500,
      "Internal Server Error",
      [error.message],
      error.stack
    );
    console.error('Update Subcategory error:', error);
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, err.message));
  }
};

// Delete Subcategory
export const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if subcategory exists
    const subcategory = await SubcategoryModel.findById(id);
    if (!subcategory) {
      const error = new ApiError(404, "Subcategory not found");
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, error.message));
    }

    // Remove the subcategory from the database
    await subcategory.deleteOne();

    // Return success response after deletion
    const response = new ApiResponse(200, "Subcategory deleted successfully");
    console.log('Delete Subcategory called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle unexpected errors
    const err = new ApiError(
      500,
      "Internal Server Error",
      [error.message],
      error.stack
    );
    console.error('Delete Subcategory error:', error);
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, err.message));
  }
};