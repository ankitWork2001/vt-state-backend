import mongoose, { Schema } from 'mongoose';

const CategoryModel = () => {
  const categorySchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    categoryImage: { type: String, trim: true, default: 'https://www.datang-dsspower.co.id/~img/istockphoto_1357365823_612x612-06298-3800_209-twebp80.webp' },
    description: { type: String, trim: true },
    categoryImage: { type: String, trim: true ,default: '' },
  }, {
    timestamps: true,
  });

  console.log('Category model created ');
  return mongoose.model('Category', categorySchema);
};

export default CategoryModel();