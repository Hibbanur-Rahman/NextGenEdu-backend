const express = require("express");
const Router = express.Router();
const { register, login } = require("../controller/adminController");
const { registerUser, loginUser,ViewUsers, ViewStudentDetails, UpdateStudentDetails } = require("../controller/userController");
const { verifyToken } = require("../middleware/authMiddleware");
const { ViewTeacherDetails, UpdateTeacherDetails } = require("../controller/teacherController");
const upload = require("../middleware/multerMiddleware");
const { AddCourse,ViewCourses } = require("../controller/courseController");


Router.post("/register", register);
Router.post("/login", login);

Router.post("/user-Register", registerUser);
Router.post("/user-Login",loginUser);
Router.get('/view-Users',verifyToken,ViewUsers);

//teacher routes
Router.post('/view-teacher-details',verifyToken,ViewTeacherDetails);
Router.post('/update-teacher-details',verifyToken,UpdateTeacherDetails);

//student routes
Router.post('/view-student-details',verifyToken,ViewStudentDetails);
Router.post('/update-student-details',verifyToken,UpdateStudentDetails);

//upload the profile image
Router.post('/upload-profile',upload.single('profileImage'));

//course routes
Router.post('/add-course',verifyToken,AddCourse);
Router.get('/view-courses',ViewCourses)

module.exports = Router;
