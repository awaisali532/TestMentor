const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const subjectRoutes = require("./routes/subjectRoutes"); // no .js needed
const chapterRoutes = require("./routes/chapterRoutes");
const topicRoutes = require("./routes/topicRoutes");
const questionRoutes = require("./routes/questionRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/subjects", subjectRoutes); // ✅ mount it
app.use("/api/chapters", chapterRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", dashboardRoutes); // URL will be: /api/admin/stats
app.get("/", (req, res) => {
  res.send("🚀 TestMentor Backend is running...");
});

//for live on versal need to set port
const port = process.env.PORT || 5000;
// Only run listen locally, Vercel handles it in production
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => console.log(`Server running on port ${port}`));
}
module.exports = app; // <--- THIS IS THE MOST IMPORTANT LINE
