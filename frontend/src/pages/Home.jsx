import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="bg-white/30 backdrop-blur-lg rounded-2xl p-8 sm:p-12 shadow-2xl border border-white/20">
                    <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6 animate-pulse">
                        Welcome to Your App
                    </h1>
                    <p className="text-xl sm:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
                        This is a modern React application powered by Vite and Tailwind CSS.
                        Start building your amazing project with speed and style!
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            to="/about"
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            Get Started
                        </Link>
                        <a
                            href="https://react.dev"
                            target="_blank"
                            rel="noreferrer"
                            className="px-8 py-3 bg-white text-gray-800 font-semibold rounded-full shadow-md border border-gray-200 hover:bg-gray-50 hover:scale-105 transition-all duration-300"
                        >
                            Learn React
                        </a>
                    </div>
                </div>

                <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {[
                        { title: 'Fast', desc: 'Powered by Vite for instant server start.', color: 'from-orange-400 to-pink-500' },
                        { title: 'Modern', desc: 'Uses latest React features and Tailwind CSS.', color: 'from-green-400 to-cyan-500' },
                        { title: 'Scalable', desc: 'Built with components and routing in mind.', color: 'from-purple-500 to-indigo-500' },
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
                            <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${feature.color} mb-4 mx-auto shadow-md`}></div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
