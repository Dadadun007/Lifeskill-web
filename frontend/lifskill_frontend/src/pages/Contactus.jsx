import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { Mail, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import Header from './Header';

const Contactus = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    topic: '',
    description: ''
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: false,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: false, message: '' });

    try {
      const templateParams = {
        from_name: formData.username,
        to_name: 'Admin',
        subject: formData.topic,
        message: formData.description,
        reply_to: formData.email // Use the user's email as reply_to
      };

      await emailjs.send(
        'service_q3g5qiv',
        'template_p91it3t',
        templateParams,
        'JCcTZkYRCy8J9sKwQ'
      );

      setStatus({
        loading: false,
        success: true,
        error: false,
        message: 'Message sent successfully! We will get back to you soon.'
      });

      // Clear form after successful submission
      setFormData({
        username: '',
        email: '',
        topic: '',
        description: ''
      });

      // Redirect to home page after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        error: true,
        message: 'Failed to send message. Please try again later.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Contact Us</h1>
          </div>

          {status.success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                <p>{status.message}</p>
              </div>
            </div>
          )}

          {status.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p>{status.message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                Topic
              </label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="What is this about?"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your message here..."
              />
            </div>

            <button
              type="submit"
              disabled={status.loading}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-medium rounded-lg ${
                status.loading
                  ? 'bg-[#3498db] cursor-not-allowed'
                  : 'bg-[#2e86c1] hover:bg-[#2471a3]'
              }`}
            >
              {status.loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contactus;
