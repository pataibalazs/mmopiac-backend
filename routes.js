const { body, validationResult } = require("express-validator");
const path = require("path");

const setupRoutes = (app, io, client) => {
  app.get("/", (req, res) => res.render("pages/index"));

  app.get("/product-validation", (req, res) => {
    const products = [
      {
        id: "metin-gold",
        name: "METIN2 ARANY",
        price: 10,
        description: "High-quality replica of The Starry Night by the Dutch post-impressionist painter Vincent van Gogh.",
        image: "./metin2-gold.webp",
      },
      {
        id: "solaris-gold",
        name: "SOLARIS ARANY",
        price: 20,
        description: "High-quality replica of The Starry Night by the Dutch post-impressionist painter Vincent van Gogh.",
        image: "./solaris-gold.webp",
      },
    ];
    res.json(products);
  });

  app.post("/webhook", (req, res) => {
    const webhookData = req.body;
    console.log("Received webhook:", webhookData);

    if (webhookData.eventName === "order.completed") {
      const invoiceNumber = webhookData.content.invoiceNumber;
      io.emit("order-completed", { orderId: invoiceNumber });
      console.log(`Order completed with invoice number: ${invoiceNumber}`);
    }

    res.status(200).send("Webhook received successfully");
  });

  app.get("/db/get_comments", async (req, res) => {
    try {
      const result = await client.query("SELECT * FROM user_comments ORDER BY comment_date DESC");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/db/insert_comment", [
    body("username").trim().escape().notEmpty().withMessage("Username is required"),
    body("comment_text").trim().escape().notEmpty().withMessage("Comment text is required"),
    body("rating").trim().isInt({ min: 1, max: 5 }).withMessage("Rating must be an integer between 1 and 5"),
    body("comment_date").trim().matches(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}-\d{4}$/).withMessage("Comment date must be in MMM-DD-YYYY format")
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, comment_text, rating, comment_date } = req.body;

    const months = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };
    const [month, day, year] = comment_date.split("-");
    const formattedDate = `${year}-${months[month]}-${day}`;

    try {
      await client.query(
        "INSERT INTO user_comments (username, comment_text, rating, comment_date) VALUES ($1, $2, $3, $4)",
        [username, comment_text, parseInt(rating, 10), formattedDate]
      );

      const result = await client.query("SELECT * FROM user_comments");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

module.exports = { setupRoutes };
