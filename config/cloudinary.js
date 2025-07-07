import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config(); 
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (fileBuffer, folder = 'blogs') => {
  try {
    const result = await cloudinary.v2.uploader.upload(fileBuffer, {
      folder,
      resource_type: 'image',
      format: 'jpg', 
    });
    console.log('Image uploaded to Cloudinary successfully:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
};

export default { cloudinary, uploadImage };