const express = require('express');
const path = require("path");
const root = path.dirname(require.main.filename);
const multer = require("multer");

var upload = multer({ dest: `${root}/public/uploads`})

const router = express.Router();

const apiControllers = require(`${root}/controllers/api/api.controllers`);

router.post('/authen', apiControllers.postAuthen);

router.post('/register', apiControllers.postRegister);

router.get('/user', apiControllers.getUser);

router.get('/allposts', apiControllers.getAllPosts);

router.get('/posts/:id', apiControllers.getPost);

router.post('/post/upload',upload.single("post"), apiControllers.postUpload);

router.post('/avatar',upload.single("avatar"), apiControllers.postAvatar);

router.post('/comment', apiControllers.postComment);

router.post('/chat/:id', apiControllers.sendChat)

module.exports = router;