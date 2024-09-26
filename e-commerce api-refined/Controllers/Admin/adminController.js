const ErrorHandler = require("../../Utils/errorHandler");
const { SuccessHandler } = require("../../Middlewares/responseHandler");
const adminService = require("../../Services/adminService");
const userService = require("../../Services/userService");
const Notification = require("../../Models/NotificationModel"); 


class AdminController {
    async registerAdminController(req, res, next) {
        try {
            const { name, email, username, password } = req.body; 

            // Check if the email already exists
            const checkEmail = await adminService.checkEmailService(email);
            if (checkEmail) {
                return next(new ErrorHandler("This Email ID is already used.", 400));
            }

            // Register the new admin
            const user = await adminService.registerService({ name, email, username, password });
            if (user && user.success) {
                return SuccessHandler(res, user.msg, user.status, user.data);
            } else {
                return next(new ErrorHandler(user.msg, user.status, user.data));
            }
        } catch (error) {
            return next(new ErrorHandler("Something went wrong during registration.", 500, error));
        }
    }   

     async loginController(req, res, next) {
             if (!req.body.username || req.body.username.trim() === "") {
                return next(new ErrorHandler("Username cannot be blank!", 400, {}));
            }
             if (!req.body.password || req.body.password.trim() === "") {
                return next(new ErrorHandler("Password cannot be blank!", 400, {}));
             }
             
             return Promise.resolve(adminService.loginService(req.body)).then(async(data) => {
                        if (data && data.success) {
                            console.log(`Login success, token generated: ${data.data.token}`); // Debug logging
                            return SuccessHandler(res, data.msg, data.status, data.data);
                        } else {
                            return next(new ErrorHandler(data ? data.msg : "Login failed", data ? data.status : 400, {}));
                        }
                    })
                    .catch((error) => {
                        return next(new ErrorHandler("Something went wrong while logging in.", 500, error));
                    });
    }

    async   getProfile(req, res, next) {
        return Promise.resolve(adminService.getProfileService(req.decoded.id)).then((data) => {
            if (data.success) {
                SuccessHandler(res, data.msg, data.status, data.data)
            } else {
                return next(new ErrorHandler(data.msg, data.status, data.data));
            }
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
        const adminId = req.decoded.id; // Get the admin's ID from the decoded token
        const result = await adminService.updatePasswordService(adminId, old_password, new_password);
        
        if (result.success) {
            return SuccessHandler(res, result.msg, result.status, result.data);
        } else {
            return next(new ErrorHandler(result.msg, result.status, result.data));
        }
    } catch (error) {
        return next(new ErrorHandler("Something went wrong while updating the password.", 500, error));
    }

}

// ================================  PRICEING ================================ //

    async getTotalProducts(req, res, next) {
        try {
            const totalProducts = await adminService.getTotalProductsService();
            SuccessHandler(res, "Total products fetched successfully", 200, { total: totalProducts });
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while fetching total products.", 500, error));
        }
    }

    async updateAdminStats(cart) {
        const totalRevenue = cart.reduce((total, item) => {
            return total + (item.quantity * item.productId.price); // Assuming Product has a price field
        }, 0);
    
        // Create an admin notification
        const notification = new AdminNotification({
            totalProducts: cart.length,
            totalRevenue, // This might be NaN
            totalOrders,
        });
    
        await notification.save(); // Save notification or handle as needed
    }
    

    async getTotalOrders(req, res, next) {
        try {
            const totalOrders = await adminService.getTotalOrdersService();
            SuccessHandler(res, "Total orders fetched successfully", 200, { total: totalOrders });
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while fetching total orders.", 500, error));
        }
    }

    async getTotalRevenue(req, res, next) {
        try {
            const {totalRevenue, orderDetails} = await adminService.getTotalRevenueService();
            SuccessHandler(res, "Total revenue fetched successfully", 200, { total: totalRevenue, orders: orderDetails });
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while fetching total revenue.", 500, error));
        }
    }
    
    // ==================================== NOTIFICATON ======================================== //

    async getAdminNotifications(req, res, next) {
        try {
            const notifications = await Notification.find().sort({ createdAt: -1 }); // Get latest notifications
            return res.status(200).json({
                ResponseCode: 200,
                ResponseMessage: "Notifications fetched successfully.",
                succeeded: true,
                ResponseData: notifications
            });
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while fetching notifications.", 500, error));
        }
    }

}
module.exports = new AdminController()




