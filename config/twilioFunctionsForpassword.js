const dotenv = require('dotenv');
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

const twilioFunctionsForpassword = {
  generateOtpForPassword: async (phonenumber) => {
    client.verify.v2
      .services("VA90f6a161ac014c889176b5d2e630bcde")
      .verifications.create({ to: `+91${phonenumber}`, channel: 'sms' })
      .then((service) => console.log(service.sid));
  },
};

export default twilioFunctionsForpassword;
