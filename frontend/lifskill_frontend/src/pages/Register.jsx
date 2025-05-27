import { useState } from 'react';
import { Link } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Not specified');
  const [isError, setIsError] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (
      username.trim() === '' ||
      email.trim() === '' ||
      password.trim() === '' ||
      confirmPassword.trim() === '' ||
      age.trim() === ''
    ) {
      setIsError(true);
      setPasswordMismatch(false);
      return;
    }

    if (password !== confirmPassword) {
      setIsError(false);
      setPasswordMismatch(true);
      return;
    }

    setIsError(false);
    setPasswordMismatch(false);

    // Send to backend
    try {
      const response = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          age: parseInt(age),
          sex: gender,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register user');
      }

      const result = await response.json();
      console.log('Registered:', result);
      setSuccessMessage('Registration successful!');
      // Reset form (optional)
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAge('');
      setGender('Not specified');
    } catch (error) {
      console.error('Error:', error);
      setSuccessMessage(''); // reset success if error
      setIsError(true);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#43A895]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-y-4 bg-white shadow-xl rounded-2xl p-6 w-screen max-w-xl"
      >
        <div className="flex justify-center items-center gap-x-1 mb-3">
          <img src="logo.png" alt="signup image" className="w-[50px] h-[50px]" />
          <h1 className="text-3xl font-bold text-gray-800">Sign Up</h1>
        </div>

        {/* Username & Email */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="flex flex-col">
            <label htmlFor="username" className="text-lg font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-full border px-3 py-1.5"
              placeholder="Enter your username"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="text-lg font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-full border px-3 py-1.5"
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="flex flex-col">
            <label htmlFor="password" className="text-lg font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-full border px-3 py-1.5"
              placeholder="Enter password"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="confirmPassword" className="text-lg font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-full border px-3 py-1.5"
              placeholder="Confirm password"
            />
            {passwordMismatch && (
              <span className="text-red-600 text-sm mt-1">Passwords do not match.</span>
            )}
          </div>
        </div>

        {/* Age & Gender */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="flex flex-col">
            <label htmlFor="age" className="text-lg font-medium text-gray-700">Age</label>
            <input
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="rounded-full border px-3 py-1.5"
              placeholder="Enter your age"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="gender" className="text-lg font-medium text-gray-700">Gender</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="rounded-full border px-3 py-1.5"
            >
              <option>Not specified</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
        </div>

        {/* Error/Success Messages */}
        {isError && (
          <div className="text-red-600 text-center text-sm font-medium">
            Please fill in all fields correctly or try again.
          </div>
        )}
        {successMessage && (
          <div className="text-green-600 text-center text-sm font-medium">
            {successMessage}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-center mt-2">
          <button
            type="submit"
            className="bg-[#67AEA0] text-white rounded-full py-2 px-6 font-semibold hover:bg-[#287566] transition duration-200"
          >
            Sign Up
          </button>
        </div>

        {/* Already registered */}
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

export default Register;
