import { Link } from 'react-router-dom';
function Navbar() {
  const links = [
    { name: "Home", path: "/citizen/home" },
    { name: "Report Issue", path: "/citizen/report" },
    { name: "My Reports", path: "/citizen/my-reports" },
  ];

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="font-bold text-xl">CivicSense</Link>

      <div className="flex gap-4">
        {links.map((link) => (
          <Link key={link.path} to={link.path} className="hover:underline">
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;