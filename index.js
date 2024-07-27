const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const { Client } = require("pg");

const PORT = process.env.PORT || 5001;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
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

// Use CORS middleware
app.use(cors({ origin: "http://localhost:3000" }));

app
  .use(express.static(path.join(__dirname, "public")))
  .use(bodyParser.json())
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"))
  .get("/cool", (req, res) => res.send(cool()))
  .get("/product-validation", (req, res) => {
    const products = [
      {
        id: "metin-gold",
        name: "METIN2 ARANY",
        price: 10,
        description:
          "High-quality replica of The Starry Night by the Dutch post-impressionist painter Vincent van Gogh.",
        image: "./metin2-gold.webp",
      },
      {
        id: "solaris-gold",
        name: "SOLARIS ARANY",
        price: 20,
        description:
          "High-quality replica of The Starry Night by the Dutch post-impressionist painter Vincent van Gogh.",
        image: "./solaris-gold.webp",
      },
    ];
    res.json(products);
  })
  .use(bodyParser.json())
  .post("/webhook", (req, res) => {
    const webhookData = req.body;
    console.log("Received webhook:", webhookData);

    if (webhookData.eventName === "order.completed") {
      console.log("req body");
      console.log(req.body);

      // Directly accessing the invoice number without parsing JSON again
      const invoiceNumber = webhookData.content.invoiceNumber;
      io.emit("order-completed", { orderId: invoiceNumber });

      console.log(`Order completed with invoice number: ${invoiceNumber}`);
    }

    res.status(200).send("Webhook received successfully");
  })
  .get("/db/get_comments", async (req, res) => {
    try {
      const result = await client.query(
        `
        SELECT * from user_comments

        `
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  })
  .get("/db/insert_comment", async (req, res) => {
    const { username, comment_text } = req.query;

    if (!username || !comment_text) {
      return res
        .status(400)
        .json({ error: "Username and comment text are required" });
    }

    // http://localhost:5001/db/insert_comment?username=something&comment_text=this+is+a+comment
    try {
      await client.query(
        `
        INSERT INTO user_comments (username, comment_text)
        VALUES ($1, $2)
        `,
        [username, comment_text]
      );

      const result = await client.query(
        `
        SELECT * FROM user_comments
        `
      );

      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

server.listen(PORT, () => console.log(`Listening on ${PORT}`));
