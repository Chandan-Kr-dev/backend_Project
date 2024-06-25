import { asyncHandler } from "../utils/asyncHandler.js";
import { apierror } from "../utils/apierror.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Users } from "../models/user.models.js";
import jwt from "jsonwebtoken"

import {uploadOnCloudinary} from "../utils/fileupload.js";

const generateAccessAndRefreshToken=async (userId)=>{
  try {
    const user=await Users.findById(userId)
    const accessToken=user.generateAcessToken()
    const refreshToken = user.generateRefreshToken() 

    user.refreshToken=refreshToken
    await user.save({validateBeforeSave:false})

    return {accessToken,refreshToken}



  } catch (error) {
    throw new apierror(500,"Something Went Wrong while genertaing refresh and access tokens")
    
  }
}

const registerUser = asyncHandler(async (req, res) => {
  //get userdetails from frontend
  const { fullname, email, username, password } = req.body;
  console.log("email", email);

  //validation for emptiness
  if (fullname == "") {
    throw new apierror(400, "fullname is required");
  }
  if (email == "") {
    throw new apierror(400, "email is required");
  }
  if (username == "") {
    throw new apierror(400, "username is required");
  }
  if (password == "") {
    throw new apierror(400, "password is required");
  }

  /*
    the upper same can be done by this thi check all the boxes at once 
    
    if([fullname,email,username,password].some((field)=>field?.trim()==="")){
        throw new apierror(400,"all fields are required")
        }
        */

  //check if user already exits  >> check by username

  const existedUser = await Users.findOne({
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    throw new apierror(409, "User with username or email already exists");
  }

  // console.log(req.files)
  // console.log(req.body)

  //files  uploaded or not ,check for avtar

  const avtarLocalPath=req.files?.avtar[0]?.path
  // const coverImageLocalPath=req.files?.coverImage[0]?.path
  let coverImageLocalPath;
  if(req.files&& Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath=req.files.coverImage[0].path
  }

  

  if(!avtarLocalPath){
    throw new apierror(400,"avtar file is required");
  }


  //upload them to coludinary, avtar

  const avtar=await uploadOnCloudinary(avtarLocalPath)
  const coverImage=await uploadOnCloudinary(coverImageLocalPath)

  if(!avtar){
    throw new apierror(400,"avtar is a required field")
  }

  //create user object --create entry in db

 const User=await Users.create({
    fullname,
    avtar:avtar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()

  })

  //remove password and refreshtoken field from respnose
  //check if user is created or not

  const createdUser= await Users.findById(User._id).select(
    "-password -refreshToken "
  )
  if(!createdUser){
    throw new apierror(500,"Something went wrong while registering the user")
  }


  //if created return response else  show error

  return res.status(201).json(
    new apiResponse(200,createdUser,"user registerd successfully")
  )

});




//making login user 

const loginUser=asyncHandler(async (req,res)=>{
  //request body se data le aao 
  const {email,username,password}=req.body

  // check for username or email hai ya nahi 
  if(!(username || email)){
    throw new apierror(400,"username or password is required");
  }

  //find the user in database 
  const user=await Users.findOne({
    $or:[{username},{email}]
  })
  if(!user){
    throw new apierror(404,"user does not exists")
  }

  // if exists check for password 
  const isPasswordValid=await user.isPassowrdCorrect(password)

  if(!isPasswordValid){
    throw new apierror(404,"password incorrect");

  }

  //access and refersh token generate 
  const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)


  //send secure cookies 
  const LoggedinUser=await Users.findById(user._id).select("-password -refreshToken")
  const options= {
    httpOnly:true,
    secure:true,
  }

  return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
  .json(
    new apiResponse(200,{
      user:LoggedinUser,accessToken,refreshToken
    }, " User logged in Successfully"
  )
  )

})

// logout user

const logoutUser=asyncHandler(async(req,res)=>{
  Users.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
  )
  const options={
    httpOnly:true,
    secure:true,
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new apiResponse(200,{},"User Logged Out Successsfully"))


})

const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken

  if(!incomingRefreshToken){
    throw new apierror(401,"Unauthorized Access")

  }

  try {
    const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    const user=await Users.findById(decodedToken?._id)
    if(!user){
      throw new apierror(401,"Invalid refresh Token")
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new apierror(401,"Refresh Token Expired or used ");
    }
  
    const options={
      httpOnly:true,
      secure:true
    }
  
    const {accessToken,newrefreshToken}=await generateAccessAndRefreshToken(user._id)
  
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
      new apiResponse(
        200,
        {accessToken ,newrefreshToken},
        "Access Token Refreshed Successfully"
  
      )
    )
  } catch (error) {
    throw new apierror(401,error?.message ||"Invalid refreshToken")
    
  }

})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword}=req.body
  const user=await Users.findById(req.user._id)

  const isPasswordCorrect=await user.isPassowrdCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new apierror(400,"Invalid Old Password")
  }

  user.password=newPassword;

  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(new apiResponse(200,{},"Password Changed Successfully"))

})


const getCurrentUser=asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(200,{},"Current User Fetched Successfully")
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {fullname,email}=req.body;

  if (!fullname|| !email) {
    throw new apierror(400,"All fields Are required")
    
  }

  const user=Users.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullname:fullname,
        email:email,
      }
    },
    {new:true}
  ).select("-password")

  return res
  .status(200)
  .json(new apiResponse(200,user,"Account Details Updated Successfully"))

})

const updateUserAvatar=asyncHandler(async(req,res)=>{
  const newAvtarLocalPath=req.file?.path

  if (!newAvtarLocalPath) {
    throw new apierror(400,"avtar file missing")
    
  }
  const avtar=await uploadOnCloudinary(newAvtarLocalPath)

  if(!avtar.url){
    throw new apierror(400,"Error while Uploading on avtar")
  }

  const user=await Users.findByIdAndUpdate(req.user._id, {
    $set:{
      avtar:avtar.url,
    }
  }, {new:true}).select("-password")

  return res
  .status(200)
  .json(
    new apiResponse(200,user,"Updated Avtar Successfully")
  )


})
const updateUserCoverImage=asyncHandler(async(req,res)=>{
  const newCoverImageLocalPath=req.file?.path

  if (!newCoverImageLocalPath) {
    throw new apierror(400,"Cover Image file missing")
    
  }
  const coverImage=await uploadOnCloudinary(newCoverImageLocalPath)

  if(!coverImage.url){
    throw new apierror(400,"Error while Uploading on Cover Image")
  }

  const user=await Users.findByIdAndUpdate(req.user._id, {
    $set:{
      coverImage:coverImage.url,
    }
  }, {new:true}).select("-password")

  return res
  .status(200)
  .json(
    new apiResponse(200,user,"Updated CoverImage Successfully")
  )


})


export { 
  registerUser,
  loginUser,
  logoutUser ,
  refreshAccessToken ,
   changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
  };
