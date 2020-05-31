const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String
  },
  img: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  comments: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        required: true
      },
      message: String
    }
  ]
});

module.exports = mongoose.model("posts", postSchema);
