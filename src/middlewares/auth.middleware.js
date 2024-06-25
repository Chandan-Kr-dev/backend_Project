import { asyncHandler } from "../utils/asyncHandler.js";
import {apierror} from "../utils/apierror.js"
import jwt from "jsonwebtoken"
import {Users} from "../models/user.models.js"

export const verifyJWT=asyncHandler(async(res,req,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new apierror(401,"Unauthorized Access")
    
        }
    
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user=await Users.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
    
            throw new apierror(401,"Invalid access Token")
        }
    
        req.user=user;
        next()

    } catch (error) {
        throw new apierror(401,error?.message||"invalid access Token")
    }

})