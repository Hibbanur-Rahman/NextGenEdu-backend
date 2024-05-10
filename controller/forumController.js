const ForumModel = require("../models/forumModel");
const StudentModel = require("../models/userModel");
const TeacherModel = require("../models/teacherModel");
const httpStatusCode = require("../constant/httpStatusCode");
const { validationResult } = require("express-validator");

const AddQuestion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const userId = req.user._id;
    if (!userId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "User not found",
      });
    }

    const { question, description, tags } = req.body.questionDetails;
    const tagsList = tags.split(",");
    const role = req.user.role;
    let Forum;
    if (role === "student") {
      Forum = await ForumModel.create({
        question,
        description,
        tags: tagsList,
        studentId: userId,
        role,
      });
    } else if (role === "teacher") {
      Forum = await ForumModel.create({
        question,
        description,
        tags: tagsList,
        teacherId: userId,
        role,
      });
    }

    let userUpdateQuery = {};
    if (req.user.role === "student") {
      userUpdateQuery = { $push: { forumQuestion: Forum._id } };
    } else if (req.user.role === "teacher") {
      userUpdateQuery = { $push: { forumQuestion: Forum._id } };
    }

    const User = req.user.role === "student" ? StudentModel : TeacherModel;
    const updatedUser = await User.findByIdAndUpdate(userId, userUpdateQuery, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: `${req.user.role} is not found and push the forum question`,
      });
    }

    return res.status(httpStatusCode.CREATED).json({
      success: true,
      message: "Question added",
      data: Forum,
    });
  } catch (error) {
    console.error(error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong!!",
      error: error.message,
    });
  }
};

const ViewForumQuestionList = async (req, res) => {
  try {
    const ForumQuestionList = await ForumModel.find()
      .populate("studentId")
      .populate("teacherId");
    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Forum Question List",
      data: ForumQuestionList,
    });
  } catch (error) {
    console.error(error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong!!",
      error: error.message,
    });
  }
};

const ViewForumWithQuestionId = async (req, res) => {
  try {
    const { questionId } = req.body;
    if (!questionId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "Please provide the question Id",
      });
    }
    const ForumQuestion = await ForumModel.findById(questionId)
    .populate({
      path: "studentId"
    })
    .populate({
      path: "answers",
      populate: { 
        path: "studentId",
      } 
    })
    .populate({
      path: "answers",
      populate: { 
        path: "teacherId",
      } 
    })
    .populate("teacherId");
    if (!ForumQuestion) {
      return res.status(httpStatusCode.NOT_FOUND).json({
        success: false,
        message: "Question not found",
      });
    }

    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Forum Question",
      data: ForumQuestion,
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong!!",
      error: error.message,
    });
  }
};

const AddForumAnswer=async(req,res)=>{
  try{
    const {questionId,answer}=req.body;
    if(!questionId || !answer){
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success:false,
        message:"please provide the questionId and answer"
      })
    }

    const userId=req.user._id;
    if(!userId){
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success:false,
        message:"UserId is not provided"
      })
    }
    const role=req.user.role;
    let ForumAnswer={};
    if(role==='student'){
      ForumAnswer=await ForumModel.findByIdAndUpdate(questionId,{
        $push:{
          answers:{
            answer,
            studentId:userId,
            vote:0,
            role
          }
        }
      })
    }else if(role==='teacher'){
      ForumAnswer=await ForumModel.findByIdAndUpdate(questionId,{
        $push:{
          answers:{
            answer,
            teacherId:userId,
            vote:0,
            role
          }
        }
      })
    }
    
    if(!ForumAnswer){
      return res.status(httpStatusCode.NOT_FOUND).json({
        success:false,
        message:"Forum question is not found"
      })
    }

    return res.status(httpStatusCode.OK).json({
      success:true,
      message:"Answer added successfully",
      data:ForumAnswer
    })

  }catch(error){
    console.log(error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success:false,
      message:"Something went wrong!!",
      error:error.message
    })
  }
}
module.exports = {
  AddQuestion,
  ViewForumQuestionList,
  ViewForumWithQuestionId,
  AddForumAnswer
};
