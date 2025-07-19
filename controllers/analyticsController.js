import AnalyticsModel from "../models/analyticsModel.js";
import BlogModel from '../models/blogModel.js';
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken'; 
import Newsletter from '../models/newsletterModel.js';



// Start Visit
export const startVisit = async (req, res) => {
  try {
    const { sessionId, page, articleId, userId, deviceInfo } = req.body;

    if (!sessionId || !page || !articleId || !deviceInfo) {
      const errors = [
        !sessionId && "sessionId is required",
        !page && "page is required",
        !articleId && "articleId is required",
        !deviceInfo && "deviceInfo is required",
      ].filter(Boolean);
      throw new ApiError(400, "Missing required fields", errors);
    }

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      throw new ApiError(400, "Invalid article ID", ["articleId must be a valid ObjectId"]);
    }

    if (!page.startsWith('/')) {
      throw new ApiError(400, "Invalid page format", ["page must be a valid URL path starting with '/'"]);
    }

    const existingVisit = await AnalyticsModel.findOne({ 
      sessionId, 
      blogId: articleId, 
      exitTime: null 
    });
    if (existingVisit) {
      const now = new Date();
      await AnalyticsModel.findOneAndUpdate(
        { _id: existingVisit._id },
        { 
          exitTime: now,
          duration: (now - existingVisit.visitTime) / 1000
        },
        { new: true }
      );
      console.log(`Ended existing visit: sessionId=${sessionId}, articleId=${articleId}`);
    }

    let validatedUserId = null;
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.warn(`Invalid userId format: ${userId}`);
      } else {
        const UserModel = mongoose.models.User;
        if (!UserModel) {
          throw new ApiError(500, "User model not found", ["User model is not defined"]);
        }
        const userExists = await UserModel.findById(userId);
        if (userExists) {
          validatedUserId = userId;
        } else {
          console.warn(`User not found for userId: ${userId}`);
        }
      }
    }

    const visit = await AnalyticsModel.create({
      sessionId,
      page,
      blogId: articleId,
      userId: validatedUserId,
      visitTime: new Date(),
      deviceInfo,
    });

    console.log(`Visit started: sessionId=${sessionId}, articleId=${articleId}, page=${page}, userId=${validatedUserId || 'null'}`);

    return res.status(201).json(
      new ApiResponse(201, "Visit started successfully", {
        id: visit._id,
      })
    );
  } catch (error) {
    console.error("Start Visit Error:", { 
      message: error.message, 
      stack: error.stack, 
      body: req.body 
    });
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    return res.status(statusCode).json(
      new ApiError(statusCode, message, error.errors || [error.message])
    );
  }
};

// End Visit
export const endVisit = async (req, res) => {
  try {
    const { sessionId, articleId, duration } = req.body;

    if (!sessionId || !articleId) {
      const errors = [
        !sessionId && "sessionId is required",
        !articleId && "articleId is required",
      ].filter(Boolean);
      throw new ApiError(400, "Missing required fields", errors);
    }

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      throw new ApiError(400, "Invalid article ID", ["articleId must be a valid ObjectId"]);
    }

    const visit = await AnalyticsModel.findOne({ 
      sessionId, 
      blogId: articleId, 
      exitTime: null 
    });

    if (!visit) {
      throw new ApiError(404, "Active visit not found", [
        `No active visit found for sessionId=${sessionId} and articleId=${articleId}`
      ]);
    }

    const now = new Date();
    const finalDuration = duration !== undefined ? duration : (now - visit.visitTime) / 1000;

    const updated = await AnalyticsModel.findOneAndUpdate(
      { sessionId, blogId: articleId, exitTime: null },
      { 
        exitTime: now,
        duration: finalDuration
      },
      { new: true }
    );

    console.log(`Visit ended: sessionId=${sessionId}, articleId=${articleId}, duration=${updated.duration}s`);

    return res
      .status(200)
      .json(new ApiResponse(200, "Visit ended successfully", {
        id: updated._id,
        sessionId: updated.sessionId,
        articleId: updated.blogId,
        exitTime: updated.exitTime,
        duration: updated.duration
      }));
  } catch (error) {
    console.error("End Visit Error:", { 
      message: error.message, 
      stack: error.stack, 
      body: req.body 
    });
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    return res.status(statusCode).json(
      new ApiError(statusCode, message, error.errors || [error.message])
    );
  }
};

