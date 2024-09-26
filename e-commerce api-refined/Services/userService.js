const Order = require("../Models/orderModel");
const User = require("../Models/UserModel");
const Product = require("../Models/productModel");
const AdminNotification = require("../Models/NotificationModel"); // New model for admin notifications
const UserModel = require("../Models/UserModel");
const bcrypt = require('bcrypt');


class UserService {
    async registerService(userData) {
        const newUser = new UserModel(userData);
        await newUser.savePassword(userData.password);
        await newUser.save();
        return { success: true, msg: "User registered successfully", data: newUser };
        console.log("User saved successfully:", newUser);

    }

    // Authenticate the user
    async loginService({ username, password }) {
        const user = await UserModel.findOne({ username }).select('+password');
        if (!user) {
            return { success: false, msg: "Invalid username or password", status: 401 };
        }

        const isMatch = await user.checkPassword(password);        // no this work & because of savepassword used in ofr newdata
        // const isMatch = user.password === password ? true : false      // this also works but unsecure   
        // console.log("ismatch", isMatch);                        // used to check the password is matching or not
        
        if (!isMatch) {
            return { success: false, msg: "Invalid password", status: 401 };
        }
        const token = this.generateToken(user);            // Generate a token (implement the token generation logic)
        return {
            success: true,
            msg: "Login successful",
            status: 200,
            data: {
                userId: user._id,
                username: user.username,
                token,
            }
        };
    }
    generateToken(user) {
        // Implement token generation logic (e.g., using JWT)
        // Example:
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: user._id }, process.env.PRIVATE_KEY, { expiresIn: '6h' });
        return token;
    }

//======== get profile======= // 
    async getUserProfileService(userId) {
        try {
            const user = await UserModel.findById(userId).select("-password"); // Exclude the password field
            if (!user) {
                return { success: false, msg: "User not found", status: 404 };
            }

            return {
                success: true,
                msg: "User profile fetched successfully",
                status: 200,
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                }
            };
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return { success: false, msg: "Error fetching user profile", status: 500 };
        }
    }

