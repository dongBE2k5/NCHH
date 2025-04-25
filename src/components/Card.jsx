import React from "react";
import { useNavigate } from "react-router-dom";

function Card({ title, description, link }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(link)}
      className="bg-blue-500 text-white p-4 rounded-lg shadow hover:bg-blue-600 cursor-pointer"
    >
      <h3 className="font-semibold">{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default Card;