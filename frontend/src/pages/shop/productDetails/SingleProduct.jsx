import React from 'react'
import { Link, useParams} from 'react-router-dom'
import img from '../../../assets/glass2.png'
import RatingStars from '../../../components/RatingStars'
const SingleProduct = () => {
  const {id} = useParams();
  
  return (
    <>
     <section className='section__container bg-primary-light'>
                <h2 className='section__header capitalize'>Single Product Page</h2>
                <div className='section__subheader space-x-2'>
                    <span className="hover:text-primary"><Link to="/">home</Link></span>
                    <i className="ri-arrow-right-s-line"></i>
                    <span className="hover:text-primary"><Link to="/">Shop</Link></span>
                    <i className="ri-arrow-right-s-line"></i>
                    <span className="hover:text-primary">Product Name</span>

                </div>
     </section>
     <section className='section__container mt-8'>
      <div className='flex flex-col items-center md:flex-row gap-8'>
        <div className='md:w-1/2 w-full'>
          <img src={img} alt="product" className='rounded-md w-full h-auto'/>
        </div>
        <div className='md:w-1/2 w-full'>
          <h3 className='text-2xl font-semibold mb-4'>Product Name</h3>
          <p className='text-xl text-primary mb-4'>$100 <s>$130</s></p>
          <p className='text-gray-400 mb-4'>This is product description</p>

          {/*additional product info*/}
          <div>
            <p><strong>Category:</strong>Singlet Spherical Lens</p>
            <div className="flex gap-1 items-center">
              <strong>Rating</strong>
              <RatingStars rating={"4"} />
            </div>
          </div>

          <button className='mt-6 px-6 py-3 bg-primary text-white rounded-md'>
            Add to Cart
          </button>
        </div>


      </div>
      
     </section>

     {/* display Reviews */}
     {/* todo */}
     <section className='section__container mt-8'>
              Reviews 
      </section>
    </>
  )
}

export default SingleProduct