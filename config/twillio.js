// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
import  dotenv  from "dotenv";
dotenv.config();
import  twilio  from "twilio";


const accountSid = "AC4a78b0520a00f806661d3900ff4e9a18";
const authToken = "da13ed0d469222ffdb5c067879941f1f";
const verifySid = "VA4259df10a0bfce7007314b20be4b6876";



const client = twilio(accountSid, authToken);

const twilioFunctions = {
    client,
  
    verifySid,
  
    generateOTP: async (phonenumber, channel) => {
      return client.verify.v2
        .services(verifySid)
        .verifications.create({ to: `+91${phonenumber}`, channel: channel });
    },
  };                             
  
  export default twilioFunctions;