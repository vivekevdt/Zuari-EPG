import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 w-full z-[100] backdrop-blur-md bg-white/70 shadow-sm border-b border-gray-100 transition-all duration-300">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <NavLink
                    to="/"
                    className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                >
                    MyApp
                </NavLink>
                <div className="flex space-x-8">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `text-sm font-medium transition-colors hover:text-blue-600 ${isActive ? 'text-blue-600' : 'text-gray-600'}`
                        }
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/about"
                        className={({ isActive }) =>
                            `text-sm font-medium transition-colors hover:text-blue-600 ${isActive ? 'text-blue-600' : 'text-gray-600'}`
                        }
                    >
                        About
                    </NavLink>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
