import Blog from '../models/blogModel.js';
import User from '../models/userModel.js';
import Category from '../models/categoryModel.js';
import Subcategory from '../models/subcategoryModel.js';
import cloudinaryUtils from '../config/cloudinary.js';

export const createBlog = async (req, res) => {
  try {
    const { title, content, tags, language, categoryId, subcategoryId } = req.body;
    const thumbnail = req.file;

    // Log request body for debugging
    console.log('Create Blog request body:', { title, content, tags, language, categoryId, subcategoryId });
    console.log('Thumbnail file:', thumbnail ? 'Present' : 'Missing');

    // Validate required fields
    if (!title || !content || !language || !categoryId) {
      return res.status(400).json({ message: 'All required fields (title, content, language, categoryId) must be provided' });
    }
    if (!thumbnail) {
      return res.status(400).json({ message: 'Thumbnail file is required' });
    }

    // Validate language
    if (!['English', 'Hindi'].includes(language)) {
      return res.status(400).json({ message: 'Language must be English or Hindi' });
    }

    // Validate categoryId
    if(categoryId){
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ message: 'Invalid categoryId: Category not found' });
      }
    }

    // Validate subcategoryId if provided
    if (subcategoryId) {
      const subcategory = await Subcategory.findById(subcategoryId);
      if (!subcategory) {
        return res.status(400).json({ message: 'Invalid subcategoryId: Subcategory not found' });
      }
    }

    // Upload thumbnail using cloudinary.js
    const thumbnailUrl = await cloudinaryUtils.uploadImage(thumbnail.buffer, 'blog_thumbnails');

    // Create blog
    const blog = new Blog({
      title: title.trim(),
      content: content.trim(),
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      language,
      categoryId,
      subcategoryId: subcategoryId || null,
      thumbnail: thumbnailUrl,
      author: req.user.userId
    });

    await blog.save();
    console.log('Create Blog called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(201).json({ message: 'Blog created successfully', blogId: blog._id });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Server error creating blog' });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { title, content, tags, language, categoryId, subcategoryId } = req.body;
    const thumbnail = req.file;

    // Log request body for debugging
    console.log('Update Blog request body:', { title, content, tags, language, categoryId, subcategoryId });
    console.log('Thumbnail file:', thumbnail ? 'Present' : 'Missing');

    // Fetch the existing blog to validate categoryId
    const blogId = req.params.id;
    const existingBlog = await Blog.findById(blogId);
    if (!existingBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (content) updateData.content = content.trim();
    if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());
    if (language) {
      if (!['English', 'Hindi'].includes(language)) {
        return res.status(400).json({ message: 'Language must be English or Hindi' });
      }
      updateData.language = language;
    }

    // Validate categoryId (use provided or existing)
    const finalCategoryId = categoryId || existingBlog.categoryId;
    const category = await Category.findById(finalCategoryId);
    if (!category) {
      return res.status(400).json({ message: 'Invalid categoryId: Category not found' });
    }
    updateData.categoryId = finalCategoryId;

    // Validate subcategoryId if provided  
    updateData.subcategoryId = null
    if (subcategoryId !== null) {
        const subcategory = await Subcategory.findById(subcategoryId);
        if (!subcategory) {
          return res.status(400).json({ message: 'Invalid subcategoryId: Subcategory not found' });
        }
        updateData.subcategoryId = subcategoryId;
    }

    // Update thumbnail if provided
    if (thumbnail) {
      const thumbnailUrl = await cloudinaryUtils.uploadImage(thumbnail.buffer, 'blog_thumbnails');
      updateData.thumbnail = thumbnailUrl;
    }

    // Ensure at least one field is provided for update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate('categoryId', 'name').populate('subcategoryId', 'name').populate('author', 'username');

    console.log('Update Blog called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(200).json({ message: 'Blog updated successfully', blog });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Server error updating blog' });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const { category, subcategory, page = 1, limit = 10 } = req.query;
    const query = {};

    if (category) query.categoryId = category;
    if (subcategory) query.subcategoryId = subcategory;

    const blogs = await Blog.find(query)
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .populate('author', 'username')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('title content thumbnail language createdAt');

    // Trim content to 400 characters
    const trimmedBlogs = blogs.map(blog => ({
      ...blog._doc,
      content: blog.content.length > 400 ? blog.content.substring(0, 400) : blog.content
    }));

    const total = await Blog.countDocuments(query);

    console.log('Get All Blogs called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(200).json({
      message: 'Fetched all blogs',
      blogs: trimmedBlogs,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get all blogs error:', error);
    res.status(500).json({ message: 'Server error fetching blogs' });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('categoryId', 'name description')
      .populate('subcategoryId', 'name')
      .populate('author', 'username profilePic')
      .populate('likes', 'username')
      .populate('bookmarks', 'username');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    console.log('Get Blog By ID called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(200).json({ message: 'Fetched blog', blog });
  } catch (error) {
    console.error('Get blog by ID error:', error);
    res.status(500).json({ message: 'Server error fetching blog' });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Remove blog from users' likedBlogs and savedBlogs
    await User.updateMany(
      { $or: [{ likedBlogs: blog._id }, { savedBlogs: blog._id }] },
      { $pull: { likedBlogs: blog._id, savedBlogs: blog._id } }
    );

    console.log('Delete Blog called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Server error deleting blog' });
  }
};

export const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (blog.likes.includes(userId)) {
      // Unlike the blog
      blog.likes.pull(userId);
      user.likedBlogs.pull(blog._id);
      await Promise.all([blog.save(), user.save()]);
      console.log('Like Blog called at (unlike)', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      return res.status(200).json({ message: 'Blog unliked successfully' });
    }

    // Like the blog
    blog.likes.push(userId);
    user.likedBlogs.push(blog._id);
    await Promise.all([blog.save(), user.save()]);

    console.log('Like Blog called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(200).json({ message: 'Blog liked successfully' });
  } catch (error) {
    console.error('Like blog error:', error);
    res.status(500).json({ message: 'Server error liking blog' });
  }
};

export const bookmarkBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (blog.bookmarks.includes(userId)) {
      // Unbookmark the blog
      blog.bookmarks.pull(userId);
      user.savedBlogs.pull(blog._id);
      await Promise.all([blog.save(), user.save()]);
      console.log('Bookmark Blog called at (unbookmark)', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      return res.status(200).json({ message: 'Blog unbookmarked successfully' });
    }

    // Bookmark the blog
    blog.bookmarks.push(userId);
    user.savedBlogs.push(blog._id);
    await Promise.all([blog.save(), user.save()]);

    console.log('Bookmark Blog called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.Status(200).json({ message: 'Blog bookmarked successfully' });
  } catch (error) {
    console.error('Bookmark blog error:', error);
    res.status(500).json({ message: 'Server error bookmarking blog' });
  }
};

export const getSavedBlogs = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'savedBlogs',
        select: 'title thumbnail language createdAt',
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'subcategoryId', select: 'name' },
          { path: 'author', select: 'username' }
        ]
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Get Saved Blogs called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(200).json({ message: 'Fetched saved blogs', blogs: user.savedBlogs });
  } catch (error) {
    console.error('Get saved blogs error:', error);
    res.status(500).json({ message: 'Server error fetching saved blogs' });
  }
};