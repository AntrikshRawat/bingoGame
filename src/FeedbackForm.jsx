import React, { useState } from 'react';
import Alert from './Alert';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [alert, setAlert] = useState({
    message: '',
    type: ''
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_key: '1493b952-0c2f-44d5-a187-e8bc160a2eaf',
        subject: 'New Contact Form Submission from Bingo Website',
        from_name: 'Bingo Website',
        name: formData.name,
        email: formData.email,
        message: formData.message
      })
    });
    if (response.ok) {
      setAlert({
        message: 'Thank you for your feedback!',
        type: 'success'
      });
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    }
  };

  return (
    <div className="w-full bg-gray-900 py-10">
     <Alert key={Date.now()} message={alert.message} type={alert.type}/>
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Any Suggestions?</h2>
          <form method="POST" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-200 mb-1">
                Message/Suggestions
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              ></textarea>
            </div>
            <div className='flex justify-center'>
              <button
                type="submit"
                className="w-full md:w-1/4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
