import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiErrors} from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAndRefreshTokens = async(userId)=> {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiErrors(500, "SOmething went wrong while generating tokens")
  }
}

const registerUser = asyncHandler(async (req, res)=> {
  // validations here

  const {username, fullName, email, password } = req.body

  if(
    [username, fullName, email, password].some( (field) => field?.trim() === "")
  ) {
    throw new ApiErrors(400, "All fields are required");
  }

const existingUser = await User.findOne({
    $or: [
      { username },
      { email }
    ]
  })    

  if(existingUser) {
    throw new ApiErrors(409, "User already exists")
  }

  // console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }

  if(!avatarLocalPath) {
    throw new ApiErrors(400, "Avatar is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  
  if(!avatar) {
    throw new ApiErrors(400, "Failed to load the Avatar")
  }

  const user = await User.create(
    {
        username: username.toLowerCase(),
        email,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password
    }
  )

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!userCreated) {
    throw new ApiErrors(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, userCreated, "User created successfully")
  )

})

const loginUser = asyncHandler(async (req, res) => {

   const {email, username, password} = req.body

   if(!(username || email)) {
    throw new ApiErrors(400, "Username or email is required")
  }

    const user = await User.findOne({
      $or: [
        {username},
        {email}
      ]
  })

  if(!user) {
    throw new ApiErrors(404, "User does not exist")
  }

    const IsPasswordValid = await user.IsPasswordCorrect(password)

    if(!IsPasswordValid) {
      throw new ApiErrors(401, "Invalid password") 
    }
    
    const {accessToken, refreshToken} = await generateAndRefreshTokens(user._id)

    const loggedIn = await User.findById(user._id).select("-password -refreshToken")

    const options = {
      httpOnly: true,
      secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
        user: loggedIn, accessToken,
        refreshToken
        },
        "User logged in successfully"
      )
    )

})

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      }
    }, {
      new:true
    }
  )

  const options = {
    httpOnly: true,
    secure: true,
  }
  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(
    new ApiResponse(200, {}, "User logged out successfully")
  )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const IncomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!IncomingRefreshToken) {
    throw new ApiErrors(401, "Unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(
      IncomingRefreshToken,
       process.env.REFRESH_TOKEN_SECRET
      )
  
      const user = await User.findById(decodedToken?._id)
  
      if(!user) {
        throw new ApiErrors(401, "Invalid Refresh Token")
      }
  
      if(IncomingRefreshToken !== user?.refreshToken) {
        throw new ApiErrors(401, "Refresh token is expired or have been used")
      }
  
      const options = {
        httpOnly: true,
        secure: true
      }
  
       const {accessToken, newRefreshToken} = await generateAndRefreshTokens(user._id)
  
       return res
       .status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", newRefreshToken, options)
       .json(
        new ApiResponse(
          200,
          {accessToken, refreshToken: newRefreshToken},
          "Access token refreshed successfully"
        )
       )
  } catch (error) {
    throw new ApiErrors(401, error?.message || "Invalid refresh token")
  }
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
}