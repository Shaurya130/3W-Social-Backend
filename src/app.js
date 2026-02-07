import express from "express"
import cors from "cors" //allows wh can make a request to the server
import cookieParser from "cookie-parser"
import { errorHandler } from "./middlewares/error.middleware.js";

const app= express();

// middleware - in between configuration to do a certain task over the code

 app.set("trust proxy", 1);

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173", // or your React app's URL
        credentials: true
    })
)

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes

import userRoutes from "./routes/user.routes.js"
import postRoutes from "./routes/post.routes.js"

app.use("/api/v1/users", userRoutes)
app.use("/api/v1/posts", postRoutes)    



app.use(errorHandler)

export { app }
