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


app.post("/address", (req, res) => {
  const input = req.query["input"];
  fetch("https://maps.googleapis.com/maps/api/place/autocomplete/json?input=mang&key=AIzaSyDbaZ9VWDglTpdsz40yUq6dORroo1TVeig")
      .then((response) => response.json())
      .then((data) => {
          const predictions = data["predictions"];
          const descriptions = predictions.map((element) => element["description"]);
          
          res.json({ predictions: descriptions });
      })
      .catch((error) => {
          console.error("Error fetching data:", error);
          res.status(500).json({ error: "Internal Server Error" });
      });
});
