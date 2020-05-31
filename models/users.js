const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  gmail: {
    type: String,
    required: true,
    unique: true
  },
  posts: [Schema.Types.ObjectId],
  avatar: {
    type: String,
    default:
      "https://res.cloudinary.com/daoha/image/upload/v1588146078/userTest/download_btdqvy.jpg"
  }
});

module.exports = new mongoose.model('users', userSchema)
