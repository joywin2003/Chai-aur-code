import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
import { response } from "express";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`App is listening on port ${process.env.PORT || 3000}`);
    });

    app.on("error", (error) => {
      console.error("Unhandled error in the application:", error);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error("Connection to the database failed:", error);
    process.exit(1);
  });



