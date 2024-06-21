import mongoose from 'mongoose';
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const usersSchema=mongoose.Schema(
    {
    username:{
        typr:String,
        requird: true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
    },
    email:{
        typr:String,
        requird: true,
        unique:true,
        lowercase:true,
        trim:true,
        
    },
    fullname:{
        typr:String,
        requird: true,
        trim:true,
        index:true,
    },
    avtar:{
        typr:String, //cloudinary url 
        requird: true,
       
    },
    coverImage:{
        typr:String, //cloudinary url 
    },
    watchHistory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
    password:{
        type:String,
        required:[true,"Password is required"],
    },
    refreshToken:{
        type:String,
    }
},
{
    timestamps:true
}
);

usersSchema.pre('save',async function(next){
    if(!this.isModified("password")) return next();
    this.password=bcrypt.hash(this.password,10)
    next()
})

usersSchema.methods.isPassowrdCorrect=async function(passowrd){
    return await bcrypt.compare(password,this.password)
}

usersSchema.methods.generateAcessToken=function(){
    jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fulllname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}
usersSchema.methods.generateRefreshToken=function(){
    jwt.sign(
        {
            _id:this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}

export const Users=mongoose.model('Users',usersSchema)