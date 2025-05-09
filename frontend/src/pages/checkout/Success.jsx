import React from "react";
import { useNavigate } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-100">
      <h1 className="text-3xl font-bold text-green-700">Payment Successful!</h1>
      <p className="mt-4 text-lg text-green-600">
        Thank you for your purchase. Your order has been placed successfully.
      </p>
      <button
        onClick={() => navigate("/shop")}
        className="mt-6 bg-green-600 text-white px-4 py-2 rounded-md"
      >
        Continue Shopping
      </button>
    </div>
  );
};

export default Success;
