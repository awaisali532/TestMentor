// backend/utils/vectorizer.js
require("dotenv").config();
const { pipeline } = require("@huggingface/transformers");

let extractor = null;
const MODEL_NAME = "nomic-ai/nomic-embed-text-v1.5";

const getEmbedding = async (text) => {
  try {
    if (!extractor) {
      console.log("⏳ Loading Nomic v1.5 (HuggingFace Official)...");

      // ✅ Pipeline with Token
      extractor = await pipeline("feature-extraction", MODEL_NAME, {
        use_auth_token: process.env.HF_TOKEN,
      });

      console.log("✅ Model Loaded!");
    }

    // ✅ Nomic specific prefix logic (Boht Zaroori)
    const input = `search_document: ${text}`;

    const output = await extractor(input, {
      pooling: "mean",
      normalize: true,
    });

    // Output ko simple array mein convert karein
    return Array.from(output.data);
  } catch (error) {
    console.error("❌ Vector Error:", error.message);
    return null; // Fail hone par null return karega
  }
};

module.exports = { getEmbedding };
