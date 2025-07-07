// controllers/categoryController.js

export const createCategory = (req, res) => {
  console.log('Create Category called at', new Date().toLocaleString());
  res.status(201).json({ message: 'Category created successfully' });
};

export const createSubcategory = (req, res) => {
  console.log('Create Subcategory called at', new Date().toLocaleString());
  res.status(201).json({ message: 'Subcategory created successfully' });
};

export const getAllCategories = (req, res) => {
  console.log('Get All Categories called at', new Date().toLocaleString());
  res.status(200).json({ message: 'Fetched all categories' });
};

export const updateCategory = (req, res) => {
  console.log('Update Category called at', new Date().toLocaleString());
  res.status(200).json({ message: 'Category updated successfully' });
};

export const deleteCategory = (req, res) => {
  console.log('Delete Category called at', new Date().toLocaleString());
  res.status(200).json({ message: 'Category deleted successfully' });
};

export const deleteSubcategory = (req, res) => {
  console.log('Delete Subcategory called at', new Date().toLocaleString());
  res.status(200).json({ message: 'Subcategory deleted successfully' });
};
