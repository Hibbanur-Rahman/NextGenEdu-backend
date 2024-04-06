const express = require("express");
const Router = express.Router();
const { register, login } = require("../controller/adminController");
const { registerUser, loginUser,ViewUsers } = require("../controller/userController");
const { verifyToken } = require("../middleware/authMiddleware");



Router.post("/register", register);
Router.post("/login", login);

Router.post("/user-Register", registerUser);
Router.post("/user-Login",loginUser);
Router.get('/view-Users',verifyToken,ViewUsers);

module.exports = Router;
