require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const { Client } = require("pg");
const rateLimit = require("express-rate-limit");
const { setupRoutes } = require("./routes");

const PORT = 5001;
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://main.d26fsuvjdvjcm0.amplifyapp.com",
    ],
    methods: ["GET", "POST"],
  },
});

const client = new Client({
  connectionString:
    "postgres://ubr97dmu2sd6o5:p55c8bfb84079b0b4cbfbe8506f99a7f411aa624fe02b2711fcaa24a2ebfa8b8c@c3gtj1dt5vh48j.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/dfmvbflf6oqohj",
  ssl: {
    rejectUnauthorized: false,
  },
});
client.connect();

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use(limiter);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://main.d26fsuvjdvjcm0.amplifyapp.com",
    ],
  })
);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

setupRoutes(app, io, client);

server.listen(PORT, () => console.log(`Listening on ${PORT}`));
