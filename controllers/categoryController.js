import blogModel from "../models/blogModel.js";
import CategoryModel from "../models/categoryModel.js";
import subcategoryModel from "../models/subcategoryModel.js";
import SubcategoryModel from "../models/subcategoryModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate input
    if (!name || !description) {
      const error = new ApiError(400, "Name and description are required");
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

    // Create new category
    const newCategory = new CategoryModel({
      name,
      description,
    });

    // Save the new category to the database
    await newCategory.save();

    // Return success response
    const response = new ApiResponse(
      201,
      "Category created successfully",
      newCategory
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle  errors
    const err = new ApiError(
      500,
      "Internal Server Error",
      [error.message],
      error.stack
    );
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, err.message));
  }
};

// Create Subcategory
export const createSubcategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

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
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle  errors
    const err = new ApiError(
      500,
      "Internal Server Error",
      [error.message],
      error.stack
    );
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, err.message));
  }
};

//update SubCategory
export const updateSubCategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params; // Extract category ID  params
    const { name, description } = req.body;
    // Check if the category exists
    const subcategory = await subcategoryModel.findById(subcategoryId);
    if (!subcategory) {
      const error = new ApiError(404, "SubCategory not found");
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, error.message));
    }

    // Update the category details
    subcategory.name = name || subcategory.name;
    subcategory.description = description || subcategory.description;

    // Save the updated
    await subcategory.save();

    // Return success response
    const response = new ApiResponse(
      200,
      "subCategory updated successfully",
      subcategory
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    const err = new ApiError(
      500,
      "Internal Server Error",
      [error.message],
      error.stack
    );
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, err.message));
  }
};

// Get All Categories
export const getAllCategories = async (req, res) => {
  try {
    // Fetch all categories from the database
    const categories = await CategoryModel.find();

    // Return success response with fetched categories
    const response = new ApiResponse(200, "Fetched all categories", categories);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle unexpected errors
    const err = new ApiError(
      500,
      "Internal Server Error",
      [error.message],
      error.stack
    );
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, err.message));
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params; // Extract category ID  params
    const { name, description } = req.body;
    // Check if the category exists
    const category = await CategoryModel.findById(id);
    if (!category) {
      const error = new ApiError(404, "Category not found");
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, error.message));
    }

    // Update the category details
    category.name = name || category.name;
    category.description = description || category.description;

    // Save the updated
    await category.save();

    // Return success response
    const response = new ApiResponse(
      200,
      "Category updated successfully",
      category
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    const err = new ApiError(
      500,
      "Internal Server Error",
      [error.message],
      error.stack
    );
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

    const blogExists = await blogModel().exists({ categoryId: id });
      if (blogExists) {
        return res
          .status(400)
          .json(new ApiResponse(400, `Category ${id} contains related blogs. Delete them first.`));
      }

      // Check for related subcategories
      const subcategoryExists = await SubcategoryModel().exists({ categoryId: id });
      if (subcategoryExists) {
        return res
          .status(400)
          .json(new ApiResponse(400, `Category ${id} contains related subcategories. Delete them first.`));
    }


    // Remove the category from the database
    await category.deleteOne();

    // Return success response after deletion
    const response = new ApiResponse(200, "Category deleted successfully");
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle unexpected errors
    const err = new ApiError(
      500,
      "Internal Server Error",
      [error.message],
      error.stack
    );
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
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle unexpected errors
    const err = new ApiError(
      500,
      "Internal Server Error",
      [error.message],
      error.stack
    );
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, err.message));
  }
};
