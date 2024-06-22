import { asyncHandler } from "../utils/asyncHandler.js";


const registerUser=asyncHandler(async(req,res)=>{
    res.status(200).json({    // 200 here is the error or status codes
        message:"ok with the link"
    })
})

export {registerUser}