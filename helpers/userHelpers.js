import mongoose from "mongoose";

import  User  from "../models/userModels";

import bcrypt from "bcrypt";



import dotenv from "dotenv";
dotenv.config();

export default {
  doSignUp: (body) => {
    return new Promise(async (resolve, reject) => {
      try {
        var oldUser = await User.findOne({ email: body.email});
        let newpassword=await bcrypt.hash(body.password, 10)
        if (oldUser) {
          // If an existing user is found, return an object with status=true
          resolve({ status: true , user:null });
        } else {
          // Otherwise, create a new user, save it to the database, and return an object with status=false and the saved user object
          const newUser = new User({
            username: body.username,
            email: body.email,
            password:newpassword,
          });
          var savedUser = await newUser.save();
          resolve({ status: false, user: savedUser});
        }
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },

  doLogin: (user) => {
    return new Promise(async (resolve, reject) => {
      try {
        var validUser = await User.findOne({ email: user.email });
        console.log(validUser);
        if (validUser) {
          if (true) {
            const isPasswordMatch = await bcrypt.compare(
              user.password,
              validUser.password
            );
            if (isPasswordMatch) {
              resolve({ status: true, user: validUser });
            } else {
              console.log("Login Failed");
              resolve({ status: false });
            }
          } else {
            console.log("User account is not active.");
            resolve({ status: false });
          }
        } else {
          console.log("No User Found!");
          resolve({ status: false });
        }
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },

}