// backend/downloadModel.js
require("dotenv").config();
const { pipeline } = require("@huggingface/transformers");

async function downloadModel() {
  // Official Model Name
  const modelName = "nomic-ai/nomic-embed-text-v1.5";

  console.log(`🚀 Starting Download for: ${modelName}`);
  console.log("🔑 Using HF_TOKEN from .env...");

  try {
    if (!process.env.HF_TOKEN) {
      throw new Error("❌ HF_TOKEN missing in .env file!");
    }

    // ✅ Nayi Library ka Syntax
    // 'feature-extraction' use kar rahe hain taake raw vector mile
    const extractor = await pipeline("feature-extraction", modelName, {
      dtype: "fp32", // Safe formatting
      use_auth_token: process.env.HF_TOKEN, // ✅ Token yahan pass hoga
    });

    console.log("✅ Model Downloaded Successfully!");

    // Test Run (Prefix zaroori hai Nomic ke liye)
    const output = await extractor("search_document: Testing Nomic v1.5", {
      pooling: "mean",
      normalize: true,
    });

    console.log("🎉 Vector Generated!");
    console.log("Dimensions:", output.data.length); // 768 ana chahiye
  } catch (error) {
    console.error("❌ Download Failed:", error);
  }
}

downloadModel();
