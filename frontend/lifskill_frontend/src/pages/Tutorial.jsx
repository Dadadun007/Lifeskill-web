import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, X, Home, MessageCircle, Users, UserRoundPen, Check, Mail,SquarePen } from 'lucide-react';
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
      
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Create Post</h3>
          <X className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
        </div>
        
        <div className="space-y-2">
          <div className="bg-gray-300 text-gray-600 px-3 py-2  h-10 rounded-lg shadow-inner"> 
            Title </div>
          <div className="space-y-2">
            <div className="bg-gray-300 text-gray-600 px-3 py-3 to-gray-900 h-20 rounded-lg shadow-inner"> 
            Content (optional) </div>
          <div className="space-y-2"></div>
          <div>
            <button className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-md">
              Category
            </button>
            
          </div>

          <div>
            <button className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-md">
              import file
            </button>
          </div>
          <div>
            <div className="bg-gray-300 text-gray-600 px-3 py-2 to-gray-900 h-10 rounded-lg shadow-inner"> 
              Iink Youtube Video (optional)
            </div>
          </div>
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
      </div>
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Edit Profile</h3>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full shadow-lg"></div>
            <button className="bg-gray-100 hover:bg-blue-900 text-gray-500 px-3 py-0.5 rounded-lg text-xs shadow-md">
              Upload Profile
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="bg-gray-200 text-gray-600 px-2 py-1 to-gray-900 h-8 text-sm rounded-lg shadow-inner"> 
              Name
            </div>
          </div>
         <div>
            <div className="bg-gray-200 text-gray-600 px-2 py-1 to-gray-900 h-8 text-sm rounded-lg shadow-inner"> 
              Email
            </div>
          </div>
        <div className="flex space-x-2">
          <div className="bg-gray-200 text-gray-600 px-2 py-1 h-8 w-30 text-sm rounded-lg shadow-inner">
            Age
          </div>
          <div className="bg-gray-200 text-gray-600 px-2 py-1 h-8 w-30 rounded-lg shadow-inner">
            Gender
          </div>
        </div>
          <div>
            <button className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-md">
              talents
            </button>
          </div>
             <div className="flex justify-center gap-2">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg font-medium flex items-center justify-center space-x-1 text-sm"
                    >
                      <span>Save</span>
                    </button>
                    <button
                      className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-lg font-medium flex items-center justify-center space-x-1 text-sm"
                    >
                      <span>Cancel</span>
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
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Create Post</h3>
                <div className="space-y-4 text-gray-600">
                  <p className="text-lg leading-relaxed">1. กด + Create Post ด้านบนขวา</p>
                  <p className="text-lg leading-relaxed">2. กรอกข้อมูลที่ต้องการโพสต์หัวข้อใน Title และเนื้อหาใน Content  </p>
                  <p className="text-lg leading-relaxed">3. เลือกประเภทหมวดหมู่ใน Category  </p>
                  <p className="text-lg leading-relaxed">3. อัพรูปภาพ 1 รูปใน import file   </p>
                  <p className="text-lg leading-relaxed">4. ถ้ามีลิงค์วิดีโอให้ใส่ใน Link Youtube   </p>
                  <p className="text-lg leading-relaxed">5. ตรวจทานให้เรียบร้อยแล้วกด Post  </p>
                  <p className="text-sm leading-relaxed">*ทุกคนจะเห็นโพสต์ได้ต่อเมื่อมีคนอนุมัติโพสต์นั้น 3 คน* </p>
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
                  <p className="text-lg leading-relaxed">1.กดที่รูปบัญชีผู้ใช้ด้านขวาบนแล้วกด Profile </p>
                  <p className="text-lg leading-relaxed">2.กดที่ Edit Profile </p>
                  <p className="text-lg leading-relaxed">3.แก้ไขชื่อผู้ใช้งานที่ Name </p>
                  <p className="text-lg leading-relaxed">4.แก้ไขอีเมลของบัญชีได้ที่ Email</p>
                  <p className="text-lg leading-relaxed">5.แก้ไขอายุผู้ใช้ได้ที่ Age</p>
                  <p className="text-lg leading-relaxed">6.แก้ไขเพศผู้ใช้ได้ที่ Gender</p>
                  <p className="text-lg leading-relaxed">7.เพิ่มและแก้ไขความถนัดและสนใจของผู้ใช้ได้ที่ talents</p>
                  <p className="text-lg leading-relaxed">8.ตรวจทานให้เรียบร้อยแล้วกด Save เพื่อยืนยันการเปลี่ยนข้อมูล</p>
                  <p className="text-sm leading-relaxed">*หากไม่ต้องการเปลี่ยนรหัสแล้วให้กด Cancel และ ไม่จำเป็นต้องแก้ไขทุกเมนูในครั้งเดียว* </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
   // Change Password detail view
   if (currentStep === 'changepassword') {
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
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h3>
                <div className="space-y-4 text-gray-600">
                   <p className="text-lg leading-relaxed">1.กดที่รูปบัญชีผู้ใช้ด้านขวาบนแล้วกด Profile </p>
                  <p className="text-lg leading-relaxed">2.กดที่ Change Password </p>
                  <p className="text-lg leading-relaxed">3.กรอกรหัสปัจจุบันใน Current Password </p>
                  <p className="text-lg leading-relaxed">4.กรอกรหัสใหม่ใน New Password </p>
                  <p className="text-lg leading-relaxed">5.กรอกรหัสใหม่อีกครั้งเพื่อยืนยันใน Confirm New Password </p>
                  <p className="text-lg leading-relaxed">6.ตรวจทานให้เรียบร้อยแล้วกด Confirm เพื่อยืนยันการเปลี่ยนรหัส </p>
                  <p className="text-sm leading-relaxed">*หากไม่ต้องการเปลี่ยนรหัสแล้วให้กด Cancel* </p>
                </div>
              </div>
              <div className="p-4 w-70 mx-auto border border-black rounded-xl shadow">
                    {/* Header */}
                    <div className="flex justify-center items-center mb-4">
                      <h3 className="text-lg font-semibold">Change Password</h3>
                    </div>

                    {/* User Info */}
                    <div className="space-y-2 mb-2 ">
                      <div className="bg-gray-200 text-gray-600 px-2 py-1 to-gray-900 h-8 text-sm rounded-lg shadow-inner"> 
                        Current Password
                      </div>
                      <div>
                      <div className="bg-gray-200 text-gray-600 px-2 py-1 to-gray-900 h-8 text-sm rounded-lg shadow-inner"> 
                        New Password
                      </div>
                    </div>
                    <div>
                      <div className="bg-gray-200 text-gray-600 px-2 py-1 to-gray-900 h-8 text-sm rounded-lg shadow-inner"> 
                        Confirm New Password
                      </div>
                    </div>
                    </div>
                    <div className="flex justify-center gap-2">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg font-medium flex items-center justify-center space-x-1 text-sm"
                    >
                      <span>Confirm</span>
                    </button>
                    <button
                      className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-lg font-medium flex items-center justify-center space-x-1 text-sm"
                    >
                      <span>Cancel</span>
                    </button>
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
                  <p className="text-lg leading-relaxed">1.กดที่รูปบัญชีผู้ใช้ด้านขวาบนแล้วกด Post Requests</p>
                  <p className="text-lg leading-relaxed mb-1">2.กดเลือกโพสต์ที่ต้องการอนุมัติ</p>
                  <p className="text-sm leading-none px-2 mt-0 text-gray-600">*อนุมัติเพื่อให้โพสต์นั้นมีความเชื่อถือ</p>
                  <p className="text-lg leading-relaxed ">3.ดูและตรวจทานเนื้อหาของโพสต์ว่ามีความน่าเชื่อถือมั้ย</p>
                  <p className="text-lg leading-relaxed ">4.ถ้าโพสต์มีความน่าเชื่อถือให้กด Approve</p>
                  <p className="text-lg leading-relaxed ">5.ถ้าโพสต์ไม่มีความน่าเชื่อถือให้กด Unapprove</p>
                  <p className="text-sm leading-relaxed ">*เมื่อมีการอนุมัติโพสต์ครบ 3 คน โพสต์จะแสดงขึ้นในหน้าหลัก*</p>
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
                  <p className="text-lg leading-relaxed">1.กดที่รูปบัญชีผู้ใช้ด้านขวาบนแล้วกด Contact us</p>
                  <p className="text-lg leading-relaxed">2.กรอกชื่อผู้ใช้ของตัวเองที่ Your Name</p>
                  <p className="text-lg leading-relaxed">3.กรอกอีเมลบัญชีผู้ใช้ของตัวเองที่ Email Address</p>
                  <p className="text-lg leading-relaxed">4.กรอกหัวข้อที่จ้องการแจ้งทางแอดมิน Topic</p>
                  <p className="text-lg leading-relaxed">5.กรอกข้อความที่ต้องการบอกแอดมิน Message</p>
                  <p className="text-lg leading-relaxed">6.ตรวจทานให้เรียบร้อยแล้วกด Send Message เพื่อส่งข้อมูลให้แอดมิน</p>
                </div>
              </div>
              <div className="p-4 w-70 mx-auto border border-black rounded-xl shadow">
                    {/* Header */}
                    <div className="flex  items-center mb-4">
                      <h3 className="text-lg font-semibold">Contact Us</h3>
                    </div>

                    {/* User Info */}
                    <div className="space-y-2 mb-2 ">
                      <div className="bg-gray-200 text-gray-600 px-2 py-1 to-gray-900 h-8 text-sm rounded-lg shadow-inner"> 
                        Your Name
                      </div>
                      <div>
                      <div className="bg-gray-200 text-gray-600 px-2 py-1 to-gray-900 h-8 text-sm rounded-lg shadow-inner"> 
                        Email Address
                      </div>
                    </div>
                    <div>
                      <div className="bg-gray-200 text-gray-600 px-2 py-1 to-gray-900 h-8 text-sm rounded-lg shadow-inner"> 
                        Topic
                      </div>
                    </div>
                    <div>
                      <div className="bg-gray-200 text-gray-600 px-2 py-1 to-gray-900 h-15 text-sm rounded-lg shadow-inner"> 
                        Message
                      </div>
                    </div>
                    </div>
                    <div className="flex justify-center gap-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg font-medium flex items-center justify-center space-x-1 text-sm"
                    >
                      <span>Send Message</span>
                    </button>
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
              <h3 className="text-2xl font-bold text-gray-800 group-hover:text-teal-600 transition-colors mb-4">Create Post</h3>
              <div className="space-y-3 text-gray-600 mb-8">
                <p className="text-lg">วิธีการสร้างโพสต์</p>
                <p className="text-lg">เพื่อแชร์ความรู้ให้กับคนอื่นได้รู้กัน !</p>
              </div>
              <div className="flex justify-center">
                <div className="w-32 h-20 bg-gradient-to-br from-teal-200 to-teal-400 rounded-lg flex items-center justify-center">
                  <SquarePen className="w-10 h-10 text-teal-700" />
                </div>
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
                <p className="text-lg">วิธีการแก้ไขข้อมูลผู้ใช้</p>
                <p className="text-lg">แก้ไขหรือตกแต่งโปรไฟล์ให้เหมาะกับตัวเรา</p>
              </div>
             <div className="flex justify-center">
                <div className="w-32 h-20 bg-gradient-to-br from-purple-200 to-purple-400 rounded-lg flex items-center justify-center">
                  <UserRoundPen className="w-10 h-10 text-purple-700" />
                </div>
              </div>
            </div>
          </div>

           <div className="cursor-pointer group" onClick={() => setCurrentStep('changepassword')}>
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 transform hover:-translate-y-2">
              <h3 className="text-2xl font-bold text-gray-800 group-hover:text-teal-600 transition-colors mb-4">Change Password</h3>
              <div className="space-y-3 text-gray-600 mb-8">
                <p className="text-lg">วิธีการเปลี่ยนรหัสผ่าน</p>
                <p className="text-lg">รหัสนี้มันง่ายไปแล้วเปลี่ยนได้นะ</p>
              </div>
              <div className="flex justify-center">
                <div className="w-32 h-20 bg-gradient-to-br from-red-200 to-red-400 rounded-lg flex items-center justify-center">
                  <Lock className="w-10 h-10 text-red-700" />
                </div>
              </div>
            </div>
          </div>

          <div className="cursor-pointer group" onClick={() => setCurrentStep('approve')}>
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 transform hover:-translate-y-2">
              <h3 className="text-2xl font-bold text-gray-800 group-hover:text-teal-600 transition-colors mb-4">Approve Post</h3>
              <div className="space-y-3 text-gray-600 mb-8">
                <p className="text-lg">วิธีการอนุมัติโพสต์คนอื่น</p>
                <p className="text-lg">โพสต์ไหนน่าเชื่อถืออย่าลืมอนุมัตินะ</p>
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
                <p className="text-lg">วิธีการแจ้งปัญหาหรือแสดงความคิดเห็นต่อเว็บไซต์นี้</p>
                <p className="text-lg">เกิดปัญหาในการใช้แอดมินช่วยคุณได้</p>
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
