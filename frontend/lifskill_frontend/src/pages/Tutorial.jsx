import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, User, Plus, X, Edit3, Camera, Home, MessageCircle, Users, Bell, ChevronDown, Check, Mail } from 'lucide-react';
import Header from './Header';

function Tutorial() {
  const [currentStep, setCurrentStep] = useState('overview');

  const PostPreview = ({ size = "normal" }) => (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${size === "small" ? "w-64" : "w-80"} border`}>
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <div className="w-6 h-6 bg-white bg-opacity-30 rounded flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
            <div className="w-6 h-6 bg-white bg-opacity-30 rounded flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="w-6 h-6 bg-white bg-opacity-30 rounded flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Create Post</h3>
          <X className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
        </div>
        
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 h-20 rounded-lg shadow-inner"></div>
          <div className="space-y-2">
            <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
            <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-4/5"></div>
            <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-3/5"></div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="flex space-x-2">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
            </div>
            <button className="bg-gradient-to-r bg-[#3498db] hover:bg-blue-900 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-md">
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ProfilePreview = ({ size = "normal" }) => (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${size === "small" ? "w-64" : "w-80"} border`}>
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-3">
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Edit Profile</h3>
          <div className="relative inline-block">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full shadow-lg"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-gray-200 shadow-md">
              <Camera className="w-3 h-3 text-gray-600" />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
            <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mt-2"></div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
            <div className="space-y-2 mt-2">
              <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-4/5"></div>
            </div>
          </div>
        
          <div className="flex justify-end pt-4">
            <button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-md">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Post detail view
  if (currentStep === 'post') {
    return (
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto p-6 flex-1">
          <div className="flex items-center space-x-4 mb-8">
            <button 
              onClick={() => setCurrentStep('overview')}
              className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Tutorial</h1>
              <h2 className="text-xl text-gray-600 mt-1">How to use Life Skill</h2>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Post</h3>
                <div className="space-y-4 text-gray-600">
                  <p className="text-lg leading-relaxed">Learn how to create engaging posts on Life Skill platform. Share your thoughts, experiences, and connect with the community.</p>
                  <p className="text-lg leading-relaxed">Add images, write compelling content, and engage with your audience through our intuitive posting interface.</p>
                </div>
              </div>
              <div className="flex justify-center">
                <PostPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile detail view
  if (currentStep === 'profile') {
    return (
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto p-6 flex-1">
          <div className="flex items-center space-x-4 mb-8">
            <button 
              onClick={() => setCurrentStep('overview')}
              className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Tutorial</h1>
              <h2 className="text-xl text-gray-600 mt-1">How to use Life Skill</h2>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center lg:order-1">
                <ProfilePreview />
              </div>
              <div className="lg:order-2">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h3>
                <div className="space-y-4 text-gray-600">
                  <p className="text-lg leading-relaxed">Customize your profile to represent yourself in the Life Skill community. Update your photo, bio, and personal information.</p>
                  <p className="text-lg leading-relaxed">Make your profile stand out and help others connect with you by sharing your interests and location.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Approve Post detail view
  if (currentStep === 'approve') {
    return (
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto p-6 flex-1">
          <div className="flex items-center space-x-4 mb-8">
            <button 
              onClick={() => setCurrentStep('overview')}
              className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Tutorial</h1>
              <h2 className="text-xl text-gray-600 mt-1">How to use Life Skill</h2>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Approve Post</h3>
                <div className="space-y-4 text-gray-600">
                  <p className="text-lg leading-relaxed">Learn how to approve posts as an expert. Review pending posts and help maintain quality content in the community.</p>
                  <p className="text-lg leading-relaxed">Click the Approve button on posts that match your expertise. Once a post receives enough approvals, it will be published.</p>
                </div>
              </div>
              <div className="p-4 max-w-md mx-auto border border-black rounded-xl shadow">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Post requests</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-2 mb-4">
            <img
              src="https://i.pravatar.cc/40?img=5"
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-medium text-gray-700 text-sm">User</span>
          </div>

          {/* Post Title & Content */}
          <h4 className="font-semibold text-gray-800 text-base mb-2">Topic</h4>
          <p className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mb-3 "></p> 
          <p className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mb-3 "></p> 

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg font-medium flex items-center justify-center space-x-1 text-sm"
            >
              <X className="w-4 h-4" />
              <span>Unapprove</span>
            </button>
            <button
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg font-medium flex items-center justify-center space-x-1 text-sm"
            >
              <Check className="w-4 h-4" />
              <span>Approve</span>
            </button>
          </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

  // Contact Us detail view
  if (currentStep === 'contact') {
    return (
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto p-6 flex-1">
          <div className="flex items-center space-x-4 mb-8">
            <button 
              onClick={() => setCurrentStep('overview')}
              className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Tutorial</h1>
              <h2 className="text-xl text-gray-600 mt-1">How to use Life Skill</h2>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Contact Us</h3>
                <div className="space-y-4 text-gray-600">
                  <p className="text-lg leading-relaxed">Need help or have feedback? Contact our support team anytime.</p>
                  <p className="text-lg leading-relaxed">You can reach us via email or through the contact form on our website.</p>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-64 h-32 bg-gradient-to-br from-blue-200 to-blue-400 rounded-lg flex items-center justify-center">
                  <Mail className="w-16 h-16 text-blue-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Main overview
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto p-6 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Tutorial</h1>
          <h2 className="text-xl text-gray-600 mt-1">How to use Life Skill</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div 
            className="cursor-pointer group"
            onClick={() => setCurrentStep('post')}
          >
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 transform hover:-translate-y-2">
              <h3 className="text-2xl font-bold text-gray-800 group-hover:text-teal-600 transition-colors mb-4">Post</h3>
              <div className="space-y-3 text-gray-600 mb-8">
                <p className="text-lg">Learn to create engaging posts</p>
                <p className="text-lg">Share your experiences with the community</p>
              </div>
              <div className="flex justify-center">
                <PostPreview size="small" />
              </div>
            </div>
          </div>

          <div 
            className="cursor-pointer group"
            onClick={() => setCurrentStep('profile')}
          >
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 transform hover:-translate-y-2">
              <h3 className="text-2xl font-bold text-gray-800 group-hover:text-teal-600 transition-colors mb-4">Edit Profile</h3>
              <div className="space-y-3 text-gray-600 mb-8">
                <p className="text-lg">Customize your personal profile</p>
                <p className="text-lg">Connect with others in the community</p>
              </div>
              <div className="flex justify-center">
                <ProfilePreview size="small" />
              </div>
            </div>
          </div>

          <div className="cursor-pointer group" onClick={() => setCurrentStep('approve')}>
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 transform hover:-translate-y-2">
              <h3 className="text-2xl font-bold text-gray-800 group-hover:text-teal-600 transition-colors mb-4">Approve Post</h3>
              <div className="space-y-3 text-gray-600 mb-8">
                <p className="text-lg">Learn how to approve posts as an expert</p>
                <p className="text-lg">Help maintain quality content in the community</p>
              </div>
              <div className="flex justify-center">
                <div className="w-32 h-20 bg-gradient-to-br from-green-200 to-green-400 rounded-lg flex items-center justify-center">
                  <Check className="w-10 h-10 text-green-700" />
                </div>
              </div>
            </div>
          </div>

          <div className="cursor-pointer group" onClick={() => setCurrentStep('contact')}>
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 transform hover:-translate-y-2">
              <h3 className="text-2xl font-bold text-gray-800 group-hover:text-teal-600 transition-colors mb-4">Contact Us</h3>
              <div className="space-y-3 text-gray-600 mb-8">
                <p className="text-lg">Need help or have feedback?</p>
                <p className="text-lg">Contact our support team anytime</p>
              </div>
              <div className="flex justify-center">
                <div className="w-32 h-20 bg-gradient-to-br from-blue-200 to-blue-400 rounded-lg flex items-center justify-center">
                  <Mail className="w-10 h-10 text-blue-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tutorial;
