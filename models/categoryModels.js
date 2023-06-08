import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  CategoryName: {
    type: String,
    required: true,
    unique: true,
  },
  
  CategoryDescription: {
    type: String,
  },
  isListed: {
    type: Boolean,
    default: true,
  },
  offerApplied:{
    type: Boolean,
    default: false,
  }
});

const Category = mongoose.model("category", categorySchema);

export default Category;