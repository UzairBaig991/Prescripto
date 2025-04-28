/*import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../Context/AppContext'

const TopDoctors = () => {
  const navigate = useNavigate()
  const {doctors} = useContext(AppContext)
  return (
    <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
        <h1 className='text-3xl font-medium'>Top Doctors to Book</h1>
<p className='sm:w-1/3 text-center text-sm'>Simply browse through our extensive list of trusted doctors.</p>
<div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
  {doctors.slice(0,10).map((item,index) => (
    <div onClick={() => {
      console.log('Doctor ID:', item.id)
      navigate(`/appointment/${item._id}`); scrollTo(0,0)
    }}
     className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10] transition-all duration-500' key={index}>
      <img className='bg-blue-50' src={item.image} alt="" />
      <div className='p-4'>
        <div className='flex items-center gap-2 text-sm text-center text-green-500'>
          <p className='w-2 h-2 bg-green-500 rounded-full'></p><p>Available</p>
        </div>
        <p className=' className="text-gray-900 text-lg font-medium'>{item.name}</p>
        <p className='text-gray-600 text-sm'>{item.speciality}</p>
      </div>
    </div>
  ))}
</div>
<button onClick={()=>{navigate('/doctors'); scrollTo(0,0)}} className='bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10'>more</button>


    </div>
  )
}

export default TopDoctors*/
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../Context/AppContext';

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors, backendUrl = 'http://localhost:4000' } = useContext(AppContext);

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-medium">Top Doctors to Book</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors.
      </p>
      <div className="w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {doctors.slice(0, 10).map((item, index) => (
          <div
            onClick={() => {
              console.log('Doctor ID:', item._id);
              navigate(`/appointment/${item._id}`);
              window.scrollTo(0, 0);
            }}
            className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group"
            key={index}
          >
            <div className="relative w-full h-48">
              <div className="absolute inset-0 bg-indigo-50 group-hover:bg-primary transition-all duration-500"></div>
              <img
                className="relative w-full h-48 object-cover"
                src={item.image ? `${backendUrl}/${item.image}` : '/default-doctor.jpg'}
                alt={item.name}
                onError={(e) => (e.target.src = '/default-doctor.jpg')}
              />
            </div>
            <div className="p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-green-500 mb-1">
                <p className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : 'bg-gray-400'}`}></p>
                <p>{item.available ? 'Available' : 'Unavailable'}</p>
              </div>
              <p className="text-neutral-800 text-base font-semibold">{item.name}</p>
              <p className="text-zinc-600 text-xs">{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          navigate('/doctors');
          window.scrollTo(0, 0);
        }}
        className="bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10"
      >
        more
      </button>
    </div>
  );
};

export default TopDoctors;