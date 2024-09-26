const productService = require("../../Services/productService");
const { SuccessHandler } = require("../../Middlewares/responseHandler");
const ErrorHandler = require("../../Utils/errorHandler");

class ProductController {
    async addProduct(req, res, next) {
        try {
            const product = await productService.addProduct(req.body);
            const productLength = Object.keys(product).length;
            console.log('productLength:::',productLength);
            
            if( productLength==4 ){                    // why the product length is 4 instead of 6

                SuccessHandler(res, "Product added successfully", 200, product);
            }
        } catch (error) {
            return next(new ErrorHandler("Error adding product", 500, error));
        }
    }

    async getProducts(req, res, next) {
        try {
            const products = await productService.getAllProducts();
            SuccessHandler(res, "Products retrieved successfully", 200, products);
        } catch (error) {
            return next(new ErrorHandler("Error retrieving products", 500, error));
            
        }
    }

    async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const updatedData = req.body; 
    
            const updatedProduct = await productService.updateProductById(id, updatedData); 
            if (!updatedProduct) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
            }
            SuccessHandler(res, "Product updated successfully", 200, updatedProduct);
        } catch (error) {
            return next(new ErrorHandler("Error updating product", 500, error));
        }
    }
    

    async deleteProduct(req, res, next) {
        try {
            await productService.deleteProduct(req.params.id);
            SuccessHandler(res, "Product deleted successfully", 200);
        } catch (error) {
            return next(new ErrorHandler("Error deleting product", 500, error));
        }
    }
}

module.exports = new ProductController();
