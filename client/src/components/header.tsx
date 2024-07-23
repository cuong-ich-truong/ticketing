import Link from 'next/link';
import { useMemo } from 'react';

const Header = ({ currentUser }) => {
  const createNavLink = (href: any, label: any) => {
    return (
      <li className="nav-item" key={href}>
        <Link className="nav-link" href={href}>
          {label}
        </Link>
      </li>
    );
  };

  const ticketLinks = useMemo(() => {
    return [
      currentUser && { label: 'New Ticket', href: '/tickets/new' },
      currentUser && { label: 'My Orders', href: '/orders' },
      currentUser && { label: 'My Tickets', href: '/tickets' },
    ]
      .filter((linkConfig) => linkConfig)
      .map(({ label, href }) => createNavLink(href, label));
  }, [currentUser]);
  const authLinks = useMemo(() => {
    return [
      !currentUser && { label: 'Sign Up', href: '/auth/signup' },
      !currentUser && { label: 'Sign In', href: '/auth/signin' },
      currentUser && { label: 'Sign Out', href: '/auth/signout' },
    ]
      .filter((linkConfig) => linkConfig)
      .map(({ label, href }) => createNavLink(href, label));
  }, [currentUser]);

  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container-fluid">
        <div className="d-flex">
          <Link className="navbar-brand " href="/">
            Ticketing
          </Link>
          <ul className="nav">{ticketLinks}</ul>
        </div>

        <div className="d-flex justify-content-end">
          <ul className="d-flex align-item-center nav">{authLinks}</ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
