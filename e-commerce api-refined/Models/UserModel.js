const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  name:  { type: String, required: true},
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true, selected: false }, 
  uuid:     { type: String }, 
  login_type: { type: String},
  status:     { type: String, default: "0" },
  address:    { type: String, required: false },                  // check if it is necessary 

  cart: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
    }],
},{ timestamps: true});

UserSchema.methods.savePassword = async function (password) {
  const hashed_password = await bcrypt.hash(password, 10); 
  this.password = hashed_password;  
};

UserSchema.methods.checkPassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

module.exports = mongoose.model('users', UserSchema);
