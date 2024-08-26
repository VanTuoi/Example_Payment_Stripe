"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios"; // Import axios

//https://docs.stripe.com/testing
// Thẻ test

// Đây là Publishable key của Stripe (mỗi tài khoản thì tự tạo 1 cặp khóa riêng)
const stripePromise = loadStripe(
  "pk_test_51Prz3fHCo4JwvhjZ4S644YeDvUfL9LOdrmi7diWZZVWnqBw1Q9AxFerJXbgNrdS0hgdg0hSRAPqyNgPmxtytohG3004yvjc1Zz"
);

export default function CollapsibleTable() {
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState([
    { id: 1, name: "T-shirt", price: 1000, quantity: 1 },
    { id: 2, name: "Jeans", price: 2000, quantity: 1 },
  ]);

  const handleQuantityChange = (id, newQuantity) => {
    setItems(items.map((item) => (item.id === id ? { ...item, quantity: Math.max(newQuantity, 1) } : item)));
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const makePayment = async () => {
    setLoading(true);
    const stripe = await stripePromise;

    try {
      const response = await axios.post(
        "http://localhost:8000/payment",
        { items },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const session = response.data;
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error("Payment error:", result.error.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>${(item.price / 100).toFixed(2)}</td>
              <td>
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                />
              </td>
              <td>${((item.price * item.quantity) / 100).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3">
        <strong>Total: ${calculateTotal() / 100}</strong>
      </div>
      <button className="btn btn-primary mt-3" onClick={makePayment} disabled={loading}>
        {loading ? "Processing..." : "Payment"}
      </button>
    </div>
  );
}
