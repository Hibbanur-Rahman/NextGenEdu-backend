const mongoose = require("mongoose");

const ForumSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    role:{
        type:String,
        required:true
    },
    userId:{
        type:String,
        required:true
    },
    answers:[
        {
            answer:{
                type:String,
            },
            answerBy:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User'
            },
            role:{
                type:String
            }
        }
    ]
  },
  { timestamps: true }
);


module.exports=mongoose.model('forum',ForumSchema);