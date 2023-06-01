import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require("twilio")(accountSid, authToken);

const twilioFunctions = {
  generateOTP: async (phonenumber) => {
    client,
      client.verify.v2
        .services("VAd7d72ed7e0d900851e1b08c0bffc1f65")
        .verifications.create({ to: `+91${phonenumber}`, channel: "sms" })
        .then((service) => console.log(service.sid));
  },
};

export default twilioFunctions;
