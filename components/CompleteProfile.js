import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CompleteProfile() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);

  const [designation, setDesignation] = useState('');
  const [formData, setFormData] = useState({
    googleId: '',
    name: '',
    email: '',
    avatar: ''
  });

  useEffect(() => {
    setFormData({
      googleId: params.get('googleId'),
      name: params.get('name'),
      email: params.get('email'),
      avatar: params.get('avatar')
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/google/register', {
        ...formData,
        designation
      });
      // Save token and redirect
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      alert('Failed to complete registration');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Complete Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <p>Name: {formData.name}</p>
        <p>Email: {formData.email}</p>
        <label className="block mt-4">
          Designation:
          <input 
            type="text" 
            value={designation} 
            onChange={(e) => setDesignation(e.target.value)} 
            required 
            className="border p-2 w-full mt-1"
          />
        </label>
        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
      </form>
    </div>
  );
}

export default CompleteProfile;
