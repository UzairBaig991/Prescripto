import React, { useState, useEffect, useContext } from 'react';
import { assets } from '../assets/assets_frontend/assets';
import { AppContext } from '../Context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const MyProfile = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "Tanveer Ahmed",
    image: assets.profile_pic,
    email: "richardjameswap@gmail.com",
    phone: "+92 123 456 7890",
    address: {
      line1: "lane 8 misrial road ghoukh gujra",
      line2: "street 13 G13/4 Islamabad",
    },
    gender: "Male",
    dob: "2000-01-20"
  });

  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name,
    phone: userData.phone,
    address: userData.address,
    gender: userData.gender,
    dob: userData.dob,
    image: null
  });

  // Fetch user profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      console.log('Sending request with headers:', { Authorization: `Bearer ${token}` });
      const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Get profile response:', data);
      if (data.success) {
        setUserData(data.userData);
        setFormData({
          name: data.userData.name,
          phone: data.userData.phone,
          address: data.userData.address,
          gender: data.userData.gender,
          dob: data.userData.dob,
          image: null
        });
      } else {
        if (data.message === 'Unauthorized: User ID not found' || data.message === 'Invalid token') {
          toast.error('Session expired. Please log in again.');
          setToken(null);
          navigate('/login');
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch profile';
      console.log('Get profile error:', error.response?.data);
      if (errorMsg === 'Unauthorized: User ID not found' || errorMsg === 'Invalid token' || errorMsg === 'No token provided') {
        toast.error('Session expired. Please log in again.');
        setToken(null);
        navigate('/login');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setFormData({ ...formData, image: selectedImage });
    console.log('Selected new image:', selectedImage ? selectedImage.name : 'None');
  };

  // Handle form submission to update profile
  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('address', JSON.stringify(formData.address));
    formDataToSend.append('gender', formData.gender);
    formDataToSend.append('dob', formData.dob);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const { data } = await axios.post(`${backendUrl}/api/user/update-profile`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Update profile response:', data);
      if (data.success) {
        toast.success('Profile updated successfully!');
        const updatedUserData = {
          ...data.userData,
          image: data.userData.image ? `${backendUrl}${data.userData.image}` : assets.profile_pic
        };
        setUserData(updatedUserData);
        console.log('Updated userData.image:', updatedUserData.image);
        setFormData({
          name: data.userData.name,
          phone: data.userData.phone,
          address: data.userData.address,
          gender: data.userData.gender,
          dob: data.userData.dob,
          image: null
        });
        setIsEdit(false);
      } else {
        if (data.message === 'Unauthorized: User ID not found' || data.message === 'Invalid token') {
          toast.error('Session expired. Please log in again.');
          setToken(null);
          navigate('/login');
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update profile';
      console.log('Update profile error:', error.response?.data);
      if (errorMsg === 'Unauthorized: User ID not found' || errorMsg === 'Invalid token' || errorMsg === 'No token provided') {
        toast.error('Session expired. Please log in again.');
        setToken(null);
        navigate('/login');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Token from AppContext:', token);
    console.log('Token from localStorage:', localStorage.getItem('token'));
    if (token) {
      fetchProfile();
    } else {
      toast.error('Please log in to view your profile.');
      navigate('/login');
    }
  }, [token, navigate]);

  return (
    <div className="max-w-lg flex flex-col gap-2 text-sm">
      <div className="relative w-36 h-36">
        {isEdit ? (
          <label htmlFor="image">
            <div className="inline-block relative cursor-pointer">
              <img
                className="w-36 h-36 rounded opacity-75"
                src={formData.image ? URL.createObjectURL(formData.image) : userData.image}
                alt=""
                onError={(e) => {
                  console.log('Failed to load profile image:', formData.image ? 'Preview' : userData.image);
                  e.target.src = assets.profile_pic;
                }}
              />
              {/* Overlay to indicate editability */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
                <img src={assets.upload_icon} alt="Upload" className="w-8 h-8 opacity-80" />
              </div>
            </div>
            <input
              onChange={handleImageChange}
              type="file"
              id="image"
              accept="image/*"
              hidden
            />
          </label>
        ) : (
          <img
            className="w-36 h-36 rounded object-cover"
            src={userData.image}
            alt=""
            onError={(e) => {
              console.log('Failed to load profile image:', userData.image);
              e.target.src = assets.profile_pic;
            }}
          />
        )}
      </div>

      {isEdit ? (
        <input
          className="bg-gray-50 text-3xl font-medium max-w-60 mt-4"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
      ) : (
        <p className="font-medium text-3xl text-neutral-800 mt-4">{userData.name}</p>
      )}

      <hr className="bg-zinc-400 h-[1px] border-none" />
      <div>
        <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Email id:</p>
          <p className="text-blue-500">{userData.email}</p>
          <p className="font-medium">Phone:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-52"
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          ) : (
            <p className="text-blue-400">{userData.phone}</p>
          )}
          <p className="font-medium">Address:</p>
          {isEdit ? (
            <div>
              <input
                className="bg-gray-50"
                name="address.line1"
                value={formData.address.line1}
                onChange={handleChange}
              />
              <br />
              <input
                className="bg-gray-50"
                name="address.line2"
                value={formData.address.line2}
                onChange={handleChange}
              />
            </div>
          ) : (
            <p className="text-gray-500">
              {userData.address.line1}
              <br />
              {userData.address.line2}
            </p>
          )}
        </div>
        <p className="text-neutral-500 underline mt-3">BASIC INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Gender:</p>
          {isEdit ? (
            <select
              className="max-w-20 bg-gray-100"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <p className="text-gray-400">{userData.gender}</p>
          )}
          <p className="font-medium">Birthday:</p>
          {isEdit ? (
            <input
              className="max-w-28 bg-gray-100"
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
          ) : (
            <p className="text-gray-400">{userData.dob}</p>
          )}
        </div>
      </div>
      <div className="mt-10">
        {isEdit ? (
          <button
            className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save information'}
          </button>
        ) : (
          <button
            className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
            onClick={() => setIsEdit(true)}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;