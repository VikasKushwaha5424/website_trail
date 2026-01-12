// testUpload.js - Script to test Image Uploads
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
// We use dynamic import for node-fetch since v3 is ESM-only, 
// OR we can rely on the global 'fetch' if you are on Node 18+.
// To be safe and simple, we'll use standard http or the fetch you already have.

// If you have Node 18+, fetch is global. If not, we might need to require it.
// Given your package.json has 'node-fetch', let's try to use the global one first,
// but form-data requires specific headers handling.

const UPLOAD_URL = "http://localhost:5000/api/users/upload-photo";
const FILE_PATH = path.join(__dirname, 'test.jpg');

async function uploadImage() {
  console.log("🚀 Starting Upload Test...");

  // 1. Check if file exists
  if (!fs.existsSync(FILE_PATH)) {
    console.error("❌ Error: Could not find 'test.jpg' in the server folder.");
    console.error("👉 Please copy an image there and rename it to 'test.jpg'");
    return;
  }

  // 2. Prepare Form Data
  const form = new FormData();
  form.append('photo', fs.createReadStream(FILE_PATH));

  try {
    // 3. Send Request
    // We import node-fetch dynamically to avoid CommonJS/ESM errors
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(), // ⚠️ Important: Adds the multipart boundary
    });

    const data = await response.json();

    // 4. Handle Result
    if (response.ok) {
      console.log("\n✅ Upload Success!");
      console.log("--------------------------------------------------");
      console.log("☁️  Cloudinary URL:", data.url);
      console.log("--------------------------------------------------");
      console.log("👉 Copy this URL and paste it in your browser to verify!");
    } else {
      console.log("\n❌ Upload Failed:", data);
    }

  } catch (error) {
    console.error("\n❌ Network Error:", error.message);
    if (error.code === 'ECONNREFUSED') {
        console.log("💡 Is your server running? (npm start)");
    }
  }
}

uploadImage();