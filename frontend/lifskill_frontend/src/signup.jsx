import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'


function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("Not specified");
    const [isError, setIsError] = useState(false);
  
    const handleSubmit = (e) => {
      e.preventDefault();
  
      if (
        username.trim() === "" ||
        email.trim() === "" ||
        password.trim() === "" ||
        confirmPassword.trim() === "" ||
        age.trim() === "" ||
        password !== confirmPassword
      ) {
        setIsError(true);
      } else {
        setIsError(false);
        console.log("Username:", username);
        console.log("Email:", email);
        console.log("Password:", password);
        console.log("Age:", age);
        console.log("Gender:", gender);
      }
    };
  
    return  (
        <div className="flex flex-col justify-center items-center h-screen bg-[#373737]">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-y-4 bg-white shadow-xl rounded-2xl p-6 w-screen max-w-xl"
          >
            <div className="flex justify-center items-center gap-x-1 mb-3">
              <img src="logo.png" alt="signup image" className="w-[50px] h-[50px]" />
              <h1 className="text-3xl font-bold text-gray-800">Sign Up</h1>
            </div>
    
            {/* ฟอร์มจัดแบบครึ่งซ้ายขวา 2 ฟิลด์ต่อแถว */}
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="flex flex-col">
                <label htmlFor="username" className="font-medium text-lg text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-full border px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your username"
                />
              </div>
    
              <div className="flex flex-col">
                <label htmlFor="email" className="font-medium text-lg text-gray-700">
                  Gmail
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-full border px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your email"
                />
              </div>
            </div>
    
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="flex flex-col">
                <label htmlFor="password" className="font-medium text-lg text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-full border px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your password"
                />
              </div>
    
              <div className="flex flex-col">
                <label htmlFor="age" className="font-medium text-lg text-gray-700">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="rounded-full border px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your age"
                  min="1"
                />
              </div>
            </div>
    
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="flex flex-col">
                <label htmlFor="confirmPassword" className="font-medium text-lg text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-full border px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Confirm your password"
                />
              </div>
    
              <div className="flex flex-col">
                <label htmlFor="gender" className="font-medium text-lg text-gray-700">
                  Gender
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="rounded-full border px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Not specified">Not specified</option>
                </select>
              </div>
            </div>
    
            <div className="flex justify-center mt-2">
              {isError && (
                <div className="text-red-600 font-medium text-sm">
                  Please fill in all fields correctly.
                </div>
              )}
            </div>
    
            <div className="flex justify-center mt-2">
              <button
                type="submit"
                className="bg-[#67AEA0] text-white rounded-full py-2 font-semibold hover:bg-[#287566] transition duration-200 w-[100px]"
              >
                Sign Up
              </button>
            </div>
    
            <div className="flex justify-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-blue-500 hover:underline">
                  Login
                </a>
              </p>
            </div>
          </form>
        </div>
      );
  }

export default Signup