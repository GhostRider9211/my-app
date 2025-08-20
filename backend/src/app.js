import express from "express";
import cors from "cors";
import userRouter from './routes/user.routes.js'
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json())
// app.use(cors)({
//   origin: "*",
//   // credentials: true,
// });
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes

app.get("/check",(req,res)=>{
  res.send("ok")
})
// routes declaration
app.use("/api/v1/users",userRouter)

export default  app ;
