import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import products from "../../data/products.json"
import ProductCards from '../shop/ProductCards';

const CategoryPage = () => {
   const {categoryName} = useParams();
   const [filteredProducts, setFilteredProducts] = useState([]);

  
   useEffect(() => {
    window.scrollTo(0, 0)
   },[]);

   useEffect(() =>{
    const filtered = products.filter((product) => 
      product.category.toLowerCase() === categoryName.toLowerCase()
  );

    setFilteredProducts(filtered);
   } , [categoryName])


  return (
    <>
    <section className='section__container bg-primary-light'>
            <h2 className='section__header capitalize'>{categoryName}</h2>
            <p className='section__subheader'>Browse a diverse range of categoriess</p>
    </section>

    {/* products card */}
    <div className='section__container'>
        <ProductCards products={filteredProducts}/>
    </div>
    </>
  )
}

export default CategoryPage