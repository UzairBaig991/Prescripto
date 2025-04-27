/*import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/AdminContext';

const DoctorsList = () => {
  const { backendUrl, aToken } = useContext(AdminContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [editForm, setEditForm] = useState({
    docImg: null,
    name: '',
    email: '',
    experience: '1 Year',
    fees: '',
    speciality: 'General Physician',
    degree: 'MBBS',
    about: '',
    address1: '',
    address2: '',
  });

  // Valid degrees for dropdown
  const validDegrees = [
    'MBBS',
    'MD',
    'DO',
    'BDS',
    'MS',
    'DNB',
    'FCPS',
    'PhD',
    'DM',
  ];

  // Fetch doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/admin/doctors`, {
          headers: { aToken },
        });
        if (data.success) {
          setDoctors(data.doctors);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [backendUrl, aToken]);

  // Handle doctor deletion
  const handleDelete = async () => {
    try {
      const { data } = await axios.delete(`${backendUrl}/api/admin/delete-doctor/${selectedDoctorId}`, {
        headers: { aToken },
      });
      if (data.success) {
        setDoctors(doctors.filter((doctor) => doctor._id !== selectedDoctorId));
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error(error.response?.data?.message || 'Failed to delete doctor');
    } finally {
      setShowDeleteModal(false);
      setSelectedDoctorId(null);
    }
  };

  // Open edit modal with pre-filled data
  const openEditModal = (doctor) => {
    setEditForm({
      docImg: null,
      name: doctor.name,
      email: doctor.email,
      experience: doctor.experience,
      fees: doctor.fees.toString(),
      speciality: doctor.speciality,
      degree: validDegrees.includes(doctor.degree) ? doctor.degree : 'MBBS',
      about: doctor.about,
      address1: doctor.address.line1,
      address2: doctor.address.line2 || '',
    });
    setSelectedDoctorId(doctor._id);
    setShowEditModal(true);
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      if (editForm.docImg) formData.append('image', editForm.docImg);
      formData.append('name', editForm.name);
      formData.append('email', editForm.email);
      formData.append('experience', editForm.experience);
      formData.append('fees', Number(editForm.fees));
      formData.append('speciality', editForm.speciality);
      formData.append('degree', editForm.degree);
      formData.append('about', editForm.about);
      formData.append('address', JSON.stringify({ line1: editForm.address1, line2: editForm.address2 }));

      const { data } = await axios.patch(
        `${backendUrl}/api/admin/update-doctor/${selectedDoctorId}`,
        formData,
        { headers: { aToken } }
      );

      if (data.success) {
        setDoctors((prev) =>
          prev.map((doc) =>
            doc._id === selectedDoctorId ? { ...doc, ...data.doctor } : doc
          )
        );
        toast.success(data.message);
        setShowEditModal(false);
        setSelectedDoctorId(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
      toast.error(error.response?.data?.message || 'Failed to update doctor');
    }
  };

   // Handle availability toggle
   const handleAvailabilityToggle = async (doctorId, currentStatus) => {
    // Debugging logs
    console.log('Toggling availability for doctorId:', doctorId, 'Current status:', currentStatus);
    console.log('Doctors state before update:', doctors);

    // Validate inputs
    if (!doctorId || typeof currentStatus !== 'boolean') {
      console.error('Invalid doctorId or currentStatus:', { doctorId, currentStatus });
      toast.error('Failed to toggle availability: Invalid data');
      return;
    }

    // Optimistically update the UI
    const originalDoctors = [...doctors];
    setDoctors((prev) =>
      prev.map((doc) =>
        doc._id === doctorId ? { ...doc, available: !currentStatus } : doc
      )
    );

    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/admin/toggle-availability/${doctorId}`,
        { available: !currentStatus },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
      } else {
        // Revert the optimistic update on failure
        setDoctors(originalDoctors);
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      // Revert the optimistic update on error
      setDoctors(originalDoctors);
      toast.error(error.response?.data?.message || 'Failed to toggle availability');
    }

    console.log('Doctors state after update:', doctors);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-lg font-medium mb-6">All Doctors</h2>
      {loading ? (
        <p className="text-gray-500 text-center">Loading...</p>
      ) : doctors.length === 0 ? (
        <p className="text-gray-500 text-center">No doctors found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group"
            >
              <div className="relative w-full h-48">
                <div className="absolute inset-0 bg-indigo-50 group-hover:bg-primary transition-all duration-500"></div>
                <img
                  src={`${backendUrl}/${doctor.image}`}
                  alt={doctor.name}
                  className="relative w-full h-48 object-cover"
                />
              </div>
              <div className="p-3 text-center">
                <h3 className="text-base font-semibold text-neutral-800 mb-1">{doctor.name}</h3>
                <p className="text-zinc-600 text-xs mb-3">{doctor.speciality}</p>
                <div className="flex justify-center gap-2 mb-3">
                  <button
                    onClick={() => openEditModal(doctor)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDoctorId(doctor._id);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <label className="flex justify-center items-center gap-2 text-gray-600 text-xs">
                  <input
                    type="checkbox"
                    checked={doctor.available || false}
                    onChange={() => handleAvailabilityToggle(doctor._id, doctor.available)}
                    className="w-4 h-4"
                  />
                  Available for Booking
                </label>
              </div>
            </div>
          ))}
        </div>
      )}*/

      {/* Delete Confirmation Modal */}
      /*{showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this doctor?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}*/

      {/* Edit Doctor Modal */}
      /*{showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Doctor</h3>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div className="flex items-center gap-4 text-gray-500">
                <label htmlFor="doc-img">
                  <img
                    className="w-16 h-16 bg-gray-100 rounded-full cursor-pointer object-cover"
                    src={
                      editForm.docImg
                        ? URL.createObjectURL(editForm.docImg)
                        : `${backendUrl}/${doctors.find((d) => d._id === selectedDoctorId)?.image}`
                    }
                    alt="Doctor"
                  />
                </label>
                <input
                  onChange={handleEditChange}
                  type="file"
                  id="doc-img"
                  name="docImg"
                  accept="image/*"
                  hidden
                />
                <p>Upload new doctor picture (optional)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-gray-600">Doctor Name</label>
                  <input
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="border rounded px-3 py-2"
                    type="text"
                    placeholder="Name"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-600">Doctor Email</label>
                  <input
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    className="border rounded px-3 py-2"
                    type="email"
                    placeholder="Email"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-600">Experience</label>
                  <select
                    name="experience"
                    value={editForm.experience}
                    onChange={handleEditChange}
                    className="border rounded px-3 py-2"
                  >
                    {['1 Year', '2 Year', '3 Year', '4 Year', '5 Year', '6 Year', '7 Year', '8 Year', '9 Year', '10 Year'].map((exp) => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-600">Fees</label>
                  <input
                    name="fees"
                    value={editForm.fees}
                    onChange={handleEditChange}
                    className="border rounded px-3 py-2"
                    type="number"
                    placeholder="Fees"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-600">Speciality</label>
                  <select
                    name="speciality"
                    value={editForm.speciality}
                    onChange={handleEditChange}
                    className="border rounded px-3 py-2"
                  >
                    {[
                      'General Physician',
                      'Cardiologist',
                      'Dermatologist',
                      'Gynecologist',
                      'Pediatrician',
                      'Psychiatrist',
                      'Endocrinologist',
                      'Orthopedic Surgeon',
                      'Neurologist',
                      'Urologist',
                      'ENT Specialist',
                      'Oncologist',
                      'Gastroenterologist',
                      'Ophthalmologist',
                      'Pulmonologist',
                    ].map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-600">Education</label>
                  <select
                    name="degree"
                    value={editForm.degree}
                    onChange={handleEditChange}
                    className="border rounded px-3 py-2"
                    required
                  >
                    {validDegrees.map((deg) => (
                      <option key={deg} value={deg}>{deg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-gray-600">Address Line 1</label>
                <input
                  name="address1"
                  value={editForm.address1}
                  onChange={handleEditChange}
                  className="border rounded px-3 py-2"
                  type="text"
                  placeholder="Address Line 1"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600">Address Line 2</label>
                <input
                  name="address2"
                  value={editForm.address2}
                  onChange={handleEditChange}
                  className="border rounded px-3 py-2"
                  type="text"
                  placeholder="Address Line 2"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-gray-600">About Doctor</label>
                <textarea
                  name="about"
                  value={editForm.about}
                  onChange={handleEditChange}
                  className="border rounded px-3 py-2"
                  placeholder="Write about doctor"
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;*/
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/AdminContext';

