const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// 1. Load Env Vars (Robust loading from parent server directory)
dotenv.config({ path: path.join(__dirname, "../.env") });

// ⚠️ SAFETY SWITCH: Set this to 'false' to ACTUALLY delete collections
const DRY_RUN = false; 

const cleanDatabase = async () => {
  try {
    // 2. Connect to DB
    const connStr = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/college_portal";
    await mongoose.connect(connStr);
    console.log(`🔌 Connected to DB: ${mongoose.connection.name}`);

    // 3. Define the Valid "Whitelist" (These 14 are used in your code)
    const validCollections = [
      "users",
      "studentprofiles",
      "facultyprofiles",
      "departments",
      "courses",
      "courseofferings",
      "semesters",
      "enrollments",
      "attendances",
      "marks",
      "announcements",
      "timetables",
      "fees",
      "hostels"
    ];

    // 4. Get Current Collections from DB
    const collections = await mongoose.connection.db.listCollections().toArray();
    const currentCollectionNames = collections.map(c => c.name);

    console.log("\n🔍 Analyzing Collections...");
    
    let orphansFound = 0;

    for (const name of currentCollectionNames) {
      // Ignore system collections (like 'system.indexes')
      if (name.startsWith("system.")) continue;

      if (!validCollections.includes(name)) {
        orphansFound++;
        
        if (DRY_RUN) {
          console.log(`   ❌ [DRY RUN] Would delete irrelevant collection: '${name}'`);
        } else {
          await mongoose.connection.db.dropCollection(name);
          console.log(`   🗑️  DELETED irrelevant collection: '${name}'`);
        }
      } else {
        console.log(`   ✅ Kept valid collection: '${name}'`);
      }
    }

    console.log("\n==========================================");
    if (orphansFound === 0) {
      console.log("✨ Database is clean! No irrelevant collections found.");
    } else {
      if (DRY_RUN) {
        console.log(`⚠️  Found ${orphansFound} irrelevant collections.`);
        console.log("👉 To delete them, change 'const DRY_RUN = true' to 'false' in this script and run again.");
      } else {
        console.log(`🎉 Cleanup Complete. Deleted ${orphansFound} collections.`);
      }
    }
    console.log("==========================================");

    process.exit(0);

  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

cleanDatabase();