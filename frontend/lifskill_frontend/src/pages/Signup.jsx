import { useState } from 'react';
import { Link } from 'react-router-dom';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Not specified');
  const [isError, setIsError] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      username.trim() === '' ||
      email.trim() === '' ||
      password.trim() === '' ||
      confirmPassword.trim() === '' ||
      age.trim() === ''
    ) {
      setIsError(true);
      setPasswordMismatch(false);
    } else if (password !== confirmPassword) {
      setIsError(false);
      setPasswordMismatch(true);
    } else {
      setIsError(false);
      setPasswordMismatch(false);
      console.log('Username:', username);
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('Age:', age);
      console.log('Gender:', gender);
      // TODO: Connect to backend for registration API
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#373737]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-y-4 bg-white shadow-xl rounded-2xl p-6 w-screen max-w-xl"
      >
        <div className="flex justify-center items-center gap-x-1 mb-3">
          <img src="logo.png" alt="signup image" className="w-[50px] h-[50px]" />
          <h1 className="text-3xl font-bold text-gray-800">Sign Up</h1>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="flex flex-col">
            <label htmlFor="username" className="font-medium text-lg text-gray-700 flex items-center gap-2">
              <img src="/user.png" alt="user icon" className="w-5 h-5" />
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
            <label htmlFor="email" className="font-medium text-lg text-gray-700 flex items-center gap-2">
              <img src="/mail.png" alt="email icon" className="w-5 h-5" />
              Email Address
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
            <label htmlFor="password" className="font-medium text-lg text-gray-700 flex items-center gap-1">
              <img src="/lock.png" alt="pass icon" className="w-5 h-5" />
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
            <label htmlFor="confirmPassword" className="font-medium text-lg text-gray-700 flex items-center gap-1">
              <img src="/lock.png" alt="pass icon" className="w-5 h-5" />
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
            {passwordMismatch && (
              <div className="text-red-600 font-medium text-sm mt-1">
                Passwords do not match.
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="flex flex-col">
            <label htmlFor="age" className="font-medium text-lg text-gray-700 flex items-center gap-2">
              <img src="/age.png" alt="age icon" className="w-5 h-5" />
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

          <div className="flex flex-col">
            <label htmlFor="gender" className="font-medium text-lg text-gray-700 flex items-center gap-2">
              <img src="/gender.png" alt="gender icon" className="w-5 h-5" />
              Gender
            </label>
            <div className="flex gap-2">
              {['Male', 'Female', 'Not specified'].map((option) => {
                const isSelected = gender === option;
                let borderColor = 'border-gray-600';
                let bgColor = 'bg-white';
                let textColor = 'text-gray-600';

                if (isSelected) {
                  if (option === 'Male') {
                    borderColor = 'border-blue-500';
                    bgColor = 'bg-blue-100';
                    textColor = 'text-blue-800';
                  } else if (option === 'Female') {
                    borderColor = 'border-red-500';
                    bgColor = 'bg-red-300';
                    textColor = 'text-black';
                  } else {
                    borderColor = 'border-gray-400';
                    bgColor = 'bg-gray-200';
                    textColor = 'text-gray-800';
                  }
                }

                return (
                  <button
                    key={option}
                    onClick={() => setGender(option)}
                    className={`px-2 py-2 rounded-full text-sm font-medium border ${borderColor} ${bgColor} ${textColor} transition-colors duration-150`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {isError && (
          <div className="text-red-600 font-medium text-sm text-center mt-2">
            Please fill in all fields correctly.
          </div>
        )}

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
            <Link to="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Signup;
