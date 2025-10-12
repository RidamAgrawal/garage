import mongoose from "mongoose";

export default function connect(){
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('MongoDb connnected'))
        .catch(err => console.error('MongoDb Error:',err));
}
// CQWsi8YA3vSzVSpc