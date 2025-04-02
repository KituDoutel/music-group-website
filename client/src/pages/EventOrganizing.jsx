import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EventOrganizing = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    eventDate: '',
    eventType: 'private',
    attendees: 50,
    specialRequests: ''
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/events', formData);
      alert('Booking submitted successfully!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Error submitting booking');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Book Our Band</h2>
      
      <div className="mb-4">
        <label className="block mb-2">Full Name</label>
        <input 
          type="text" 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      {/* Tambahkan field lainnya... */}
      
      <button 
        type="submit" 
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit Booking
      </button>
    </form>
  );
};

export default EventOrganizing;