import AnalyticsModel from "../models/analyticsModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//  Start Visit
export const startVisit = async (req, res) => {
  try {
    const { sessionId, page, articleId, deviceInfo } = req.body;

    // Validate required fields
    if (!sessionId || !page || !deviceInfo) {
      const error = new ApiError(
        400,
        "Missing required fields",
        [
          !sessionId && "sessionId is required",
          !page && "page is required",
          !deviceInfo && "deviceInfo is required",
        ].filter(Boolean)
      );
      return res.status(error.statusCode).json(error);
    }

    // Create visit
    const visit = await AnalyticsModel.create({
      sessionId,
      page,
      articleId,
      visitTime: new Date(),
      deviceInfo,
    });

    return res.status(201).json(
      new ApiResponse(201, "Visit started successfully", {
        id: visit._id,
      })
    );
  } catch (error) {
    console.error("Start Visit Error:", error.message);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [error.message]));
  }
};

//  End Visit
export const endVisit = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res
        .status(400)
        .json(new ApiError(400, "Missing visit ID", ["id is required"]));
    }

    const updated = await AnalyticsModel.findByIdAndUpdate(
      id,
      { exitTime: new Date() },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json(
          new ApiError(404, "Visit not found", [`No visit found with ID ${id}`])
        );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Visit ended successfully", updated));
  } catch (error) {
    console.error("End Visit Error:", error.message);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [error.message]));
  }
};

// Website Overview
export const getWebsiteOverview = async (req, res) => {
  try {
    const totalVisits = await AnalyticsModel.countDocuments();

    const [avg] = await AnalyticsModel.aggregate([
      {
        $project: {
          duration: { $subtract: ["$exitTime", "$visitTime"] },
        },
      },
      {
        $group: {
          _id: null,
          averageDuration: { $avg: "$duration" },
        },
      },
    ]);

    return res.status(200).json(
      new ApiResponse(200, "Website overview", {
        totalVisits,
        averageVisitDuration: avg?.averageDuration || 0,
      })
    );
  } catch (error) {
    console.error("Website Overview Error:", error.message);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [error.message]));
  }
};

// Article Analytics
export const getArticleAnalytics = async (req, res) => {
  try {
    const { articleId } = req.params;

    if (!articleId) {
      return res
        .status(400)
        .json(
          new ApiError(400, "Missing article ID", [
            "articleId param is required",
          ])
        );
    }

    const visits = await AnalyticsModel.find({ articleId });
    const total = visits.length;

    const avgDuration =
      visits.reduce((acc, visit) => {
        if (visit.exitTime && visit.visitTime) {
          acc += new Date(visit.exitTime) - new Date(visit.visitTime);
        }
        return acc;
      }, 0) / (total || 1);

    return res.status(200).json(
      new ApiResponse(200, "Article analytics", {
        articleId,
        totalVisits: total,
        averageVisitDuration: avgDuration || 0,
      })
    );
  } catch (error) {
    console.error("Article Analytics Error:", error.message);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [error.message]));
  }
};
