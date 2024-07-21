const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const path = require("path");

const PORT = process.env.PORT || 5001;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

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
  .post("/webhook", (req, res) => {
    const webhookData = req.body;
    console.log("Received webhook:", webhookData);

    if (webhookData.eventName === "order.completed") {
      // Emit to all connected clients (you could target specific clients based on a session or identifier)
      io.emit("order-completed", { orderId: webhookData.orderId });
    }

    res.status(200).send("Webhook received successfully");
  });

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
