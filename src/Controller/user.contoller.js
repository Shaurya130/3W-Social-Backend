import { asyncHandler } from "../utils/asyncHandle.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId) => {

    const user= await User.findById(userId)
    if(!user)
    {
        throw new ApiError(404, "User Not Found")
    }
    try {
        const accessToken =user.generateAccessToken()
        const refreshToken =user.generateRefreshToken()
    
        user.refreshToken= refreshToken
        await user.save({validateBeforeSave: false })
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500, "Server issue,please try again later")
    }
}

const registerUser= asyncHandler( async(req,res) => {

    const { email, username, password} = req.body;

    if(!email || !username || !password)
    {
        throw new ApiError(400, "All fields are required")
    }

    //self wriiten comment- Validate email format ! negates the result, /.../ wraps the regex, ^ and $ anchor the start and end, [^\s@]+ matches one or more non-space, non-@ characters, @ is the literal at-sign, \. is a literal dot, and .test(email) checks if the string matches the pattern.

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ApiError(400, "Please enter a valid email address");
    }

    const userExist=await User.findOne({
        $or: [ {username}, {email}]
    })
    //validation
    if( [email,username,password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }
    if( userExist){
        throw new ApiError(409, "User with username or email already exist")
    }

    //creation

    try {
        const user=await User.create({
            email,
            username: username.toLowerCase(),
            password
        })
    
        const createdUser= await User.findById(user._id).select(
            "-password -refreshToken"
        )
    
        if(!createdUser){
            throw new ApiError(500, "Something went wrong while registering the user")
        }
    
        return res.status(201).json( new ApiResponse(200, createdUser,"User Registered successfully"))
    } catch (error) {
        console.log("User Creation failed");
        throw new ApiError(500,"Something went wrong while registerring the user and images were deleted")
        
    }
})

const loginUser = asyncHandler( async (req,res) => {

    const {username,password,email}= req.body

    if( (!username && !email) || !password)
    {
        throw new ApiError(400, "Username or email and password are required")
    }

    const user= await User.findOne({
        $or:[{username},{email}]
    })

    if(!user)
    {
        throw new ApiError(404, "User not found")
    }

    // validate password
   const isPassValid= await user.isPasswordCorrect(password)

   if(!isPassValid)
   {
    throw new ApiError(401, "Invalid Credentials")
   }
    
   let accessToken, refreshToken, loggedInUser;

   try {
      const tokens = await generateAccessAndRefreshToken(user._id)
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
   
      loggedInUser = await User.findById(user._id).select("-password -refreshToken")
   } catch (error) {
     throw new ApiError(500, "Server error while creating token")
   }

   const options={
     httpOnly: true, // makes the cookie modificatiion only at server end
     secure: process.env.NODE_ENV === "production"
   }

   return res
   .status(200)
   .cookie("accessToken",accessToken, options)
   .cookie("refreshToken",refreshToken, options)
   .json( new ApiResponse(200,
     { user: loggedInUser,accessToken,refreshToken }, 
     "User logged in successfully"))

})

const logoutUser = asyncHandler ( async (req,res) => {
    await User.findByIdAndUpdate(
       req.user._id,{
        $set:{
            refreshToken : undefined
        }
       },
       {new: true}
    )

    const options={
        httpOnly: true, // makes the cookie modificatiion only at server end
        secure: process.env.NODE_ENV === "production"
      }

      return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json( new ApiResponse(200,
        {}, " User logged out successfully"))

})

const refreshAccessToken= asyncHandler( async (req,res) => {
    const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken)
    {
        throw new ApiError(401,"Refresh Token is required")
    }

    try {
        
        const decodedToken= jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user=await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Invalid Token")
        }

        const options={
            httpOnly: true, // makes the cookie modificatiion only at server end
            secure: process.env.NODE_ENV === "production"
          }
        
          const {accessToken, refreshToken:newrefreshToken} = await generateAccessAndRefreshToken(user._id)

          return res
          .status(200)
          .cookie("accessToken",accessToken, options)
          .cookie("refreshToken",newrefreshToken, options)
          .json( new ApiResponse(200,
            { accessToken,refreshToken: newrefreshToken }, 
            "Access Token Refreshed successfully"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while refreshing the access Token")
    }
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

export{
    registerUser, 
    loginUser, 
    refreshAccessToken, 
    logoutUser,
    getCurrentUser 
}