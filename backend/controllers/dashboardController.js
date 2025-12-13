const User = require("../models/user");
const Subject = require("../models/subjectModel");
const Question = require("../models/question");
const ClassModel = require("../models/classLevel");

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Basic Counts
    const [totalUsers, totalSubjects, totalClasses, totalQuestions] =
      await Promise.all([
        User.countDocuments(),
        Subject.countDocuments(),
        // If you don't have ClassModel yet, keep this 0 or remove it
        ClassModel ? ClassModel.countDocuments() : 0,
        Question.countDocuments(),
      ]);

    // 2. Aggregation: Questions Per Subject (For the Graph)
    // This groups questions by subjectId, counts them, and joins with Subject table to get the name.
    const subjectStats = await Question.aggregate([
      {
        $group: {
          _id: "$subjectId", // Group by Subject ID
          count: { $sum: 1 }, // Count questions
        },
      },
      {
        $lookup: {
          from: "subjects", // The collection name in MongoDB (usually plural)
          localField: "_id",
          foreignField: "_id",
          as: "subjectInfo",
        },
      },
      {
        $unwind: "$subjectInfo", // Convert array to object
      },
      {
        $project: {
          label: "$subjectInfo.subjectName", // Get Name
          count: "$count", // Get Count
        },
      },
      { $sort: { count: -1 } }, // Sort by highest count
      { $limit: 5 }, // Only take top 5 for the graph
    ]);

    res.json({
      totalUsers,
      activeSubjects: totalSubjects,
      classLevels: totalClasses,
      totalQuestions,
      graphData: subjectStats, // Send this new array to frontend
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};
