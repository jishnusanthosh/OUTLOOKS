import { db } from "../config/database";
import { collections } from "../config/collections";
import { User } from "../models/userModels";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


import dotenv from "dotenv";
dotenv.config();





// Create new user
const createUser = async ({ username, email, password }) => {
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    username,
    email,
    password: hashedPassword
  });
  return user.save();
};


// Find user by email
const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

// Verify user password
const verifyUserPassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, 'secretkey');
};

export default {
  createUser,
  findUserByEmail,
  verifyUserPassword,
  generateToken
};