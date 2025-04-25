import React from 'react'
import { Link } from 'react-router-dom'

import spherical from '../../assets/spherical.png'
import aspheric from '../../assets/aspheric.png'
import achro from '../../assets/achromatic.png'
import cylindrical from '../../assets/cylindrical.png'
import powell from '../../assets/Powell-prism.jpg'
import prism from '../../assets/prism.png'





const Categories = () => {
    const categories = [
        {name:'Spherical Singlet Lens',path:'Spherical Singlet Lens', image: spherical},
        {name:'Aspheric Lens',path:'Aspheric Lens', image: aspheric},
        {name:'Achromatic Lens',path:'Achromatic Lens', image: achro},
        {name:'Cylindrical Lens',path:'Cylindrical Lens', image: cylindrical},
        {name:'Powell Lens',path:'Powell Lens', image: powell},
        {name:'Prism',path:'Prism', image: prism},
    ]
  return (
    <>
    <section>
      <div className="my-10 h-5 border-b-2 border-zinc-200 text-center text-2xl">
        <span className="bg-white px-5 font-serif font-semibold">
          Featured Lenses
        </span>
      </div>
     <div className="product__grid h-90">
      {
        categories.map((category) => (
        <Link key={category.name} to={`/categories/${category.path}`} className='categories__card'>
          <img src={category.image} alt={category.name} />
          <h4 className="category-name">{category.name}</h4>
        </Link>
      ))}
    </div>
    </section>
       
    </>
  )
}

export default Categories