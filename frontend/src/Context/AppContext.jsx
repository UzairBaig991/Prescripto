// import { createContext, useEffect, useState } from "react";
// import axios from 'axios'
// import {toast} from 'react-toastify'

// export const AppContext = createContext(); // ✅ Named Export

// const AppContextProvider = (props) => {
//   const currencySymbol = 'Rs'
//   const backendUrl = import.meta.env.VITE_BACKEND_URL

//   const [doctors, setDoctors] = useState([])
//   const [token,setToken] = useState('')

//      // Providing doctors data in context

//      const getDoctorsData = async () => {
//       try {
          
//         const {data} = await axios.get(backendUrl + '/api/doctor/list')
//         if (data.success) {
//           setDoctors(data.doctors)

//         } else {
//           toast.error(data.message)
//         }
//       } catch (error) {
//          console.log(error)
//          toast.error(error.message)
//       }

//      }

//      const value = {
//       doctors,
//       currencySymbol,
//       token,setToken,
//       backendUrl
//       };

//      useEffect(()=>{
//       getDoctorsData()
//      })

//   return (
//     <AppContext.Provider value={{ doctors }}>
//     {props.children}
//   </AppContext.Provider>
  
//   );
// };

// export default AppContextProvider;
import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = 'Rs.';
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Providing doctors data in context
  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/doctor/list');
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Sync token with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Fetch doctors data on mount
  useEffect(() => {
    getDoctorsData();
  }, []);

  const value = {
    doctors,
    currencySymbol,
    token,
    setToken,
    backendUrl
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;