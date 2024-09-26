const express = require("express")
const router = express.Router()

const auth = require("../Middlewares/auth");
const validate = require("../Middlewares/validation");
const verifyUserLogin = require("../Middlewares/verifyUserLogin");

const userController = require("../Controllers/user/userController");
const UserProductController = require("../Controllers/user/productController");



// ============================= ROUTES ==================================== //
router.post("/register",validate.registerValidate, validate.isRequestValidate, userController.registerController);
router.post('/login', validate.loginValidate, validate.isRequestValidate, userController.loginController);
router.get('/get_profile', auth.privateAuth, userController.getUserProfileController); 
router.post('/update_new_password', auth.privateAuth, validate.updatedPwdValidate, validate.isRequestValidate, 
    userController.updatePasswordController );

//* ========================CART ROUTES======================== */
router.get('/get-cart', auth.privateAuth, userController.getCart );
router.post('/add-to-cart/:id', auth.privateAuth, userController.addToCartGET);
router.post('/change-product-quantity', auth.privateAuth, userController.changeCartProductQuantityPOST);
router.post('/delete-product-from-cart/:id', auth.privateAuth, userController.deleteCartProductPOST);
router.post('/empty-cart', auth.privateAuth, userController.emptyCartGET);
    

/* ========================ORDERS ROUTES======================== */
router.post('/place-order-cart',verifyUserLogin, userController.placeOrderCartPOST)                        // order from cart    
router.get('/orders',verifyUserLogin, userController.userOrdersGET);                                  // all orders 
router.post('/ordered-product-details',verifyUserLogin, userController.userOrderDetailsPOST);         // single order details 


// ============================= User Product Routes ============================= //
router.post('/get-product-info', UserProductController.getProductInfoController);            // this only show product details directly
router.post('/place-order', auth.privateAuth, UserProductController.placeOrder);             // Directly place order 


module.exports = router


    
    