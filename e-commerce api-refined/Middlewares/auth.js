const jwt = require("jsonwebtoken")
const Promise = require("bluebird")

class Authentication{
  
    privateAuth(req, res, next) {
        var token = req.headers.authorization;

        // Check if authorization header exists
        if (!token) {
            return res.status(401).json({"ResponseCode": 401,"ResponseMessage": "Authorization header is missing.","succeeded": false,"ResponseData": {}});
        }
        token = token.split(' ');                                              // Split the token and check if it's in the correct format
        if (token[0] !== 'Bearer' || !token[1]) {
            return res.status(401).json({"ResponseCode": 401,"ResponseMessage": "Invalid token format.","succeeded": false,"ResponseData": {} });
        }

        token = token[1];                                                     // Extract the actual token
        var privatekey = process.env.PRIVATE_KEY;
        jwt.verify(token, privatekey, (err, decoded) => {                     // Verify the token                          
            if (err) {
                return res.status(401).json({"ResponseCode": 401,"ResponseMessage": "Invalid token.","succeeded": false,"ResponseData": { token }});
            } else {
                req.decoded = decoded;
                next();
            }
        });
    }


    adminAuth(req, res, next) {
        var token = req.headers.authorization;
    
        // Check if authorization header exists
        if (!token) {
            return res.status(401).json({ 
                "ResponseCode": 401, "ResponseMessage": "Authorization header is missing.", "succeeded": false, "ResponseData": {}  });
        }
        token = token.split(' ');                                          // Split the token and check if it is in the correct format
        if (token[0] !== 'Bearer' || !token[1]) {
            return res.status(401).json({"ResponseCode": 401, "ResponseMessage": "Invalid token format.", "succeeded": false, "ResponseData": {}})
        }
        token = token[1];                                                                // Extract the actual token
        var adminkey = process.env.ADMIN_KEY;
        jwt.verify(token, adminkey, (err, decoded) => {                                    // Verify the token
            if (err) {
                return res.status(401).json({  "ResponseCode": 401, "ResponseMessage": "Invalid token.", "succeeded": false, "ResponseData": { token }});
            } else {req.decoded = decoded;   
                next();
            }
        });
    }
    
  
    // privateAuth(req, res, next) {
    //     var token = req.headers.authorization;
    //     token = token.split(' ')[1];
    //     var privatekey = process.env.PRIVATE_KEY;
    //     jwt.verify(token, privatekey, (err, decoded) => {
    //         if (err) {
    //             //////console.log("privateAuthentication Error: ", err);
    //             return res.status(401).json({ "ResponseCode": 401,  "ResponseMessage": "Invalid token.", "succeeded": false, "ResponseData": { token } 
    //              });
    //         } else {
    //             req.decoded = decoded
    //             next()
    //         }
    //     })
    // } 

    // adminAuth(req, res, next) {
    //     var token = req.headers.authorization;
    //     token = token.split(' ')[1];
    //     var adminkey = process.env.ADMIN_KEY;
    //     jwt.verify(token, adminkey, (err, decoded) => {
    //         if (err) {
    //            // ////console.log("Admin Authentication Error: ", err);
    //             return res.status(401).json({ "ResponseCode": 401, "ResponseMessage": "Invalid token.", "succeeded": false, "ResponseData": { token } });
    //         } else {
    //             req.decoded = decoded
    //             next()
    //         }
    //     })
    // }
}

module.exports = new Authentication()