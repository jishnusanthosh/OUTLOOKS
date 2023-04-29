import mongoose from "mongoose";
import twilioFunctions from "../config/twilio";
import User from "../models/userModels";

import bcrypt from "bcrypt";

import dotenv from "dotenv";
dotenv.config();

export default {
  doSignUp: (body) => {
    return new Promise(async (resolve, reject) => {
      try {
        var oldUser = await User.findOne({ email: body.email });
        if (oldUser) {
          // If an existing user is found, return an object with status=true
          resolve({ status: true, user: null });
        } else {
          // Otherwise, create a new user, save it to the database, and return an object with status=false and the saved user object
          const saltRounds = 10;
          let password = body.password.toString();
          let newpassword = await bcrypt.hash(password, saltRounds);
          const newUser = new User({
            username: body.username,
            email: body.email,
            password: newpassword,
            phonenumber: body.phonenumber,
           
          });
          var savedUser = await newUser.save();
          resolve({ status: false, user: savedUser });
        }
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },

  doLogin: async (user) => {
    try {
      const validUser = await User.findOne({ email: user.email });
      if (validUser) {
        const isPasswordMatch = await bcrypt.compare(
          user.password,
          validUser.password
        );
        if (isPasswordMatch) {
          return { status: true, user: validUser};
        } else {
          console.log("Invalid Password");
          return { status: false };
        }
      } else {
        console.log("User not found");
        return { status: false };
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  generateOtp: (body) => {
    console.log(body);
    return new Promise(async (resolve, reject) => {
      try {
        let customer = await User.findOne({ phonenumber: body});
        console.log(customer);
        if (customer) {
          twilioFunctions.generateOTP(customer.phonenumber);
          // const msg1 = "OTP SENT!!";
          resolve({ status: true,body});
        } else {
          console.log("No User Found!");
          resolve({ status: false});
        }
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },
};
