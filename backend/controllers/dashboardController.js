const User = require("../models/user");
const Subject = require("../models/subjectModel");
const Question = require("../models/question");
const ClassModel = require("../models/classLevel");
const SavedPaper = require("../models/savedPaper");

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Basic Counts
    const [
      totalUsers,
      premiumUsers,
      totalSubjects,
      totalClasses,
      totalQuestions,
      totalPapersGenerated,
      recentUsers,
      recentPapers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({
        $or: [
          { role: { $in: ["admin", "superadmin"] } },
          { isSuperAdmin: true },
          { isPremium: true },
        ],
      }),
      Subject.countDocuments(),
      ClassModel ? ClassModel.countDocuments() : 0,
      Question.countDocuments(),
      SavedPaper ? SavedPaper.countDocuments({ isTestPaper: { $ne: true } }) : 0,
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role createdAt image avatar"),
      SavedPaper ? SavedPaper.find({ isTestPaper: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .select("title subject grade totalMarks createdAt user") : [],
    ]);

    // 2. Aggregation: Questions Per Subject (For the Graph)
    const subjectStats = await Question.aggregate([
      {
        $group: {
          _id: "$subject",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "_id",
          foreignField: "_id",
          as: "subjectInfo",
        },
      },
      {
        $unwind: { path: "$subjectInfo", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          label: {
            $cond: {
              if: { $gt: [{ $strLenCP: { $ifNull: ["$subjectInfo.className", ""] } }, 0] },
              then: { $concat: ["$subjectInfo.subjectName", " (", "$subjectInfo.className", ")"] },
              else: { $ifNull: ["$subjectInfo.subjectName", "Unassigned"] }
            }
          },
          count: "$count",
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    res.json({
      totalUsers,
      premiumUsers,
      activeSubjects: totalSubjects,
      classLevels: totalClasses,
      totalQuestions,
      totalPapersGenerated,
      recentUsers,
      recentPapers,
      graphData: subjectStats,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};
