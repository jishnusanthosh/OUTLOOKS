const Razorpay = require('razorpay');
require('dotenv').config();

var instance = new Razorpay({
  key_id: 'rzp_test_UA5XAiyYBPnvtB',
  key_secret: 'BUTgIQqgLv1vwmf78rQjKMWd',
});

async function generateRazorpay(orderId, totalAmount, userId) {
  var options = {
    amount: totalAmount * 100,
      currency: "INR",
      receipt: orderId,
  };
  
  try {
    const order = await new Promise((resolve, reject) => {
      instance.orders.create(options, function (err, order) {
        if (err) {
          reject(new Error('something goes wrong! while razorpay payment!'+err));
        } else {
          resolve(order);
        }
      });
    });
    
    console.log(order);
    return order;
    
  } catch (error) {
    throw error;
  }
}

module.exports = { generateRazorpay };