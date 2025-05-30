import React, { useState, useContext } from 'react';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const AddDoctor = () => {
    const [docImg, setDocImg] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [experience, setExperience] = useState('1 Year');
    const [fees, setFees] = useState('');
    const [about, setAbout] = useState('');
    const [speciality, setSpeciality] = useState('General Physician');
    const [degree, setDegree] = useState('MBBS');
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [loading, setLoading] = useState(false); // Added loading state

    const { backendUrl, aToken } = useContext(AdminContext);

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

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        try {
            setLoading(true); // Set loading to true when submission starts

            if (!docImg) {
                setLoading(false); // Reset loading if validation fails
                return toast.error('Image Not Selected');
            }

            const formData = new FormData();
            formData.append('image', docImg);
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('experience', experience);
            formData.append('fees', Number(fees));
            formData.append('about', about);
            formData.append('speciality', speciality);
            formData.append('degree', degree);
            formData.append('address', JSON.stringify({ line1: address1, line2: address2 }));

            const { data } = await axios.post(`${backendUrl}/api/admin/add-doctor`, formData, {
                headers: { aToken },
            });

            if (data.success) {
                toast.success(data.message);
                setDocImg(false);
                setName('');
                setEmail('');
                setPassword('');
                setExperience('1 Year');
                setFees('');
                setAbout('');
                setSpeciality('General Physician');
                setDegree('MBBS');
                setAddress1('');
                setAddress2('');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error adding doctor:', error);
            toast.error(error.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false); // Reset loading state after submission
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className="m-5 w-full">
            <p className="mb-3 text-lg font-medium">Add Doctor</p>
            <div className="bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll">
                <div className="flex items-center gap-4 mb-8 text-gray-500">
                    <label htmlFor="doc-img">
                        <img
                            className="w-16 bg-gray-100 rounded-full cursor-pointer"
                            src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                            alt=""
                        />
                    </label>
                    <input
                        onChange={(e) => setDocImg(e.target.files[0])}
                        type="file"
                        id="doc-img"
                        hidden
                    />
                    <p>
                        Upload doctor <br /> picture
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
                    <div className="w-full lg:flex-1 flex flex-col gap-4">
                        <div className="flex-1 flex flex-col gap-1">
                            <p>Doctor name</p>
                            <input
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                                className="border rounded px-3 py-2"
                                type="text"
                                placeholder="Name"
                                required
                            />
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                            <p>Doctor Email</p>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                className="border rounded px-3 py-2"
                                type="email"
                                placeholder="Email"
                                required
                            />
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                            <p>Doctor Password</p>
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                className="border rounded px-3 py-2"
                                type="password"
                                placeholder="Password"
                                required
                            />
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                            <p>Experience</p>
                            <select
                                onChange={(e) => setExperience(e.target.value)}
                                value={experience}
                                className="border rounded px-3 py-2"
                            >
                                {['1 Year', '2 Year', '3 Year', '4 Year', '5 Year', '6 Year', '7 Year', '8 Year', '9 Year', '10 Year'].map((exp) => (
                                    <option key={exp} value={exp}>{exp}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                            <p>Fees</p>
                            <input
                                onChange={(e) => setFees(e.target.value)}
                                value={fees}
                                className="border rounded px-3 py-2"
                                type="number"
                                placeholder="Fees"
                                required
                            />
                        </div>
                    </div>
                    <div className="w-full lg:flex-1 flex flex-col gap-4">
                        <div className="flex-1 flex flex-col gap-1">
                            <p>Speciality</p>
                            <select
                                onChange={(e) => setSpeciality(e.target.value)}
                                value={speciality}
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
                        <div className="flex-1 flex flex-col gap-1">
                            <p>Education</p>
                            <select
                                onChange={(e) => setDegree(e.target.value)}
                                value={degree}
                                className="border rounded px-3 py-2"
                                required
                            >
                                {validDegrees.map((deg) => (
                                    <option key={deg} value={deg}>{deg}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                            <p>Address</p>
                            <input
                                onChange={(e) => setAddress1(e.target.value)}
                                value={address1}
                                className="border rounded px-3 py-2"
                                type="text"
                                placeholder="Address Line 1"
                                required
                            />
                            <input
                                onChange={(e) => setAddress2(e.target.value)}
                                value={address2}
                                className="border rounded px-3 py-2"
                                type="text"
                                placeholder="Address Line 2"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <p className="mt-4 mb-2">About Doctor</p>
                    <textarea
                        onChange={(e) => setAbout(e.target.value)}
                        value={about}
                        className="w-full px-4 pt-2 border rounded"
                        placeholder="Write about doctor"
                        rows={5}
                        required
                    />
                </div>
                <button
    type="submit"
    className={`px-10 py-3 text-white rounded-full mt-4 transition-all duration-300 flex items-center justify-center ${
        loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-primary hover:bg-blue-700'
    }`}
    disabled={loading}
>
    {loading ? (
        <>
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z"></path>
            </svg>
            Adding Doctor...
        </>
    ) : (
        'Add Doctor'
    )}
</button>
            </div>
        </form>
    );
};

export default AddDoctor;