const DoctorsList = () => {
  const { backendUrl, aToken } = useContext(AdminContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [editForm, setEditForm] = useState({
    docImg: null,
    name: '',
    email: '',
    experience: '1 Year',
    fees: '',
    speciality: 'General Physician',
    degree: 'MBBS',
    about: '',
    address1: '',
    address2: '',
  });

  // Valid degrees for dropdown
  const validDegrees = [
    'MBBS',
    'MD',
    'DO',
    'BDS',
    'MS',
    'DNB',
    'FCPS',
    'PhD',
    'DM',
  ];

  // Fetch doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/admin/doctors`, {
          headers: { aToken },
        });
        if (data.success) {
          setDoctors(data.doctors);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [backendUrl, aToken]);

  // Handle doctor deletion
  const handleDelete = async () => {
    try {
      const { data } = await axios.delete(`${backendUrl}/api/admin/delete-doctor/${selectedDoctorId}`, {
        headers: { aToken },
      });
      if (data.success) {
        setDoctors(doctors.filter((doctor) => doctor._id !== selectedDoctorId));
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error(error.response?.data?.message || 'Failed to delete doctor');
    } finally {
      setShowDeleteModal(false);
      setSelectedDoctorId(null);
    }
  };

  // Open edit modal with pre-filled data
  const openEditModal = (doctor) => {
    setEditForm({
      docImg: null,
      name: doctor.name,
      email: doctor.email,
      experience: doctor.experience,
      fees: doctor.fees.toString(),
      speciality: doctor.speciality,
      degree: validDegrees.includes(doctor.degree) ? doctor.degree : 'MBBS',
      about: doctor.about,
      address1: doctor.address.line1,
      address2: doctor.address.line2 || '',
    });
    setSelectedDoctorId(doctor._id);
    setShowEditModal(true);
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      if (editForm.docImg) formData.append('image', editForm.docImg);
      formData.append('name', editForm.name);
      formData.append('email', editForm.email);
      formData.append('experience', editForm.experience);
      formData.append('fees', Number(editForm.fees));
      formData.append('speciality', editForm.speciality);
      formData.append('degree', editForm.degree);
      formData.append('about', editForm.about);
      formData.append('address', JSON.stringify({ line1: editForm.address1, line2: editForm.address2 }));

      const { data } = await axios.patch(
        `${backendUrl}/api/admin/update-doctor/${selectedDoctorId}`,
        formData,
        { headers: { aToken } }
      );

      if (data.success) {
        setDoctors((prev) =>
          prev.map((doc) =>
            doc._id === selectedDoctorId ? { ...doc, ...data.doctor } : doc
          )
        );
        toast.success(data.message);
        setShowEditModal(false);
        setSelectedDoctorId(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
      toast.error(error.response?.data?.message || 'Failed to update doctor');
    }
  };

  // Handle availability toggle
  const handleAvailabilityToggle = async (doctorId, currentStatus) => {
    console.log('Toggling availability for doctorId:', doctorId, 'Current status:', currentStatus);
    console.log('Doctors state before update:', doctors);

    if (!doctorId || typeof currentStatus !== 'boolean') {
      console.error('Invalid doctorId or currentStatus:', { doctorId, currentStatus });
      toast.error('Failed to toggle availability: Invalid data');
      return;
    }

    const originalDoctors = [...doctors];
    setDoctors((prev) =>
      prev.map((doc) =>
        doc._id === doctorId ? { ...doc, available: !currentStatus } : doc
      )
    );

    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/admin/toggle-availability/${doctorId}`,
        { available: !currentStatus },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
      } else {
        setDoctors(originalDoctors);
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      setDoctors(originalDoctors);
      toast.error(error.response?.data?.message || 'Failed to toggle availability');
    }

    console.log('Doctors state after update:', doctors);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-lg font-medium mb-6">All Doctors</h2>
      {loading ? (
        <p className="text-gray-500 text-center">Loading...</p>
      ) : doctors.length === 0 ? (
        <p className="text-gray-500 text-center">No doctors found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group"
            >
              <div className="relative w-full h-48">
                <div className="absolute inset-0 bg-indigo-50 group-hover:bg-primary transition-all duration-500"></div>
                <img
                  src={`${backendUrl}/${doctor.image}`}
                  alt={doctor.name}
                  className="relative w-full h-48 object-cover"
                />
              </div>
              <div className="p-3 text-center">
                <h3 className="text-neutral-800 text-base font-semibold mb-1">{doctor.name}</h3>
                <p className="text-zinc-600 text-xs mb-3">{doctor.speciality}</p>
                <div className="flex justify-center gap-2 mb-3">
                  <button
                    onClick={() => openEditModal(doctor)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDoctorId(doctor._id);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <label className="flex justify-center items-center gap-2 text-gray-600 text-xs">
                  <input
                    type="checkbox"
                    checked={doctor.available || false}
                    onChange={() => handleAvailabilityToggle(doctor._id, doctor.available)}
                    className="w-4 h-4"
                  />
                  Available for Booking
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this doctor?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Doctor</h3>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div className="flex items-center gap-4 text-gray-500">
                <label htmlFor="doc-img">
                  <img
                    className="w-16 h-16 bg-gray-100 rounded-full cursor-pointer object-cover"
                    src={
                      editForm.docImg
                        ? URL.createObjectURL(editForm.docImg)
                        : `${backendUrl}/${doctors.find((d) => d._id === selectedDoctorId)?.image}`
                    }
                    alt="Doctor"
                  />
                </label>
                <input
                  onChange={handleEditChange}
                  type="file"
                  id="doc-img"
                  name="docImg"
                  accept="image/*"
                  hidden
                />
                <p>Upload new doctor picture (optional)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-gray-600">Doctor Name</label>
                  <input
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="border rounded px-3 py-2"
                    type="text"
                    placeholder="Name"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-600">Doctor Email</label>
                  <input
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    className="border rounded px-3 py-2"
                    type="email"
                    placeholder="Email"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-600">Experience</label>
                  <select
                    name="experience"
                    value={editForm.experience}
                    onChange={handleEditChange}
                    className="border rounded px-3 py-2"
                  >
                    {['1 Year', '2 Year', '3 Year', '4 Year', '5 Year', '6 Year', '7 Year', '8 Year', '9 Year', '10 Year'].map((exp) => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-600">Fees</label>
                  <input
                    name="fees"
                    value={editForm.fees}
                    onChange={handleEditChange}
                    className="border rounded px-3 py-2"
                    type="number"
                    placeholder="Fees"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-600">Speciality</label>
                  <select
                    name="speciality"
                    value={editForm.speciality}
                    onChange={handleEditChange}
                    className="border rounded px-3 py-2"
                  >
                    {[
                      'General Physician',
                      'Cardiologist',
                      'Dermatologist',
                      'Gynecologist',
                      'Pediatrician',
                      'Psychiatrist',
                      'Endocrinologist',
                      'Orthopedic Surgeon',
                      'Neurologist',
                      'Urologist',
                      'ENT Specialist',
                      'Oncologist',
                      'Gastroenterologist',
                      'Ophthalmologist',
                      'Pulmonologist',
                    ].map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-600">Education</label>
                  <select
                    name="degree"
                    value={editForm.degree}
                    onChange={handleEditChange}
                    className="border rounded px-3 py-2"
                    required
                  >
                    {validDegrees.map((deg) => (
                      <option key={deg} value={deg}>{deg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-gray-600">Address Line 1</label>
                <input
                  name="address1"
                  value={editForm.address1}
                  onChange={handleEditChange}
                  className="border rounded px-3 py-2"
                  type="text"
                  placeholder="Address Line 1"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600">Address Line 2</label>
                <input
                  name="address2"
                  value={editForm.address2}
                  onChange={handleEditChange}
                  className="border rounded px-3 py-2"
                  type="text"
                  placeholder="Address Line 2"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-gray-600">About Doctor</label>
                <textarea
                  name="about"
                  value={editForm.about}
                  onChange={handleEditChange}
                  className="border rounded px-3 py-2"
                  placeholder="Write about doctor"
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;