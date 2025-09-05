import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../utils/auth';

function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav>
      <Link to="/">Accueil</Link> |{' '}
      {user ? (
        <>
          <span>Bonjour, {user.sub} </span>
          <button onClick={handleLogout}>Déconnexion</button>
        </>
      ) : (
        <>
          <Link to="/login">Se connecter</Link> |{' '}
          <Link to="/register">S’inscrire</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;
