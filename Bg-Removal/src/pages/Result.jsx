import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../Context/AppContext'

const Result = () => {
  const navigate = useNavigate()
  const { resultImage, image, setImage, setResultImage } = useContext(AppContext)

  const handleTryAnother = () => {
    setImage(null)
    setResultImage(null)
    navigate('/')
  }

  const handleGoHome = () => {
    navigate('/')
  }

  return (
  <div className='mx-4 my-3 lg:mx-44 mt-14 min-h-[75vh]'>
      
    <div className='bg-white rounded-lg px-8 py-6 drop-shadow-sm'>
      <div className='flex flex-col sm:grid grid-cols-2 gap-8'>
        <div className='flex flex-col h-[420px]'>
          <p className='font-semibold text-gray-600 mb-2'>Original</p>
          {image ? (
            <img
              className='rounded-md border w-full h-full object-contain'
              src={URL.createObjectURL(image)}
              alt="Original uploaded"
            />
          ) : (
            <div className='rounded-md border h-full flex items-center justify-center text-gray-400'>No image uploaded</div>
          )}
        </div>
        <div className='flex flex-col h-full'>
          <p className='font-semibold text-gray-600 mb-2'>Background Removed</p>
          <div className='rounded-md border border-gray-300 h-[420px] relative bg-layer overflow-hidden'>
            {resultImage ? (
              <img
                className='w-full h-full object-contain'
                src={resultImage}
                alt="Background removed"
              />
            ) : image ? (
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='border-4 border-violet-600 rounded-full h-12 w-12 border-t-transparent animate-spin'></div>
              </div>
            ) : (
              <div className='h-full flex items-center justify-center text-gray-400'>Waiting for upload</div>
            )}
          </div>
        </div>
      </div>
      {(image || resultImage) && <div className='flex justify-center sm:justify-end items-center flex-wrap gap-4 mt-6'>
        <button onClick={handleTryAnother} className='px-8 py-2.5 text-violet-600 text-sm border border-violet-600 rounded-full hover:scale-105 transition-all duration-700'>Try another image</button>
        <button onClick={handleGoHome} className='px-8 py-2.5 text-gray-600 text-sm border border-gray-300 rounded-full hover:scale-105 transition-all duration-700'>Home</button>
        {resultImage && (
          <a href={resultImage} download className='px-8 py-2.5 text-white text-sm bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full hover:scale-105 transition-all duration-700'>Download image</a>
        )}
      </div>}
     </div>
  </div>
  )
}

export default Result
