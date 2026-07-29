const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config("./.env");

const app = require("./app");

const HOST = '0.0.0.0';

const uri = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
).replace("<USERNAME>", process.env.DATABASE_USERNAME);

mongoose
  .connect(uri)
  .then(() => {
    console.log("Mongoose connected");

    app.listen(process.env.PORT, HOST, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB error:", err);
  });
