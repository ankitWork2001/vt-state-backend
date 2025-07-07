// controllers/commentController.js

export const addComment = (req, res) => {
  console.log('Add Comment called at', new Date().toLocaleString());
  res.status(201).json({ message: 'Comment added successfully' });
};

export const getBlogComments = (req, res) => {
  console.log('Get Blog Comments called at', new Date().toLocaleString());
  res.status(200).json({ message: 'Fetched comments for blog' });
};

export const deleteComment = (req, res) => {
  console.log('Delete Comment called at', new Date().toLocaleString());
  res.status(200).json({ message: 'Comment deleted successfully' });
};
