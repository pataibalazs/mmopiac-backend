require('dotenv').config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const { Client } = require("pg");
const rateLimit = require("express-rate-limit");
const { setupRoutes } = require("./routes");

const PORT = process.env.PORT || 5001;
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
  connectionString: process.env.DB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false,
  },
});
client.connect();

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
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
