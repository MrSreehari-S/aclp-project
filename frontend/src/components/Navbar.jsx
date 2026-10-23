import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RankBadge from "./RankBadge";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Arena", path: "/dashboard", icon: "⚔️" },
    { name: "Leaderboard", path: "/leaderboard", icon: "🏆" },
    { name: "Match History", path: "/history", icon: "📜" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-[#05070E]/85 border-b border-white/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Brand Logo */}
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 group cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300 transform group-hover:scale-105">
              <div className="w-full h-full bg-[#090D17] rounded-[10px] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-indigo-400 group-hover:text-cyan-300 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:via-purple-200 group-hover:to-cyan-300 transition-all">
                CodeClash
              </span>
              <span className="text-[10px] font-mono tracking-widest text-indigo-400 font-semibold uppercase -mt-0.5">
                1v1 Arena
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.06] backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? "text-white bg-white/[0.1] shadow-sm shadow-black/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Section: User Profile & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl py-1.5 px-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs text-white shadow-md">
                {user.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  {user.username}
                </span>
                <span className="text-[10px] font-mono text-purple-300">
                  {user.rating || 1200} ELO
                </span>
              </div>
              <RankBadge rating={user.rating || 1200} size="sm" showRating={false} />
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all duration-200 group"
            >
              <svg
                className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-300 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#0B0F19]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm text-white">{user.username}</p>
                <p className="text-xs font-mono text-purple-300">{user.rating || 1200} ELO</p>
              </div>
            </div>
            <RankBadge rating={user.rating || 1200} size="sm" showRating={false} />
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                      : "text-slate-300 hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
