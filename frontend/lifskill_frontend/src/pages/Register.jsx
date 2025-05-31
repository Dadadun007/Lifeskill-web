import { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Not specified');
  const [isError, setIsError] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');
    setPasswordMismatch(false);

    // Validate
    if (
      username.trim() === '' ||
      email.trim() === '' ||
      password.trim() === '' ||
      confirmPassword.trim() === '' ||
      age.trim() === ''
    ) {
      setIsError(true);
      setErrorMessage('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      setErrorMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsError(true);
      setErrorMessage('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Validate age
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setIsError(true);
      setErrorMessage('Please enter a valid age between 1 and 120');
      setIsLoading(false);
      return;
    }

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
          age: ageNum,
          sex: gender,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Registration successful
      setErrorMessage('');
      setIsError(false);
      
      // Show success message and redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      setIsError(true);
      setErrorMessage(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 flex items-center justify-center p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center ">
              <img src="logo.png" alt="login image" className="w-[100px] h-[100px] " />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Sign up</h1>
          </div>

          <div className="space-y-6">
            {/* Username and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div className="space-y-2">
                <div className="flex items-center text-gray-700 font-medium">
                  <User className="w-5 h-5 mr-2" />
                  <span>Username</span>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 hover:border-gray-300"
                  placeholder="Enter your Username"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center text-gray-700 font-medium">
                  <Mail className="w-5 h-5 mr-2" />
                  <span>Email Address</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 hover:border-gray-300"
                  placeholder="Enter your Email"
                />
              </div>
            </div>

            {/* Password and Confirm Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center text-gray-700 font-medium">
                  <Lock className="w-5 h-5 mr-2" />
                  <span>Password</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 hover:border-gray-300"
                    placeholder="Enter your Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <div className="flex items-center text-gray-700 font-medium">
                  <Lock className="w-5 h-5 mr-2" />
                  <span>Confirmed Password</span>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3 pr-12 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all duration-300 hover:border-gray-300 ${
                      passwordMismatch ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="Confirmed Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Age and Gender Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age */}
              <div className="space-y-2">
                <div className="flex items-center text-gray-700 font-medium">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>Age</span>
                </div>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 hover:border-gray-300"
                  placeholder="Age"
                  min="1"
                  max="120"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <div className="flex items-center text-gray-700 font-medium">
                  <Users className="w-5 h-5 mr-2" />
                  <span>Gender</span>
                </div>
                <div className="relative">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 hover:border-gray-300 appearance-none cursor-pointer"
                  >
                    <option value="Not_specified">Not specified</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {isError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-shake">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sign Up Button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-300 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg min-w-[120px]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Sign up'
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-gray-600 text-sm">
                Do you have account?{' '}
                <a 
                  href="/login" 
                  className="text-blue-500 hover:text-blue-600 font-medium transition-colors hover:underline"
                >
                  Login
                </a>
              </p>
            </div>

            {/* Back to Main Menu */}
            <div className="text-center">
              <a 
                href="/" 
                className="text-gray-500 hover:text-gray-700 text-sm transition-colors hover:underline"
              >
                Back to the Main Menu
              </a>
            </div>
          </div>
        </div>

        {/* Additional decorative elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-white/20 rounded-full blur-sm"></div>
        <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-white/15 rounded-full blur-sm"></div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default Register;