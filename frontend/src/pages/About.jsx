import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col justify-center items-center text-white p-6">
            <div className="max-w-4xl w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/20">
                <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-amber-500">
                    About Us
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                        <p className="text-xl sm:text-2xl font-light leading-relaxed">
                            We are dedicated to building beautiful, high-performance web applications using the latest technologies. Our goal is to empower developers like you to create stunning user experiences.
                        </p>
                        <p className="text-lg text-gray-200">
                            This application showcases the power of React, Tailwind CSS, and Vite. Feel free to explore and customize it to your heart's content!
                        </p>
                        <div className="mt-8">
                            <Link
                                to="/"
                                className="inline-block px-8 py-3 bg-white text-indigo-600 font-bold rounded-full shadow-lg hover:bg-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-green-500 opacity-80 animate-pulse"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white text-6xl font-bold opacity-30">DEV</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
