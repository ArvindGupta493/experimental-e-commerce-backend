const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true,},
    address: {  type: String, required: true },
    products: [{
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true,},
            price: { type: Number, required: true } ,
            // totalprice: { type: Number, required: true }                          // is wrong latest update thats why check again
        }],
}, { timestamps: true });
// Virtual to calculate the total amount
orderSchema.virtual('totalAmount').get(function () {
    return this.products.reduce((acc, product) => {
        return acc + (product.price * product.quantity);
    }, 0);
});

module.exports = mongoose.model("Order", orderSchema);






