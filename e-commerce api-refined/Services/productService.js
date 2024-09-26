const Product = require("../Models/productModel");
const User = require("../Models/UserModel"); 
const Order = require('../Models/orderModel'); // Adjust the path if necessary
const Notification = require("../Models/NotificationModel");
const { SuccessHandler } = require("../Middlewares/responseHandler");


class ProductService {
    async addProduct(data) {
        const newProduct = new Product(data);
        return await newProduct.save();
    } 

    async getAllProducts() { return await Product.find({}) };

    async getProductById(id) { return await Product.findById(id) };
   
    async updateProductById(id, updatedData) { return await Product.findByIdAndUpdate(id, updatedData, { new: true }) };
    
    async deleteProduct(id) { return await Product.findByIdAndDelete(id) };


// ==================================== User Cart Management ============================== //    
    
async placeDirectOrder(userId, products, address) {
    try {
        // Fetch product details for each item
        const orderProducts = await Promise.all(products.map(async item => {
            const product = await Product.findById(item.productId); // Fetch the product details
            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }
            return {
                productId: product._id,
                quantity: item.quantity,
                price: product.price,
            };
        }));

        // Calculate the total price
        const totalPrice = orderProducts.reduce((acc, item) => acc + (item.quantity * item.price), 0);

        // Create a new order
        const newOrder = new Order({
            userId,
            products: orderProducts,
            address,
        });

        await newOrder.save();

        // Notify the admin when an order is placed
        await Notification.create({
            message: `User ${userId} placed an order.`,
            userId,
            orderId: newOrder._id,
            createdAt: new Date(),
        });

        return { success: true, msg: "Order placed successfully", status: 201, orderDetails: newOrder, totalPrice };
    } catch (error) {
        console.error("Error placing order:", error);
        return { success: false, msg: "Error placing order", status: 500 };
    }
}

}

module.exports = new ProductService();
       