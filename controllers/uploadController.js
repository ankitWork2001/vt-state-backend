// controllers/uploadController.js

export const uploadImage = (req, res) => {
  console.log('Upload Image called at', new Date().toLocaleString());
  res.status(201).json({ message: 'Image uploaded successfully' });
};
