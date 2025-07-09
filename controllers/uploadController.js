import cloudinary from 'cloudinary';
import { Readable } from 'stream';

export const uploadImage = async (req, res) => {
  try {
    const file = req.file;

    // Validate file presence
    if (!file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    // Convert buffer to a readable stream
    const stream = Readable.from(file.buffer);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          folder: 'uploads',
          resource_type: 'image',
          format: 'jpg',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(new Error('Failed to upload image'));
          }
          console.log('Image uploaded to Cloudinary successfully:', result.secure_url);
          resolve(result);
        }
      );

      stream.pipe(uploadStream);
    });

    console.log('Upload Image called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(201).json({ message: 'Image uploaded successfully', url: result.secure_url });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: 'Server error uploading image' });
  }
};