// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const bodyParser = require("body-parser");
const socket = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
//connectdb
const apiRoute = require("./routes/api/api.routes");

try {
  mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    dbName: process.env.DB_NAME,
    user: process.env.ATLAS_USER,
    pass: process.env.ATLAS_PASS,
    useCreateIndex: true
  });
} catch (err) {
  console.warn(err);
}

mongoose.connection
  .once("open", (err, data) => {
    console.log("connected DB");
  })
  .on("error", (err, data) => {
    console.warn(err);
  });

const app = express();
const http = require("http").Server(app);
const io = socket(http);
const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";

io.on("connection", socket => {
  socket.on(NEW_CHAT_MESSAGE_EVENT, data => {
    io.emmit(NEW_CHAT_MESSAGE_EVENT, data);
  });
  console.log(`co nguoi ket noi ${socket.id}`);
});

app.use((req, res, next) => {
  res.io = io;
  next();
});

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static("public"));

app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send("hello");
  console.log("hello");
});

app.use("/api", apiRoute);

app.use(function(err, req, res, next) {
  res.status(404).send(err.message);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
