const asyncHandler =(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}


export {asyncHandler} 







// these are the higher order function where the function itself accepts a function in its parameter

// const asyncHandler=()=>{}
// const asyncHandler=()=>()=>{}
// const asyncHandler=()=> async ()=>{}





// first way

    // const asyncHandler =(requestHandler)=>{
    //     (req,res,next)=>{
    //         Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    //     }
    // }
    
// second way
// this can be done using try catch 

// const asyncHandler =(fn)=>async(req,res,next)=> {
//     try {
//         await fn(req,res,next);
        
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message,
//         })
//     }
// }