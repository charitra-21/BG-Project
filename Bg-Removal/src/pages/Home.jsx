import React from 'react'
import Steps from '../Components/Steps.jsx'
import Header from '../Components/Header.jsx'
import BgSlider from '../Components/BgSlider.jsx'
import Testimonials from '../Components/Testimonials.jsx'
import Upload from '../Components/Upload.jsx'

const Home = () => {
  return (
    <div>
        <Header/>
        <Steps/>
        <BgSlider />
        <Testimonials />
        <Upload />
    </div>
  )
}

export default Home
