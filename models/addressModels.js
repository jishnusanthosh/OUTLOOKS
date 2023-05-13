
import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
    full_name: {
      type: String,
      required: true,
    },
  
    street_name: {
      type: String,
      required: true,
    },
    apartment_number: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    postal_code: {
      type: String,
      required: true,
    },
    mobile_Number: {
      type: String,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    default_address: {
      type: Boolean,
      default: false,
      required: true,
    },
  });
  
  const Address = mongoose.model("Address", AddressSchema);
  
  export default Address;