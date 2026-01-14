import React,{ useContext, useEffect } from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { AppContext } from '../Context/AppContext'

const Navbar = () => {

  const { openSignIn } = useClerk()
  const { isSignedIn,user } = useUser()
  const { credit, loadCreditsData } = useContext(AppContext)

  const navigate = useNavigate()

useEffect(()=>{
if(isSignedIn){
  loadCreditsData()
}
},[isSignedIn])

  return (
    <div className='flex items-center justify-between mx-4 py-3 lg:mx-44'>
     <Link to='/'> <img className='w-32 sm:w-44' src={assets.logo} alt="" /> </Link>
     {
      isSignedIn
      ?<div className='flex items-center gap-2 sm:gap-3'>
        <button onClick={()=>navigate('/buycredit')} className='flex items-center gap-2 bg-blue-100 px-4 sm:px-7 py-1.5 sm:py-2.5 rounded-full'>
          <img className='w-5' src={assets.credit_icon} alt="" />
          <p className='text-xs sm:text-sm font-medium text-gray-600'>Credits : {credit}</p>
        </button>
        <p className='text-gray-600 max-sm:hidden'>Hi, {user.fullName}</p>
        <UserButton />
      </div>
      : <button onClick={()=>openSignIn({})} className='bg-zinc-800 text-white flex items-center px-4 py-2 gap-4 sm:px-8 sm:py-3 rounded-md text-sm hover:bg-zinc-700 hover:scale-105 duration-200'>
        Get Started <img className='w-4 sm:w-4' src={assets.arrow_icon} alt="" />
      </button>
     }
      
    </div>
  )
}

export default Navbar
