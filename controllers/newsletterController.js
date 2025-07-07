// controllers/newsletterController.js

export const subscribe = (req, res) => {
  console.log('Subscribe called at', new Date().toLocaleString());
  res.status(200).json({ message: 'Subscribed to newsletter successfully' });
};
