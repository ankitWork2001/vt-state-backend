import mongoose, { Schema } from 'mongoose';

const SubcategoryModel = () => {
  const subcategorySchema = new Schema({
    name: { type: String, required: true, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  }, {
    timestamps: true,
  });

  console.log('Subcategory model created ');
  return mongoose.model('Subcategory', subcategorySchema);
};

export default SubcategoryModel();