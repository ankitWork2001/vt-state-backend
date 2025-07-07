// controllers/contactController.js

export const submitContact = (req, res) => {
  console.log('Submit Contact called at', new Date().toLocaleString());
  res.status(200).json({ message: 'Contact form submitted successfully' });
};
