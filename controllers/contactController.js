import User from '../models/userModel.js';
import Contact from '../models/contactModel.js';

export const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const findUser = await User.findOne({ email }).lean();

    if (!findUser) {
      return res.status(400).json({ message: 'You are not registered' });
    }

    const newContact = await Contact.create({ name, email, message });

    if (!newContact) {
      return res.status(500).json({ message: 'Something went wrong' });
    }

    console.log('Submit Contact called at', new Date().toLocaleString());

    return res.status(200).json({
      newContact,
      message: 'Contact form submitted successfully',
    });
  } catch (error) {
    console.error('submitContact error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
