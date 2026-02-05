import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { ApiError} from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandle.js";

export const verifyJWT = asyncHandler(async (req,_,next) => {

    // Safe access to cookies
    const cookieToken = req.cookies?.accessToken;
    const bodyToken = req.body?.accessToken;
    const headerToken = req.header("Authorization")?.replace("Bearer ", "");
    
    const token = cookieToken || bodyToken || headerToken;

    if(!token){
        throw new ApiError(401, "Unauthorized - No token provided")
    }

    try {
        const decodedToken=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user=await User.findById(decodedToken?._id).
        select("-password -refreshToken")

        if(!user){
           throw new ApiError(401, "Unauthorized") 
        }

        req.user= user

        next()
    } catch (error) {
        throw new ApiError(401, "Invalid Accesss Token")
    }
})