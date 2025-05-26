import { House } from 'lucide-react';
import Link from 'next/link';

const Nav = () => {
  return (
    <Link href="/" className='flex justify-center p-8'>
        <House color='white' size={48}></House>
    </Link>
    
  )
}

export default Nav