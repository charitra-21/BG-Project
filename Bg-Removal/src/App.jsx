import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Result from './pages/Result.jsx'
import BuyCredit from './pages/BuyCredit.jsx'
import Navbar from './Components/Navbar.jsx'
import Header from './Components/Header.jsx'
import Footer from './Components/Footer.jsx'

const App = () => {
  return (
    <div className='min-h-screen bg-slate-50'>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/result" element={<Result/>} />
        <Route path="/buycredit" element={<BuyCredit/>} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
