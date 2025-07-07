// controllers/blogController.js

export const createBlog = (req, res) => {
  console.log('Create Blog called at', new Date().toLocaleString());
  res.status(201).json({ message: 'Blog created successfully' });
};

export const getAllBlogs = (req, res) => {
  console.log('Get All Blogs called at', new Date().toLocaleString());
  res.status(200).json({ message: 'Fetched all blogs' });
};

export const getBlogById = (req, res) => {
  console.log('Get Blog By ID called at', new Date().toLocaleString());
  res.status(200).json({ message: `Fetched blog with ID: ${req.params.id}` });
};

export const updateBlog = (req, res) => {
  console.log('Update Blog called at', new Date().toLocaleString());
  res.status(200).json({ message: `Blog with ID ${req.params.id} updated` });
};

export const deleteBlog = (req, res) => {
  console.log('Delete Blog called at', new Date().toLocaleString());
  res.status(200).json({ message: `Blog with ID ${req.params.id} deleted` });
};

export const likeBlog = (req, res) => {
  console.log('Like Blog called at', new Date().toLocaleString());
  res.status(200).json({ message: `Blog with ID ${req.params.id} liked` });
};

export const bookmarkBlog = (req, res) => {
  console.log('Bookmark Blog called at', new Date().toLocaleString());
  res.status(200).json({ message: `Blog with ID ${req.params.id} bookmarked` });
};

export const getSavedBlogs = (req, res) => {
  console.log('Get Saved Blogs called at', new Date().toLocaleString());
  res.status(200).json({ message: 'Fetched saved blogs' });
};
