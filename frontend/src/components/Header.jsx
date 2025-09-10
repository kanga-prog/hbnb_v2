// src/components/Header.jsx
import React from "react";
import { getCurrentUser } from "../utils/auth";

function Header() {
  const user = getCurrentUser();

  return (
    <header className="flex items-center justify-between p-4 bg-gray-100 shadow-md">
      {/* Logo / Branding */}
      <h1 className="text-2xl font-bold text-red-600">HBnB</h1>

      {/* Zone utilisateur */}
      {user ? (
        <div className="flex items-center gap-3">
          <img
            src={user.photo || "/default-avatar.png"}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover border"
          />
          <span className="text-gray-700 font-medium">
            Bonjour, {user.name || user.sub}
          </span>
        </div>
      ) : (
        <span className="text-gray-500 italic">Bienvenue invité 👋</span>
      )}
    </header>
  );
}

export default Header;
