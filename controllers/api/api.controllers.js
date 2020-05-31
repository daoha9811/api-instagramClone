const jwt = require("jsonwebtoken");
const path = require("path");
const root = path.dirname(require.main.filename);

const fs = require("fs");

const userModel = require(`${root}/models/users`);
const postModel = require(`${root}/models/posts`);

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

module.exports.postAuthen = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await userModel.findOne({ gmail: email });
    //checkEmailOrPassword
    if (!user || user.password != password) {
      res.json({
        errors: "Sai tai khoan hoac mat khau"
      });
      return;
    }

    const payload = {
      userId: user._id
    };

    const token = jwt.sign(payload, process.env.TOKEN_SECRET);

    const sendedData = {
      token: {
        accessToken: token,
        tokenType: "Bearer"
      },
      user
    };

    res.status(200).json(sendedData);
  } catch (error) {
    next(error);
    res.json({ errors: "some thing went wrong" });
  }
};

module.exports.postRegister = async (req, res, next) => {
  try {
    const userName = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const checkedUser = await userModel.find({ gmail: email });

    if (checkedUser.length > 0) {
      res.json({ errors: "Da ton tai gmail" });
      return;
    }

    await userModel.create({
      name: userName,
      password,
      gmail: email,
      posts: []
    });

    res.status(200).json({
      status: "success"
    });
  } catch (error) {
    next(error);
    res.json({ errors: "some thing went wrong" });
  }
};

module.exports.getUser = async (req, res, next) => {
  try {
    const token = req.query.token;

    if (!token) {
      res.json({ errors: "Ban chua dang nhap" });
    }
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    if (decoded) {
      const userId = decoded.userId;
      const user = await userModel.findById(userId);
      const posts = await postModel.find({ userId });

      res.status(200).json({
        user,
        posts
      });
    }
  } catch (error) {
    next(error);
    res.json({ errors: error.message });
  }
};

module.exports.getAllPosts = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      res.json({ errors: "Ban chua dang nhap" });
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = decoded.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      res.json({ errors: "Ban chua dang nhap" });
    }

    const Posts = await postModel.find();
    res.status(200).json(Posts);
  } catch (error) {
    next(error);
    res.json({ errors: "some thing went wrong" });
  }
};

module.exports.getPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await postModel.findById(postId);

    const convertComments = post.comments.map(async comment => {
      const user = await userModel.findById(comment.userId);
      return {
        user,
        message: comment.message
      };
    });

    const comments = await Promise.all(convertComments);

    const sendedData = {
      title: post.title,
      img: post.img,
      likes: post.likes,
      userId: post.userId,
      comments: comments
    };

    res.json(sendedData);
  } catch (error) {
    next(error);
    res.json({ errors: "some thing went wrong" });
  }
};

module.exports.postUpload = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      res.json({ errors: "Ban chua dang nhap" });
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = decoded.userId;
    const user = await userModel.findById(userId);

    const post = req.file;

    if (post) {
      const path = post.path;

      const cloudinaryResponse = await cloudinary.uploader.upload(path, {
        public_id: `instagramTest/post/${user._id}/${path.name}`,
        width: 500,
        height: 500
      });

      const newPost = await postModel.create({
        img: cloudinaryResponse.url,
        userId: user._id,
        userName: user.name,
        comment: []
      });

      const userPosts = user.posts;
      userPosts.push(newPost._id);

      await userModel.updateOne(
        { _id: user._id },
        { $set: { posts: userPosts } }
      );

      res.status(200).json({
        status: "success"
      });
      
      fs.unlink(path, (err, data) => {});
    }
    res.json({ errors: "Khong co files" });
  } catch (error) {
    next(error);
    res.json({ errors: error.message });
  }
};

module.exports.postAvatar = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      res.json({ errors: "Ban chua dang nhap" });
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = decoded.userId;
    const user = await userModel.findById(userId);

    const avatar = req.file;

    if (avatar) {
      const path = avatar.path;

      const cloudinaryResponse = await cloudinary.uploader.upload(path, {
        public_id: `instagramTest/avatar/${user._id}`,
        width: 500,
        height: 500
      });

      await userModel.updateOne(
        { _id: user._id },
        { $set: { avatar: cloudinaryResponse.url } }
      );

      res.status(200).json({
        status: "success"
      });
      
      fs.unlink(path, (err, data) => {});
    }
    res.json({ errors: "Khong co files" });
  } catch (error) {
    next(error);
    res.json({ errors: error.message });
  }
};

module.exports.postComment = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      res.json({ errors: "Ban chua dang nhap" });
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = decoded.userId;
    const user = await userModel.findById(userId);

    const postId = req.body.postId;
    const currentPost = await postModel.findById(postId);

    const comment = req.body.comment;

    const newComment = {
      userId: user._id,
      message: comment
    };

    const currentComment = currentPost.comments;
    currentComment.push(newComment);

    await postModel.updateOne(
      { _id: postId },
      { $set: { comments: currentComment } }
    );

    res.json({ status: "success" });
  } catch (error) {
    next(error);
    res.json({ errors: error.message });
  }
};
