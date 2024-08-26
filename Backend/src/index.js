import express from "express";
require("dotenv").config();
const bodyParser = require("body-parser");
const Stripe = require("stripe");

// Init
const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());

// Config CORS
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Xử lý preflight request (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Đây là Secret key của Stripe (mỗi tài khoản thì tự tạo 1 cặp khóa riêng)
const stripe = Stripe(
  "sk_test_51Prz3fHCo4JwvhjZJ2aUAp44X305QkizquLROSm65lAIPNpAtuJnwdUVxKg7PV5x5qUfKffFJHKHy6E73xbjT3fu00fpdCjqDF"
);

app.post("/payment", async (req, res) => {
  try {
    const { items } = req.body;

    // Tạo danh sách line_items cho phiên thanh toán
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    // Nếu thanh toán thành công thì xử lý số sản phẩm đã bán --> xóa khỏi database
    console.log("items: \n", items);

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ error: "Payment failed" });
  }
});

// Test connect
app.listen(PORT, (error) => {
  if (!error) console.log("Server is successfully running, and server is listening on port " + PORT);
  else console.log("Error occurred, server can't start", error);
});
