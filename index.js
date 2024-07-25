const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

const PORT = process.env.PORT || 5001;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

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
  });

http.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

server.listen(PORT, () => console.log(`Listening on ${PORT}`));
