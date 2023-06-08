import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
    offerTitle: {
        type: String,
        required: true,
      },
      discount: {
        type: Number,
        required: true,
      },
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
      },
      endDate: {
        type: Date,
        required: true,
      },
      offerApplied:{
        type: Boolean,
        default: false,
      }
});

const Offer = mongoose.model("offer", offerSchema);

export default Offer;