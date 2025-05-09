import React from "react";
import { Link, useParams } from "react-router-dom";
import RatingStars from "../../../components/RatingStars";
import { useDispatch } from "react-redux";
import { useFetchProductByIdQuery } from "../../../redux/features/products/productsApi";
import { addToCart } from "../../../redux/features/cart/cartSlice";
import ReviewsCard from "../reviews/ReviewsCard";

const SingleProduct = () => {
  const { id } = useParams();

  const dispatch = useDispatch();
  const { data, error, isLoading } = useFetchProductByIdQuery(id);

  const singleProduct = data?.product || {};
  const productReviews = data?.reviews || [];

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) {
    console.log(error);
    return <p>Error loading product details.</p>;
  }

  return (
    <>
      <section className="section__container bg-primary-light">
        <h2 className="section__header capitalize">Single Product Page</h2>
        <div className="section__subheader space-x-2">
          <span className="hover:text-primary">
            <Link to="/">home</Link>
          </span>
          <i className="ri-arrow-right-s-line"></i>
          <span className="hover:text-primary">
            <Link to="/">Shop</Link>
          </span>
          <i className="ri-arrow-right-s-line"></i>
          <span className="hover:text-primary">{singleProduct?.name}</span>
        </div>
      </section>
      <section className="section__container mt-8">
        <div className="flex flex-col items-center md:flex-row gap-8">
          <div className="md:w-1/2 w-full">
            <img
              src={`/assets/${singleProduct?.url}`}
              alt="product"
              className="rounded-md w-full h-auto"
            />
          </div>
          <div className="md:w-1/2 w-full">
            <h3 className="text-2xl font-semibold mb-4">
              {singleProduct?.name}
            </h3>
            <p className="text-xl text-primary mb-4 space-x-4">
              {singleProduct?.price} <s>{singleProduct?.oldPrice}</s>
            </p>
            <p className="text-gray-400 mb-4">{singleProduct?.description}</p>

            {/*additional product info*/}
            <div>
              <p>
                <strong className="mr-2">Category:</strong>
                {singleProduct?.category}
              </p>
              <div className="flex gap-1 items-center">
                <strong>Rating</strong>
                <p></p>
                <RatingStars rating={singleProduct?.rating} />
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(singleProduct);
              }}
              className="mt-6 px-6 py-3 bg-primary text-white rounded-md"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </section>

      {/* display Reviews */}
      {/* todo */}
      <section className="section__container mt-8">
        <ReviewsCard productReviews={productReviews} />
      </section>
    </>
  );
};

export default SingleProduct;
