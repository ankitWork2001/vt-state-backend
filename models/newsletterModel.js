import mongoose, { Schema } from 'mongoose';

const NewsletterModel = () => {
  const newsletterSchema = new Schema({
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  }, {
    timestamps: true,
  });

  console.log('Newsletter model created');
  return mongoose.model('Newsletter', newsletterSchema);
};

export default NewsletterModel();