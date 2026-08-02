const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Routes Imports
const authRoutes = require("./routes/authRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const topicRoutes = require("./routes/topicRoutes");
const questionRoutes = require("./routes/questionRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const contactRoutes = require("./routes/contactRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const paperPatternRoutes = require("./routes/paperPatternRoutes");
const paperRoutes = require("./routes/paperRoutes"); // ✅ Loaded correctly
const usageRoutes = require("./routes/usageRoutes");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

dotenv.config();
connectDB();

const app = express();

// 1. CORS MUST ALWAYS BE FIRST so HTTP OPTIONS preflight requests succeed!
app.use(
  cors({
    origin: [
      "https://test-mentor-2u38.vercel.app",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Enable Gzip/Brotli compression
app.use(compression());

// 3. Express 5 Compatible NoSQL Injection Sanitizer (Sanitizes body & params safely)
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

// 4. Rate Limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// Routes Mounting
app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", dashboardRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/patterns", paperPatternRoutes);
app.use("/api/papers", paperRoutes); // ✅ Endpoint Active
app.use("/api/usage", usageRoutes);
// Base Route
app.get("/", (req, res) => {
  res.send("🚀 TestMentor Backend is running...");
});

// Port & Server Start
const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => console.log(`✅ Server running on port ${port}`));
}

module.exports = app;
