import mongoose,{Schema} from "mongoose";
import { Users } from "./user.models";

const SubscriptionSchema=new Schema({
    Subscriber:{
        type:Schema.Types.ObjectId, // one who is subcribing
        ref:'Users'
    },
    channel:{
        type:Schema.Types.ObjectId, // one who is subcribing channel
        ref:'Users'
    }
},{timestamps:true})

export const Subscription=mongoose.model('Subscription',SubscriptionSchema)