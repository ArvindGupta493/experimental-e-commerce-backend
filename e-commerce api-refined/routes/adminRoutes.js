const express = require("express")
const router = express.Router()

const auth = require("../Middlewares/auth")
const validate = require("../Middlewares/validation")

const userController = require("../Controllers/Admin/userController");
const adminController = require("../Controllers/Admin/adminController");
const productController = require("../Controllers/Admin/productController");

//===================================== Auth ====================================== //
router.post("/register",  validate.adminRegisterValidate, validate.isRequestValidate, adminController.registerAdminController);
router.post('/login', validate.adminLoginValidate, validate.isRequestValidate, adminController.loginController);
router.get('/get-profile', auth.adminAuth, adminController.getProfile);
router.post('/update-password', auth.adminAuth, adminController.updatePasswordController);

 
// ================================ User Management ================================ //
router.get('/get-users-count', auth.adminAuth, userController.getUsersCountController);
router.get('/get-user-list', auth.adminAuth, userController.getUserListController);
router.get('/get-user-info/:id', auth.adminAuth, userController.getUserInfoByIdController);



// ============================= Admin Product Routes ============================= //
router.post('/add-product', auth.adminAuth, validate.productValidate, validate.isRequestValidate, productController.addProduct);
router.get('/get-products', auth.adminAuth, productController.getProducts);
router.put('/update-product/:id', auth.adminAuth, validate.productValidate, validate.isRequestValidate, productController.updateProduct);
router.delete('/remove-product/:id', auth.adminAuth, productController.deleteProduct);

// =================================  NOTIFICATIONS =========================================== //
router.get('/notifications', auth.adminAuth, adminController.getAdminNotifications);  


//============================= Admin Statistics Routes ====================================== //
router.get('/total-products', auth.adminAuth, adminController.getTotalProducts);
router.get('/total-orders', auth.adminAuth, adminController.getTotalOrders);
router.get('/total-revenue', auth.adminAuth, adminController.getTotalRevenue);


module.exports = router





