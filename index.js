const cool = require("cool-ascii-faces");
const express = require("express");
const path = require("path");

const PORT = process.env.PORT || 5001;

const app = express();

app
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"))
  .get("/cool", (req, res) => res.send(cool()))
  .get("/product-validation", (req, res) => {
    const products = [
      [
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
      ],
    ];
    res.json(products);
  });

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
