// Apply bootstrap css to all app route

import 'bootstrap/dist/css/bootstrap.css';

export const metadata = {
  title: 'Ticketing',
  description:
    'Build, deploy, and scale an E-Commerce app using Microservices built with Node, React, Docker and Kubernetes',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="container">{children}</body>
    </html>
  );
};
export default RootLayout;
