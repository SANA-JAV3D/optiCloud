import React from 'react'
import { Link } from 'react-router-dom'

import bannerImg from "../../assets/glass2.png"

const Banner = () => {
  return (
    <div className='section__container header__container'>
        <div className='header__content z-30'>
        <h1 className="text-7xl font-bold">Discover and </h1>
            <h1 className="text-7xl font-bold">Customize your</h1>
            <h1 className="text-8xl font-bold">Perfect Lens!</h1>
            <div className="h-10"></div>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur voluptatibus consequuntur deserunt dicta at eligendi nostrum incidunt explicabo eveniet ex veniam sequi delectus deleniti earum, doloremque ab, iste perferendis voluptates.</p>
            <button className='btn'><Link to='/shop'>EXPLORE NOW</Link></button>
        </div>
        <div className='header__image'>
            <img src={bannerImg} alt="banner image" />
        </div>
    </div>
  )
}

export default Banner