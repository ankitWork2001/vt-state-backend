import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config(); 
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (fileBuffer, folder = 'blogs') => {
  try {
    // Convert buffer to a readable stream
    const stream = Readable.from(fileBuffer);
    
    // Return a promise to handle the stream upload
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          format: 'jpg',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(new Error('Failed to upload image'));
          }
          console.log('Image uploaded to Cloudinary successfully:', result.secure_url);
          resolve(result.secure_url);
        }
      );

      // Pipe the buffer stream to Cloudinary
      stream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
};

export default { cloudinary, uploadImage };