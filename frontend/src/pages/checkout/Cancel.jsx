import React from "react";
import { useNavigate } from "react-router-dom";

const Cancel = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-100">
      <h1 className="text-3xl font-bold text-red-700">Payment Canceled</h1>
      <p className="mt-4 text-lg text-red-600">
        Your payment was not completed. You can try again or contact support if
        you need help.
      </p>
      <button
        onClick={() => navigate("/shop")}
        className="mt-6 bg-red-600 text-white px-4 py-2 rounded-md"
      >
        Return to Shop
      </button>
    </div>
  );
};

export default Cancel;
