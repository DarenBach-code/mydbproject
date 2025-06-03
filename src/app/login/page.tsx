import React from 'react'
import Nav from '@/components/Nav';

const page = () => {
  return (
    <div>
      <Nav />
      <div className="flex justify-self-center">
        <span className="font-bold text-5xl text-white">Hello, User</span>
      </div>
    </div>
  );
};

export default page