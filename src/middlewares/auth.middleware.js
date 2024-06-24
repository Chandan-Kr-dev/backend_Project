import { asyncHandler } from "../utils/asyncHandler";


export const verifyJWT=asyncHandler(async(res,req,next)=>{
    const token=req.cookies?.accessToken || req.header ("Authorization")?.replace("Bearer","")
})