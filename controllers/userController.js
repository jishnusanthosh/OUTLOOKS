import express from 'express';
import dotenv from "dotenv";
dotenv.config();
import userHelper from "../helpers/userHelpers";


const user=true;
const router = express.Router();


const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET);
};

// Render signup page
const getHome = (req, res, next) => {
  res.render('shop/home.ejs', { title: 'Home' });
};



const getSignup = (req, res, next) => {
  res.render('shop/userlogin/signup.ejs', { title: 'Sign Up' });
};
const getLogin = (req, res, next) => {
  res.render('shop/userlogin/login.ejs', { title: 'Log In' });
};

// Sign up user
const DosignUp = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await userHelper.findUserByEmail(email);
    if (userExists) {
      res.render('shop/userlogin/signup.ejs', { title: 'Sign Up' });
    }
    const user = await userHelper.createUser({ username, email, password });
    const token = userHelper.generateToken(user._id);
    res.status(201).json({
      message: 'User created',
      token
    });
  } catch (err) {
    res.status(500).json({
      error: err
    });
  }
};

// Render login page


// Log in user
const DologIn = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await userHelper.findUserByEmail(email);
    if (!user) {
      res.render('shop/userlogin/login.ejs', { title: 'Log In' });
    }
    const result = await userHelper.verifyUserPassword(password, user.password);
    if (!result) {
      return res.status(401).json({
        message: 'Authentication failed'
      });
    }
    const token = userHelper.generateToken(user._id);
    res.status(200).json({
      message: 'Authentication successful',
      token
    });
  } catch (err) {
    res.status(500).json({
      error: err
    });
  }
};



export default {
getSignup,
  DosignUp,
  getLogin,
  DologIn,
  getHome
};