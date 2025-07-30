import mongoose from 'mongoose'


const friendRequestSchema = new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    recipient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    status:{
        type:String,
        enum:['pending','accepted','rejected'],
        default:'pending'
    }
},{timestamps:true})

const friendRequestModel = mongoose.model('friendRequest',friendRequestSchema);
export default friendRequestModel;
 