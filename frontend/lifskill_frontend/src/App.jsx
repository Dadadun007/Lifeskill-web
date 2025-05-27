import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Profile from './pages/Profile.jsx'
import Postrequest from './pages/Postrequest.jsx'
import Tutorial from './pages/Tutorial.jsx'
import Contactus from './pages/Contactus.jsx'
import Mypage from './pages/Mypage.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/postrequest" element={<Postrequest />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/contactus" element={<Contactus />} />
        <Route path="/mypage" element={<Mypage />} />
      </Routes>
    </Router>
  )
}

export default App
