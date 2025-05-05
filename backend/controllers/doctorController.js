// import doctorModel from "../models/doctorModel.js"

// const doctorList = async (req,res) => {
//     try {

//         const doctors = await doctorModel.find({}).select(['-password', '-email'])
//         res.json({success:true,doctors})
//     } catch (error)
//     {
//         console.log(error)
//         res.json({success:false,message:error.message})

//     }
// }
// export {doctorList}

import doctorModel from '../models/doctorModel.js';

// API to list all doctors
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find().select('-password');
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get a doctor's booked slots
const getDoctorSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await doctorModel.findById(id).select('slots_booked');
    if (!doctor) {
      return res.json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, slots_booked: doctor.slots_booked });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { doctorList, getDoctorSlots };