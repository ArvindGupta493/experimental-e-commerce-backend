const ErrorHandler = require("../../Utils/errorHandler");
const { SuccessHandler } = require("../../Middlewares/responseHandler");
const adminService = require("../../Services/adminService")

class UserController{
    async getUserListController(req, res, next) {
        try {
            const users = await adminService.getUserListService();
            if (users && users.length > 0) {
                return SuccessHandler(res, "User list fetched successfully", 200, users);
            } else {
                return SuccessHandler(res, "No users found", 200, []);
            }
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while fetching the user list.", 500, error));
        }
    }

    
    async getUserInfoByIdController(req, res, next) {
        const userId = req.params.id;

        if (!userId) {
            return next(new ErrorHandler("User ID is required", 400));
        }

        try {
            const userInfo = await adminService.getUserInfoByIdService(userId);
            if (userInfo) {
                return SuccessHandler(res, "User information retrieved successfully", 200, userInfo);
            } else {
                return next(new ErrorHandler("User not found", 404));
            }
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while retrieving user information.", 500, error));
        }
    }
 
    async getUsersCountController(req, res, next) {
        try {
            const count = await adminService.getUsersCountService();
            SuccessHandler(res, "User count fetched successfully", 200, { total: count });
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while fetching user count.", 500, error));
        }
    }
}

module.exports = new UserController()
