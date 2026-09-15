import Link from 'next/link';
import { FaHome, FaChevronRight } from 'react-icons/fa';

interface BreadcrumbProps {
  propertyName: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ propertyName }) => {
  return (
    <nav className="flex items-center space-x-2 py-4 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-lg mb-5">
      {/* Home Icon */}
      <Link href="/" className="flex items-center text-white hover:text-gray-200 transition">
        <FaHome className="mr-1" />
        <span className="font-medium">Home</span>
      </Link>

      {/* Chevron Separator */}
      <FaChevronRight className="text-gray-300" />

      {/* Current Property */}
      <span className="flex items-center text-gray-100 font-semibold">
        {propertyName}
      </span>
    </nav>
  );
};

export default Breadcrumb;
