import dotenv from 'dotenv';
dotenv.config();

console.log("Checking API Key...", process.env.GEMINI_API_KEY ? "✅ Loaded" : "❌ MISSING / UNDEFINED");

async function checkApi() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("\n❌ ERROR: GEMINI_API_KEY is missing from process.env. Check your .env file path.");
    return;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();

    if (data.error) {
      console.error("\n❌ Google API Error:", data.error.message);
      return;
    }

    console.log("\n✅ Success! Your key has access to these active models:");
    const available = data.models
      ?.filter(m => m.supportedGenerationMethods?.includes("generateContent"))
      .map(m => m.name.replace("models/", ""));
    console.log(available);
  } catch (err) {
    console.error("\n❌ Network error:", err.message);
  }
}

checkApi();