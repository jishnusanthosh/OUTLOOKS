import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    unique: true,
  },
  productColor: {
    type: String,
  },
  productSize: {
    type: String,
    required: true,
    
  },
  productBrand: {
    type: String,
    required: true,
    
  },
  
  productPrice: {
    type: Number,
    required: true,
  },
  productDescription: {
    type: String,
    required: true,
  },
  productImage: {
    type: Array,
     
  },
  
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
  },
  
  productStatus: {
    type: Boolean,
    default: true,
  },
  productQuantity: {
    type: Number,
  },

  
});

const product = mongoose.model("Product", productSchema);

export default product;