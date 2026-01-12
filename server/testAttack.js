// testAttack.js - Simulates a DDoS Attack
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function attack() {
  console.log("⚔️ Launching 105 requests...");
  
  for (let i = 1; i <= 105; i++) {
    try {
      const res = await fetch("http://localhost:5000/");
      if (res.status === 429) {
        console.log(`🛡️ BLOCKED at Request #${i}: Too Many Requests!`);
        break;
      } else {
        process.stdout.write("."); // Print dot for success
      }
    } catch (err) {
      console.log("Error", err.message);
    }
  }
  console.log("\n✅ Test Complete.");
}

attack();