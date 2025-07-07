import mongoose, { Schema } from 'mongoose';

const CommentModel = () => {
  const commentSchema = new Schema({
    comment: { type: String, required: true, trim: true },
    blogId: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  }, {
    timestamps: true,
  });

  console.log('Comment model created');
  return mongoose.model('Comment', commentSchema);
};

export default CommentModel();