// Get Blogs
export const getBlogs = async (req, res) => {
  try {
    // Verify admin access
    const userId = req.user.userId; // Get userId from JWT

    // Parse query parameters
    const { category, subcategory, page = 1, limit = 3 } = req.query;

    // Validate page and limit
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      throw new ApiError(400, "Invalid page number", ["Page must be a positive integer"]);
    }
    if (isNaN(limitNum) || limitNum < 1) {
      throw new ApiError(400, "Invalid limit", ["Limit must be a positive integer"]);
    }

    // Build query
    const query = { author: userId,isLive:true}; // Filter by author matching userId
    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        throw new ApiError(400, "Invalid category ID", ["category must be a valid ObjectId"]);
      }
      query.categoryId = category;
    }
    if (subcategory) {
      if (!mongoose.Types.ObjectId.isValid(subcategory)) {
        throw new ApiError(400, "Invalid subcategory ID", ["subcategory must be a valid ObjectId"]);
      }
      query.subcategoryId = subcategory;
    }

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;

    // Fetch blogs with pagination and sorting
    const blogs = await BlogModel.find(query)
      .populate('categoryId', 'name') // Populate category name
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Fetch total count for pagination
    const totalBlogs = await BlogModel.countDocuments(query);

    // Aggregate views for each blog
    const blogIds = blogs.map(blog => blog._id);
    const viewsData = await AnalyticsModel.aggregate([
      { $match: { 
        blogId: { $in: blogIds.map(id => new mongoose.Types.ObjectId(id)) },
        duration: { $gte: 20 } 
      } },
      { $group: { _id: "$blogId", views: { $count: {} } } }
    ]);

    // Map views to blogs
    const viewsMap = viewsData.reduce((map, data) => {
      map[data._id.toString()] = data.views;
      return map;
    }, {});

    // Format response
    const result = blogs.map(blog => ({
      id: blog._id.toString(),
      title: blog.title,
      category: blog.categoryId?.name || 'Uncategorized',
      Date: blog.createdAt,
      views: viewsMap[blog._id.toString()] || 0
    }));



    return res.status(200).json(
      new ApiResponse(200, "Blogs fetched successfully", {
        blogs: result,
        pagination: {
          total: totalBlogs,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalBlogs / limitNum)
        }
      })
    );
  } catch (error) {
    console.error("Get Blogs Error:", { 
      message: error.message, 
      stack: error.stack, 
      query: req.query 
    });
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    return res.status(statusCode).json(
      new ApiError(statusCode, message, error.errors || [error.message])
    );
  }
};

// Website Overview
export const getWebsiteOverview = async (req, res) => {
  const userId = req.user.userId;
  try {
    const BlogModel = mongoose.models.Blog;
    const Newsletter = mongoose.models.Newsletter;
    if (!BlogModel) {
      throw new ApiError(500, "Blog model not found", ["Blog model is not defined"]);
    }
    if (!Newsletter) {
      throw new ApiError(500, "Newsletters model not found", ["Newsletters model is not defined"]);
    }

    const [analytics] = await AnalyticsModel.aggregate([
      {
        $facet: {
          views: [
            { $match: { duration: { $gte: 20 } } },
            { $count: "count" }
          ],
          activeUsers: [
            { $match: { userId: { $ne: null } } },
            { $group: { _id: "$userId" } },
            { $count: "count" }
          ],
          totalTimeSpent: [
            { $match: { duration: { $ne: null } } },
            { $group: { _id: null, total: { $sum: "$duration" } } }
          ],
          totalDocuments: [{ $count: "count" }]
        }
      },
      {
        $project: {
          views: { $arrayElemAt: ["$views.count", 0] },
          activeUsers: { $arrayElemAt: ["$activeUsers.count", 0] },
          totalTimeSpent: { $arrayElemAt: ["$totalTimeSpent.total", 0] },
          totalDocuments: { $arrayElemAt: ["$totalDocuments.count", 0] }
        }
      }
    ]);

    const totalPosts = await BlogModel.countDocuments({ author: userId,isLive: true });
    const newsletters = await Newsletter.countDocuments();

    const totalTimeSpent = analytics?.totalTimeSpent || 0;
    const totalDocuments = analytics?.totalDocuments || 0;
    const avgReadTime = totalDocuments > 0 ? (totalTimeSpent / totalDocuments / 60) : 0;

    const result = {
      views: analytics?.views || 0,
      activeUsers: analytics?.activeUsers || 0,
      avgReadTime: parseFloat(avgReadTime.toFixed(2)),
      totalPosts,
      newsletters
    };

    console.log("Website overview:", result);

    return res.status(200).json(
      new ApiResponse(200, "Website overview", result)
    );
  } catch (error) {
    console.error("Website Overview Error:", { message: error.message, stack: error.stack });
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    return res.status(statusCode).json(
      new ApiError(statusCode, message, error.errors || [error.message])
    );
  }
};

