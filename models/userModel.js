import mongoose, { Schema } from 'mongoose';

const UserModel = () => {
  const userSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    profilePic: { type: String, default:'https://tse4.mm.bing.net/th/id/OIP.Me_AqujgECGQ-2cLUY2QhgHaHa?w=1920&h=1920&rs=1&pid=ImgDetMain&o=7&rm=3'},
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    isAdmin: { type: Boolean, default: false },
    savedBlogs: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
    likedBlogs: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
  }, {
    timestamps: true,
  });

  console.log('User model created');
  return mongoose.model('User', userSchema);
};

export default UserModel();