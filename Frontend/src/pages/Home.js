import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="container mt-5">
      <h1>Home Page</h1>
      <Link to="/payment" className="btn btn-primary">
        Go to Payment
      </Link>
    </div>
  );
}

export default Home;
