const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
      user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
          required: true,
      },
      orderedItems:[
          {
              product:{
                  type:mongoose.Schema.Types.ObjectId,
                  ref:'Products'
              },
              quantity:Number
          }
      ],
      address:mongoose.Schema.Types.ObjectId,
      orderDate:Date,
      totalAmount: Number,
      // finalAmount:Number,
      paymentMethod: String,
      orderStatus: String
  },
  {
      timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
