"use client";

import React from "react";

import Link from "next/link";

const page = () => {
  return (
    <div className="">
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        {/* Logo Section */}

        {/* Welcome Section */}
        <h1 className="text-4xl font-bold text-[#8ABF55] mb-4">Welcome!</h1>
        <p className="text-xl text-gray-700 mb-8 text-center">
          Want to join our system? Please log in to get started.
        </p>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Link
            href="/login"
            className="px-6 py-2 bg-[#8ABF55] text-white rounded-lg shadow-lg hover:bg-[#7DA54E] transition duration-300">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default page;
