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
    const tagsList = tags.split(',');

    const Forum = await ForumModel.create({
      question,
      description,
      tags:tagsList,
      userId,
      role: req.user.role
    });

    let userUpdateQuery = {};
    if (req.user.role === "student") {
      userUpdateQuery = { $push: { forumQuestion: Forum._id } };
    } else if (req.user.role === "teacher") {
      userUpdateQuery = { $push: { forumQuestion: Forum._id } };
    }

    const User = req.user.role === "student" ? StudentModel : TeacherModel;
    const updatedUser = await User.findByIdAndUpdate(userId, userUpdateQuery, { new: true });

    if (!updatedUser) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: `${req.user.role} is not found and push the forum question`,
      });
    }

    return res.status(httpStatusCode.CREATED).json({
      success: true,
      message: "Question added",
      data: Forum
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

module.exports = {
  AddQuestion,
};
