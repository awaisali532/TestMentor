const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load Environment Variables
dotenv.config();

// Define Schema roughly just for update (or import your model)
const questionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.model("Question", questionSchema);

const migrateData = async () => {
  try {
    // 1. Database Connect
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔥 MongoDB Connected...");

    // 2. Wo Questions dhoondo jin mein 'topic' (purana) hai magr 'topics' (naya) khali hai
    const questionsToFix = await Question.find({
      topic: { $exists: true },
      topics: { $exists: false },
    });

    console.log(`Found ${questionsToFix.length} questions to migrate...`);

    let count = 0;
    for (const q of questionsToFix) {
      // 3. Purani ID utha kr nai Array main daal do
      const oldTopicId = q.topic;

      // Update logic: topics array banao aur purani field remove krdo (optional)
      await Question.updateOne(
        { _id: q._id },
        {
          $set: { topics: [oldTopicId] }, // Array bana di
          // $unset: { topic: 1 } // Purana field delete krna h to ye line uncomment kr den
        }
      );
      count++;
      process.stdout.write(`\rFixed: ${count}`);
    }

    console.log("\n✅ Migration Complete! All questions are visible now.");
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

migrateData();
