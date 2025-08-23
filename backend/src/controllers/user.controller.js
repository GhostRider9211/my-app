import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accesssToken  = user.generateAccessToken()
    const refreshToken  = user.generateRefreshToken()

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave:false})

    return {accesssToken,refreshToken}
  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating refresh and access token ")

  }
}

const registerUser = asyncHandler(async (req, res) => {
  // get user detail from frontend
  //validation - not empty
  //already exits:username or email
  //check for images ,check for avatar
  //upolad to cloudinary,check avatar
  //create user-object - create entry in db
  //remove password and refresh token filed from response
  //check for user creation
  //return res

  const { fullname, email, username,password } = req.body;
  console.log("email: ", email);

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with username or email already exists ");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files.coverImage[0]?.path;
  console.log("avatarLocalPath", avatarLocalPath);
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  const user = await user.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered Successfully"));
});


const loginUser = asyncHandler(async(req,res)=>{
  //req body ->data
 //username or email
 //find the user
 //password check
 //access and refresh token
 //send cookies 

 const {email,password,username}= req.body
 if(!username || !email){
  throw new ApiError(400,"username or email is required")
 }
 const user = await User.findOne({
  $or:[{username},{email}]
 })

 if(!user){
  throw new ApiError(404,"User not found")
 }
  const  isPasswordValid = await user.isPassCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials")
  }
  const {accesssToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly:true,
    secure:true
  }
  return res
  .status(200)
  .cookie("accessToken",accesssToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user:loggedInUser,accesssToken,refreshToken,
      },
      "user logged in successfully"
    )
  )
  
})

const logoutUser = asyncHandler(async(req,res)=>{

})
export { registerUser,loginUser };
