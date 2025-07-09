import Comment from '../models/commentModel.js';
import Blog from '../models/blogModel.js';

export const addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const { blogId } = req.params;
    const userId = req.user.userId;

    // Validate required fields
    if (!comment) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    // Verify blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Create comment
    const newComment = new Comment({
      comment: comment.trim(),
      blogId,
      userId,
    });

    await newComment.save();
    console.log('Add Comment called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(201).json({ message: 'Comment added successfully', commentId: newComment._id });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
};

export const getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Verify blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Fetch comments with pagination
    const comments = await Comment.find({ blogId })
      .populate('userId', 'username')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('comment createdAt');

    const total = await Comment.countDocuments({ blogId });

    console.log('Get Blog Comments called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(200).json({
      message: 'Fetched comments for blog',
      comments,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get blog comments error:', error);
    res.status(500).json({ message: 'Server error fetching comments' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.isAdmin;

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is comment owner or admin
    if (comment.userId.toString() !== userId && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }

    // Delete comment
    await Comment.findByIdAndDelete(commentId);

    console.log('Delete Comment called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
};