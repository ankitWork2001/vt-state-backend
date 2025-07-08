import Newsletter from '../models/newsletterModel.js';
import User from '../models/userModel.js';

export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingSubscription = await Newsletter.findOne({ email }).lean();
    if (existingSubscription) {
      return res
        .status(200)
        .json({ message: `Email ${email} is already subscribed` });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(400).json({ message: 'You are not registered' });
    }

    const newSubscriber = await Newsletter.create({ email });

    if (!newSubscriber) {
      return res.status(500).json({ message: 'Something went wrong' });
    }

    console.log('Subscribe called at', new Date().toLocaleString());

    return res.status(200).json({
      newSubscriber,
      message: 'Subscribed to newsletter successfully',
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
