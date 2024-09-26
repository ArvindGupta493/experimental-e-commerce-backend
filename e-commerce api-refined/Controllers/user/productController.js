const productService = require("../../Services/productService");
const { SuccessHandler } = require("../../Middlewares/responseHandler");
const ErrorHandler = require("../../Utils/errorHandler");

class UserProductController {
    async getProductInfoController(req, res, next) {
        try {
            const productId = req.body.productId; // Assuming you send product ID in the body
            const product = await productService.getProductById(productId);
            SuccessHandler(res, "Product information retrieved successfully", 200, product);
        } catch (error) {
            return next(new ErrorHandler("Error retrieving product information", 500, error));
        }
    }

    async placeOrder(req, res, next) {
        try {
            const userId = req.decoded.id;
            const { products, address } = req.body;     // Extract both products and address from req.body
            
            // Check if products and address are provided
            if (!products || products.length === 0) {                                      
                return next(new ErrorHandler("Products are required to place an order", 400));
            };
            if (!Array.isArray(products)) {            // Array is used order placed for both single and multiple products 
                products = [products];                 // If a single product is sent (not an array), wrap it in an array
            };

            if (!address) {
                return next(new ErrorHandler("Address is required to place an order", 400));
            };

            // Pass products and address to service
            const orderDetails = await productService.placeDirectOrder(userId, products, address);  
            SuccessHandler(res, "Order placed successfully", 201, orderDetails);
        } catch (error) {
            return next(new ErrorHandler("Error placing order", 500, error));
        }
    } 
}

module.exports = new UserProductController();
