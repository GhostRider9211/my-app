import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express"; // <-- add this

dotenv.config({
  path: "./env",
});

const app = express(); // <-- define app

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port : ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.log("MONGO db connection failed !!!", error);
  });
