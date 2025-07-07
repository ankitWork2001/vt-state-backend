import mongoose, { Schema } from 'mongoose';

const BlogModel = () => {
  const blogSchema = new Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    language: { type: String, required: true, enum: ['English', 'Hindi'] },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategoryId: { type: Schema.Types.ObjectId, ref: 'Subcategory' },
    thumbnail: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  }, {
    timestamps: true,
  });

  console.log('Blog model created ');
  return mongoose.model('Blog', blogSchema);
};

export default BlogModel();