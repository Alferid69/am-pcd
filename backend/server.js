const dns = require("dns");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Fix Node.js DNS resolution issues on Windows for MongoDB SRV records
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.warn("Could not set custom DNS servers:", e.message);
}

dotenv.config({ path: path.join(__dirname, ".env") });

const app = require("./app");
const initSelfPing = require("./utils/selfPing");

const uri = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
).replace("<USERNAME>", process.env.DATABASE_USERNAME);

const port = process.env.PORT || 3000;
mongoose
  .connect(uri)
  .then(() => {
    console.log("Mongoose connected");

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port ${port}`);
      initSelfPing();
    });
  })
  .catch((err) => {
    console.error("DB error:", err);
  });
