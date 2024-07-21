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
      {
        id: "metin-gold",
        name: "METIN2 ARANY",
        price: 10.0,
        customFields: [],
        url: "https://thawing-dawn-87843-f5b692533558.herokuapp.com/product-validation",
      },
    ];
    res.json(products);
  });

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
