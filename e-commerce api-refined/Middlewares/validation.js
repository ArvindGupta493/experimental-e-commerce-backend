const { check, validationResult } = require('express-validator');

const validationAuth = {
   

    registerValidate: [
        check('name').trim().notEmpty().withMessage('Please enter Name.'),
        check('email').trim().isEmail().withMessage('Please enter a valid Email.'),
        check('username').trim().notEmpty().withMessage('Please enter Username.'),
        check('password').trim().notEmpty().isStrongPassword().withMessage('Password must be strong.'),
    ],
    loginValidate: [
        check('username').trim().notEmpty().withMessage('Username is required.'),
        check('password').trim().notEmpty().withMessage('Password is required.'),
    ],
    

    updatedPwdValidate: [
        check('new_password')        
        .trim()        
        .notEmpty().withMessage('Please enter new password.')        
        .isLength({ min: 8 }).withMessage("New password must be at least 8 characters long.")        
        .isStrongPassword()        
        .withMessage('Please enter strong password, password should contain (A-Z, a-z, 0-9 and special character ).')
    ],

    // updatedPwdValidate: [
    //     check('password')
    //     .trim()
    //     .notEmpty().withMessage('Please enter Password.')
    //     .isLength({ min: 8 }).withMessage("Password must be atleast 8 character long.")
    //     .isStrongPassword().withMessage('Please enter strong password, password should contain (A-Z, a-z, 0-9 and special character ).'),
    // ],

    adminRegisterValidate: [
        check('name')
            .trim()
            .notEmpty().withMessage('Please enter Name.'),
        
        check('email')
            .trim()
            .notEmpty().withMessage('Please enter Email.')
            .isEmail().withMessage('Please enter a valid Email.'),
        
        check('username')
            .trim()
            .notEmpty().withMessage('Please enter Username.'),
        
        check('password')
            .trim()
            .notEmpty().withMessage('Please enter Password.')
            .isString()
            .isStrongPassword().withMessage('Please enter a strong password, which should contain (A-Z, a-z, 0-9, and special characters).'),
    ],
    adminLoginValidate: [
        check('username')
            .trim()
            .isString()
            .isLength({ min: 3, max: 30 })
            .withMessage("Please enter valid username"),
        check('password')
            .trim()
            .isString()
            .isLength({ min: 6 })
            .withMessage("Password must be atleast 6 character long.")
    ],

    validateLogin: [
        check('uuid')
        .trim()
        .notEmpty().withMessage('uuid is required.')
        .isString()
        .isLength({ min: 2, max: 50 }).withMessage('uuid should be between 2 and 50 characters.'),
        
        // check('email')
        // .trim()
        // .notEmpty().withMessage('Email is required.')
        // .isEmail().withMessage('Invalid email address.'),

        check('login_type')
        .trim()
        .notEmpty().withMessage('Login Type is required.')
    ],  
    
    productValidate: [
        check('name')
            .trim()
            .notEmpty().withMessage('Please enter the product name.'),
        check('price')
            .isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
        check('description')
            .optional()
            .isString().withMessage('Description must be a string.'),
        check('category')
            .trim()
            .notEmpty().withMessage('Please enter the product category.'),
        check('stock')
            .isInt({ gt: 0 }).withMessage('Stock must be a positive integer.'),
        check('image')
            .optional()
            .isURL().withMessage('Image must be a valid URL.')
    ],

     isRequestValidate: (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                "ResponseCode": 400,
                "ResponseMessage": errors.array()[0].msg,
                "succeeded": false,
                "ResponseData": {}
            });
        }
        next();
    },
}

module.exports = validationAuth;

