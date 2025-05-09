import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// import products from "../../data/products.json"
import ProductCards from "../shop/ProductCards";
import { useFetchAllProductsQuery } from "../../redux/features/products/productsApi";

const CategoryPage = () => {
  const { categoryName } = useParams();

  const { data, error, isLoading } = useFetchAllProductsQuery({
    category: categoryName,
  });
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <section className="section__container bg-primary-light">
        <h2 className="section__header capitalize">{categoryName}</h2>
        <p className="section__subheader">
          Browse a diverse range of categoriess
        </p>
      </section>

      {/* products card */}
      <div className="section__container">
        <ProductCards data={data} />
      </div>
    </>
  );
};

export default CategoryPage;
