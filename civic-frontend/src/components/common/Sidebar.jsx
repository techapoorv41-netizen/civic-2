import { Link } from 'react-router-dom';

function Sidebar() {
  const links = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Verify Officials", path: "/admin/verify-officials" },
    { name: "Verify Issues", path: "/admin/verify-issue" },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link key={link.path} to={link.path} className="hover:bg-gray-700 px-3 py-2 rounded">
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;