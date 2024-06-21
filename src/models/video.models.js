import mongoose ,{Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';



const videoSchema=new Schema(
    {
    videoFile:{
        type:String,  // cloudenary url
        required:true,

    },
    thumbnail:{
        type:String, //cloudinary url
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    Description:{
        type:String,
        required:true,
    },
    Duration:{
        type:Number, // Cloudery Url
        required:true,
    },
    view:{
        type:Number,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:'Users',
    }
},{tiemstamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Videos=mongoose.model('Videos',videoSchema);