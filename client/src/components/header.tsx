import Link from 'next/link';

const Header = ({ currentUser }) => {
  const links = [
    !currentUser && { label: 'Sign Up', href: '/auth/signup' },
    !currentUser && { label: 'Sign In', href: '/auth/signin' },
    currentUser && { label: 'Sign Out', href: '/auth/signout' },
  ]
    .filter((linkConfig) => linkConfig)
    .map(({ label, href }) => {
      return (
        <li className="nav-item" key={href}>
          <Link className="nav-link" href={href}>
            {label}
          </Link>
        </li>
      );
    });
  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand " href="/">
          Ticketing
        </Link>
        <div className="d-flex justify-content-end">
          <ul className="d-flex align-item-center nav">{links}</ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
