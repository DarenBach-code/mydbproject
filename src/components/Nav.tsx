import { House } from 'lucide-react';
import Link from 'next/link';

const Nav = () => {
  return (
    <nav className="flex items-center justify-between p-8 bg-transparent">
      {/* Left: Home Icon */}
      <Link href="/" className="flex items-center">
        <House color="white" size={48} />
      </Link>
      {/* Right: Auth Button */}
      <div className="flex gap-4">
        <Link
          href="/login"
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
        >
          Login
        </Link>
      </div>
    </nav>
  );
};

export default Nav;