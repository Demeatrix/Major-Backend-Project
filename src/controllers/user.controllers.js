import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiErrors} from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res)=> {
  // validations here

  const {username, fullName, email, password } = req.body
  console.log( "email:" ,email);

  if(
    [username, fullName, email, password].some( (field) => field?.trim() === "")
  ) {
    throw new ApiErrors(400, "All fields are required");
  }

const existingUser = User.findOne({
    $or: [
      { username },
      { email }
    ]
  })    

  if(existingUser) {
    throw new ApiErrors(409, "User already exists")
  }


  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.cover[0]?.path;

  if(!avatarLocalPath) {
    throw new ApiErrors(400, "Avatar is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  
  if(!avatar) {
    throw new ApiErrors(400, "Avatar is required")
  }

  const user = await User.create(
    {
        username: username.toLowerCase(),
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
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

export {registerUser}