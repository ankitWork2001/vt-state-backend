import mongoose, { Schema } from 'mongoose';

const CategoryModel = () => {
  const categorySchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
  }, {
    timestamps: true,
  });

  console.log('Category model created ');
  return mongoose.model('Category', categorySchema);
};

export default CategoryModel();