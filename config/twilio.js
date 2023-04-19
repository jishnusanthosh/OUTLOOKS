// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
// import  twilio  from "twilio";
import  dotenv  from "dotenv";
dotenv.config();



const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;



const client = require('twilio')(accountSid, authToken);

const twilioFunctions = {
    client,
  
    verifySid,
  
    generateOTP: async (phonenumber) => {
      
      client.verify.v2
        .services('VA4259df10a0bfce7007314b20be4b6876')
        .verifications.create({ to: `+91${phonenumber}`, channel: "sms" }).then(service => console.log(service.sid));;
    },
  };                             
  
  export default twilioFunctions;