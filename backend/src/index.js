import dotenv from "dotenv";
import connectDB from "./db/index.js";
// import {app} from "./app.js";
// import app from "./app.js"; // <-- import app
dotenv.config({
  path: "./.env",
});
// import express from 'express'
// export const app = express(); // <-- define app

import app from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port : ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.log("MONGO db connection failed !!!", error);

  });
// app.listen(8000);

 