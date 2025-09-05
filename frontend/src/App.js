// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import VerifyCode from './pages/VerifyCode';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import PlaceDetailPage from './pages/PlaceDetail'; // <-- on garde celui-là
import Profile from "./pages/Profile";
import CreatePlace from "./pages/CreatePlace";

import Navbar from './components/Navbar';
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <Navbar />
      <main className="min-h-screen p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/place/:id" element={<PlaceDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify" element={<VerifyCode />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/places/new" element={<CreatePlace />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