// Article Analytics
export const getArticleAnalytics = async (req, res) => {
  try {
  
    const { id } = req.params;

    if (!id) {
      throw new ApiError(400, "Missing article ID", ["articleId param is required"]);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid article ID", ["articleId must be a valid ObjectId"]);
    }

    const [analytics] = await AnalyticsModel.aggregate([
      { $match: { blogId: new mongoose.Types.ObjectId(id) } },
      {
        $facet: {
          views: [
            { $match: { duration: { $gte: 20 } } },
            { $count: "count" }
          ],
          activeUsers: [
            { $match: { userId: { $ne: null } } },
            { $group: { _id: "$userId" } },
            { $count: "count" }
          ],
          avgReadTime: [
            { $match: { duration: { $ne: null } } },
            { $group: { _id: null, avg: { $avg: "$duration" } } }
          ]
        }
      },
      {
        $project: {
          views: { $arrayElemAt: ["$views.count", 0] },
          activeUsers: { $arrayElemAt: ["$activeUsers.count", 0] },
          avgReadTime: { $arrayElemAt: ["$avgReadTime.avg", 0] }
        }
      }
    ]);

    const result = {
      articleId: id,
      views: analytics?.views || 0,
      activeUsers: analytics?.activeUsers || 0,
      avgReadTime: analytics?.avgReadTime ? parseFloat((analytics.avgReadTime / 60).toFixed(2)) : 0
    };

    console.log(`Article analytics: articleId=${id}`, result);

    return res.status(200).json(
      new ApiResponse(200, "Article analytics", result)
    );
  } catch (error) {
    console.error("Article Analytics Error:", { message: error.message, stack: error.stack });
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    return res.status(statusCode).json(
      new ApiError(statusCode, message, error.errors || [error.message])
    );
  }
};

// Page Analytics
export const getPageAnalytics = async (req, res) => {
  try {
    

    const { page } = req.query;

    if (!page) {
      throw new ApiError(400, "Missing page parameter", ["page query parameter is required"]);
    }

    if (!page.startsWith('/')) {
      throw new ApiError(400, "Invalid page format", ["page must be a valid URL path starting with '/'"]);
    }

    const [analytics] = await AnalyticsModel.aggregate([
      { $match: { page } },
      {
        $facet: {
          totalVisits: [{ $count: "count" }],
          uniqueVisitors: [{ $group: { _id: "$sessionId" } }, { $count: "count" }],
          avgDuration: [
            { $match: { duration: { $ne: null } } },
            { $group: { _id: null, averageDuration: { $avg: "$duration" } } }
          ],
          deviceBreakdown: [
            { $group: { _id: "$deviceInfo", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]
        }
      },
      {
        $project: {
          totalVisits: { $arrayElemAt: ["$totalVisits.count", 0] },
          uniqueVisitors: { $arrayElemAt: ["$uniqueVisitors.count", 0] },
          averageVisitDuration: { $arrayElemAt: ["$avgDuration.averageDuration", 0] },
          deviceBreakdown: "$deviceBreakdown"
        }
      }
    ]);

    const result = {
      page,
      totalVisits: analytics?.totalVisits || 0,
      uniqueVisitors: analytics?.uniqueVisitors || 0,
      averageVisitDuration: analytics?.averageVisitDuration || 0,
      deviceBreakdown: analytics?.deviceBreakdown || []
    };

    
    return res.status(200).json(
      new ApiResponse(200, "Page analytics", result)
    );
  } catch (error) {
    console.error("Page Analytics Error:", { message: error.message, stack: error.stack });
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    return res.status(statusCode).json(
      new ApiError(statusCode, message, error.errors || [error.message])
    );
  }
};