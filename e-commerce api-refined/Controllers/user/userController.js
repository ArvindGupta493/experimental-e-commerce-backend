const userService = require("../../Services/userService");
const Promise = require("bluebird")
const { SuccessHandler } = require("../../Middlewares/responseHandler");
const ErrorHandler = require("../../Utils/errorHandler");

class UserController {
   
    async  registerController(req, res, next) {
        try {
            const user = await userService.registerService(req.body);
            return SuccessHandler(res, user.msg, 201, user.data);
        } catch (error) {
            return next(new ErrorHandler("Something went wrong during registration.", 500, error));
        }
    }

    async loginController(req, res, next) {
        try {
            const { username, password } = req.body;
            const user = await userService.loginService({ username, password });

            if (!user.success) {
                return res.status(user.status).json({ success: user.success, message: user.msg });
            }

            return SuccessHandler(res, user.msg, user.status, user.data);
        } catch (error) {
            return next(new ErrorHandler("Something went wrong during login.", 500, error));
        }
    }
    
    

    async getUserProfileController(req, res, next){
        return await Promise.resolve(userService.getUserProfileService(req.decoded.id)).then(async (user) => {
            if (user && user.success) {
                SuccessHandler(res,  user.msg, user.status, user.data );
            } else {
                return next(new ErrorHandler(user.msg, user.status, user.data));
            }
        }).catch((error) => {
            return next(new ErrorHandler("Something want wrong when profile getting.", 500, error));
        })
    }

   
    async updatePasswordController(req, res, next) {
        try {
            const { old_password, new_password } = req.body;
    
            // Validate old and new passwords
            if (!old_password || old_password.trim() === "") {
                return next(new ErrorHandler("Please enter your old password", 400));
            }
            if (!new_password || new_password.trim() === "") {
                return next(new ErrorHandler("Please enter a new password", 400));
            }
            if (new_password.length < 8) {
                return next(new ErrorHandler("New password must be at least 8 characters long", 400));
            }
    
            // Prepare the data for the service
            const userId = req.decoded.id; // Get the user's ID from the decoded token
            const result = await userService.updatePasswordService(userId, old_password, new_password);
            
            if (result.success) {
                return SuccessHandler(res, result.msg, result.status, result.data);
            } else {
                return next(new ErrorHandler(result.msg, result.status, result.data));
            }
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while updating the password.", 500, error));
        }
    
    }
// /*=========================================  CART FEATURES  ==================================================  */ 

    async getCart(req, res, next) {
        try {
            const user = await userService.getCartService(req.decoded.id);     // Call the service to get the user's cart
             
            if (user && user.success) {                                       // Check if the cart fetching was successful
                SuccessHandler(res, user.msg, user.status, user.data);
            } else {
                return next(new ErrorHandler(user.msg, user.status, user.data));
            }
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while fetching the cart.", 500, error));
        }
    }
    
    async addToCartGET(req, res, next) {
        const body = {
            user_id: req.decoded.id,
            productId: req.params.id,
            quantity: 1 // Default quantity can be set here
        };
        return await Promise.resolve(userService.addToCartService(body)).then(user => {
            if (user && user.success) {
                SuccessHandler(res, user.msg, user.status, user.data);
            } else {
                return next(new ErrorHandler(user.msg, user.status, user.data));
            }
        }).catch(error => {
            return next(new ErrorHandler("Something went wrong while adding to cart.", 500, error));
        });
    }

    async changeCartProductQuantityPOST(req, res, next) {
        const { productId, quantity } = req.body;
        const body = {
            user_id: req.decoded.id,
            productId,
            quantity
        };
        return await Promise.resolve(userService.changeCartProductQuantityService(body)).then(user => {
            if (user && user.success) {
                SuccessHandler(res, user.msg, user.status, user.data);
            } else {
                return next(new ErrorHandler(user.msg, user.status, user.data));    
            }
        }).catch(error => {
            return next(new ErrorHandler("Something went wrong while changing product quantity.", 500, error));
        });
    }

    async deleteCartProductPOST(req, res, next) {
        try {
            const { productId } = req.body;
            const body = { user_id: req.decoded.id, productId };
            const user = await userService.deleteCartProductService(body);
            if (user && user.success) {
                SuccessHandler(res, user.msg, user.status, user.data);
            } else {
                throw new ErrorHandler(user.msg, user.status, user.data);
            }
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while deleting product from cart.", 500, error));
        }
    }


    async emptyCartGET(req, res, next) {
        try {
            const user = await userService.emptyCartService(req.decoded.id);
//          return await Promise.resolve(userService.emptyCartService(req.decoded.id)).then(user => {          
//          the upper line can also be used but then promise function need to be applied            

            if (user && user.success) {
                SuccessHandler(res, user.msg, user.status, user.data);
            } else {
                return next(new ErrorHandler(user.msg, user.status, user.data));
            }
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while emptying the cart.", 500, error))
        }
    }
    

    /* =================================== ORDERS =============================================== */

    async  placeOrderCartPOST(req, res, next) {
        const { address, paymentMethod } = req.body;
        try {
            const order = await userService.placeOrderCartService(req.decoded.id, address, paymentMethod);
            SuccessHandler(res, "Order placed successfully", 200, order.data);     // Include bill in the data
        } catch (error) {
            return next(new ErrorHandler("Failed to place the order", 500, error));
        }    
    }

    async userOrdersGET(req, res, next) {
        try {
            const orders = await userService.getUserOrdersService(req.decoded.id);
            if (orders.success) {
                SuccessHandler(res, orders.msg, orders.status, orders.data);
            } else {     
                return next(new ErrorHandler(orders.msg, 404));
            }
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while fetching orders.", 500, error));
        }
    }
    
    async userOrderDetailsPOST(req, res, next) {
        const { orderId, productId } = req.body; // Extract the orderId and productId from the request body
            if (!orderId || !productId) {
                return next(new ErrorHandler("Order ID and Product ID are required", 400));
            }

        // Call the service to get product details from the specific order
        const orderDetails = await userService.getOrderProductDetailsService(req.decoded.id, orderId, productId);
            if (orderDetails.success) {
                    SuccessHandler(res, orderDetails.msg, orderDetails.status, orderDetails.data);
            } else {
                return next(new ErrorHandler(orderDetails.msg, orderDetails.status));
            }
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while fetching ordered product details.", 500, error));
    } 
}

       


module.exports = new UserController()
