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

// Initiate background connection immediately on server boot
connectDB().catch((err) => {
  console.error("Initial MongoDB boot connection error:", err.message);
});

const app = express();

// Enable Trust Proxy for Vercel / Reverse Proxy (Required by express-rate-limit)
app.set("trust proxy", 1);

// 1. CORS MUST ALWAYS BE FIRST so HTTP OPTIONS preflight requests succeed!
const allowedOrigins = [
  "https://test-mentor-2u38.vercel.app",
  "https://test-mentor-nine.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback allow to prevent unexpected CORS blocks
    },
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

// 4. Rate Limiter for API endpoints (with trust proxy enabled)
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

// 5. Ensure MongoDB is connected before handling any API routes (Serverless Resilience)
app.use(async (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failed for request:", err.message);
    return res.status(503).json({
      success: false,
      message: "Database connection failed. Please try again shortly.",
    });
  }
});


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