// =============================================== Update Password ============================================== //          
    async updatePasswordService(userId, oldPassword, newPassword) {
        const user = await UserModel.findById(userId);
          if (!user) {
            return { success: false, msg: "User not found", status: 404 };
        }

    // Verify the old password
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            return { success: false, msg: "Old password is incorrect", status: 401 };
        }

    // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword; // Update the password

        await user.save(); // Save the updated user document
        return { success: true, msg: "Password updated successfully", status: 200 };
    }
    
    // ============================================ CART FUCNTIONS ================================================================= //
  

    async getCartService(user_id) {
        try {
            const user = await UserModel.findById(user_id).select('cart');  //Find the user by their ID and select only the cart field
         
            if (!user) {                                                    // Check if the user exists
                return { success: false, msg: "User not found", status: 404 };
            }
            return { success: true, msg: "Cart fetched successfully", status: 200, data: user.cart };    // Return the user's cart
        } catch (error) {
            console.error("Error fetching cart:", error);
            return { success: false, msg: "Failed to fetch cart", status: 500 };
        }
    }
    
    async addToCartService({ user_id, productId, quantity }) {
        try {
            let user = await UserModel.findById(user_id);           // Find the user by their ID
            if (!user) {return { success: false, msg: "User not found", status: 404 }}
    
            // Check if the product already exists in the user's cart
            const cartItem = user.cart.find(item => item.productId.toString() === productId);
            if (cartItem) {                      
                cartItem.quantity += quantity;         // If product already exists, increase the quantity             
            } else {
                user.cart.push({                       // If product doesn't exist, add a new item to the cart
                    productId: productId,
                    quantity: quantity
                });
            }
            await user.save();                        // Save the updated user document with the updated cart
            return { success: true, msg: "Product added to cart successfully", status: 200, data: user.cart };
        } catch (error) {
            return { success: false, msg: "Error adding product to cart", status: 500, data: error };
        }
    }
    
    async changeCartProductQuantityService({ user_id, productId, quantity }) {
        try {        
            let user = await UserModel.findById(user_id);                // Find the user by their ID
            if (!user) {return { success: false, msg: "User not found", status: 404 }}
    
            // Check if the product exists in the user's cart
            const cartItem = user.cart.find(item => item.productId.toString() === productId);
    
            if (!cartItem) {return { success: false, msg: "Product not found in cart", status: 404 }}
    
            // If the quantity is less than or equal to 0, remove the product from the cart
            if (quantity <= 0) { 
                user.cart = user.cart.filter(item => item.productId.toString() !== productId);
            } else {cartItem.quantity = quantity}             // Otherwise, update the quantity of the product
          
            await user.save();                              // Save the updated user document with the modified cart
          
            return { success: true, msg: "Product quantity updated successfully", status: 200, data: user.cart };
        } catch (error) {
            return { success: false, msg: "Error updating product quantity", status: 500, data: error };
        }
    }
    
    async deleteCartProductService({user_id, productId }){
        try {
            const user = await UserModel.findById(user_id);                     // Find the user by ID
            if (!user) {
                return { success: false, msg: "User not found", status: 404 };
            }
            // Check if the product exists in the cart
            const cartProductIndex = user.cart.findIndex(item => item.productId.toString() === productId);
            if (cartProductIndex === -1) {
                return { success: false, msg: "Product not found in cart", status: 404 };
            }
            user.cart.splice(cartProductIndex, 1);                             // Remove the product from the cart
            await user.save();                                                 // Save the updated user document
    
            return { success: true, msg: "Product removed from cart successfully", status: 200, data: user.cart };
        } catch (error) {
            console.error("Error deleting product from cart:", error);
            return { success: false, msg: "Failed to delete product from cart", status: 500 };
        }
    }

    async emptyCartService( user_id ){
        try {
            const user = await UserModel.findById(user_id);                     // Find the user by ID
            if (!user) {  return { success: false, msg: "User not found", status: 404 } }

            user.cart = [];                                                    // Empting cart
            await user.save();                                            
    
            return { success: true, msg: "Cart Empty Succcesfull", status: 200, data: user.cart };
        } catch (error) {
            console.error("Error Empting cart:", error);
            return { success: false, msg: "Failed to Empty cart", status: 500 };
        }
    }

   
    
    // ============================================ ORDER FUNCTION ======================================================= // 

    async placeOrderCartService(userId, address) {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found.");
    
        const cart = user.cart;
        if (cart.length === 0) throw new Error("Cart is empty.");
    
        // Fetch product details with prices
        const populatedCart = await Promise.all(cart.map(async item => {
            const product = await Product.findById(item.productId);
            return {productId: product._id, quantity: item.quantity, price: product.price // Include price in the order
            };
        }));
    
        const order = new Order({ userId, address, products: populatedCart });
    
        await order.save();
        await this.updateAdminStats(populatedCart);                                    // Update total revenue with populated cart
    
        user.cart = [];                                                                // Clear cart after order placement
        await user.save();
    
        const bill = this.generateBill(order);                                        // Generate bill for the user
        return { success: true, msg: "Order placed successfully", data: { order, bill } };
    }
    
    generateBill(order) {
        // Ensure that products in the order have proper details like price and quantity
        const billDetails = {
            orderId: order._id,
            products: order.products.map(item => ({
                productId: item.productId,        // Use the product ID
                quantity: item.quantity,          // Use the quantity
                price: item.price,                // Fetch price from the populated product
                total: item.quantity * item.price // Calculate total per product
            })),
            totalAmount: order.products.reduce((total, item) => {
                return total + (item.quantity * item.price); // Add up all the totals
            }, 0)
        };
        return billDetails;
    }
    
    // generateBill(order) {
    //     const billDetails = {
    //         orderId: order._id,
    //         products: order.products.map(item => ({
    //             productId: item.productId._id, name: item.productId.name, quantity: item.quantity, price: item.productId.price,
    //             total: item.quantity * item.productId.price,
    //         })),
    //         totalAmount: order.products.reduce((total, item) => total + (item.quantity * item.productId.price), 0),
    //     };
    //     return billDetails;
    // }


    async updateAdminStats(cart) {
        console.log("Cart Items:", cart);                          // Debugging line to check cart items
    
        const totalRevenue = cart.reduce((total, item) => {
            const itemPrice = item.price || 0;                    // Default to 0 if price is not defined
            const itemQuantity = item.quantity || 0;              // Default to 0 if quantity is not defined
    
            console.log(`Item Price: ${itemPrice}, Item Quantity: ${itemQuantity}`);     // Log values
    
            return total + (itemPrice * itemQuantity);
        }, 0);
    
        // Ensure totalRevenue is a valid number
        if (isNaN(totalRevenue)) {
            throw new Error("Calculated total revenue is not a number");
        }
    
        // Update the admin notification or other relevant documents here
        await AdminNotification.updateOne({}, { $inc: { totalRevenue } });
    }


    async getUserOrdersService(userId) {
        try {
            // Fetch orders with product details
            const orders = await Order.find({ userId }).populate("products.productId");
    
            // Loop through each order to calculate total price for each product
            const ordersWithProductTotal = orders.map(order => {
                const productsWithTotalPrice = order.products.map(productItem => {
                    const totalPrice = productItem.price * productItem.quantity;  // Calculate the total price for each product
                    return {
                        ...productItem._doc,                    // Spread existing product fields
                        totalPrice                              // Add computed total price
                    };
                });
    
                return {
                    ...order._doc,                              // Spread existing order fields
                    products: productsWithTotalPrice            // Add products with total prices
                };
            });
    
            return { success: true, msg: "Orders fetched successfully", status: 200, data: ordersWithProductTotal };
        } catch (error) {
            console.error("Error fetching user orders:", error);
            return { success: false, msg: "Failed to fetch orders", status: 500, data: {} };
        }
    }
    
    //  normal function but without total price 

    // async getUserOrdersService(userId) {
    //     try {
    //         const orders = await Order.find({ userId }).populate("products.productId");
    //         return { success: true, msg: "Orders fetched successfully", status: 200, data: orders };
    //     } catch (error) {
    //         console.error("Error fetching user orders:", error);
    //         return { success: false, msg: "Failed to fetch orders", status: 500, data: {} };
    //     }
    // }
    

    async getOrderProductDetailsService(userId, orderId, productId) {
        const order = await Order.findOne({ _id: orderId, userId }).populate("products.productId");

        if (!order) {
            return { success: false, msg: "Order not found", status: 404, data: {} };
        }
        // Find the specific product in the order's products array
        const orderedProduct = order.products.find((item) => item.productId._id.toString() === productId);
          
        // Calculate the total price for the product (price * quantity)
        const totalPrice = orderedProduct.price * orderedProduct.quantity;

        if (!orderedProduct) {
            return { success: false, msg: "Product not found in order", status: 404, data: {} };
        }

        return { 
            success: true, 
            msg: "Product details fetched successfully", 
            status: 200, 
            data: {
                product: orderedProduct.productId, // Full product details from the populated field
                quantity: orderedProduct.quantity,
                price: orderedProduct.price,
                totalPrice
            } 
        };

    } catch (error) {
        console.error("Error fetching ordered product details:", error);
        return { success: false, msg: "Failed to fetch product details", status: 500, data: {} };
    }

}

module.exports = new UserService();
  