import mongoose, { Schema } from 'mongoose';

const ContactModel = () => {
  const contactSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
  }, {
    timestamps: true,
  });

  console.log('Contact model created ');
  return mongoose.model('Contact', contactSchema);
};

export default ContactModel();