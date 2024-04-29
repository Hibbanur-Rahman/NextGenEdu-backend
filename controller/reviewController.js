const ReviewModel = require('../models/reviewModel');
const UserModel = require('../models/userModel');
const CourseModel = require('../models/courseModel');
const httpStatusCode = require('../constant/httpStatusCode');
const { validationResult } = require('express-validator');

const AddReview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(httpStatusCode.BAD_REQUEST).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { courseId, rating, reviewText } = req.body;
        const userId = req.user._id;

        if (!courseId || !userId) {
            return res.status(httpStatusCode.BAD_REQUEST).json({
                success: false,
                message: "CourseId or userId is missing",
            });
        }

        const review = await ReviewModel.create({
            course: courseId,
            student: userId,
            rating,
            reviewText
        });

        const course = await CourseModel.findByIdAndUpdate(courseId, {
            $push: { reviews: review._id }
        }, { new: true });

        if (!course) {
            await ReviewModel.findByIdAndDelete(review._id); // Rollback review creation
            return res.status(httpStatusCode.NOT_FOUND).json({
                success: false,
                message: "Course not found",
            });
        }

        const user = await UserModel.findByIdAndUpdate(userId, {
            $push: { reviews: review._id }
        }, { new: true });

        if (!user) {
            await ReviewModel.findByIdAndDelete(review._id); // Rollback review creation
            return res.status(httpStatusCode.NOT_FOUND).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(httpStatusCode.CREATED).json({
            success: true,
            message: "Review added successfully",
            data: review,
        });

    } catch (error) {
        return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
}

module.exports = {
    AddReview
}
