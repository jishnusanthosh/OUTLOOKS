const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    orderedItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
        },
        quantity: {
          type: Number,
        },
        address: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Address",
        },
      },
    ],
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },
    orderDate: {
      type: Date,
    },
    totalAmount: {
      type: Number,
    },
    realAmount: {
      type: Number,
    },
    couponAmount: {
      type: Number,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "RazorPay", "wallet"],
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "cancelled","refund"],
      default: "pending",
    },
    refund: {
      type: Number,
    },
    orderStatus: {
      type: String,
    },
    returnStatus: {
      type: String,
      enum: ["pending", "return accepted", "rejected"],
      default: "pending",
    },

    returnReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
