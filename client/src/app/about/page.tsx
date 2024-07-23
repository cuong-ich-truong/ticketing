export default function About() {
  return (
    <div className="container-sm">
      <h1>Ticketing - App Route / About</h1>
      <p>
        This is a simple app to demonstrate how to build, deploy, and scale an
        E-Commerce app using Microservices built with Node, React, Docker and
        Kubernetes.
      </p>
      <p>
        The app is built with a Node.js API and a React client. The API is
        composed of multiple services, each one responsible for a specific part
        of the app. The services are built and run in Docker containers, and
        they are orchestrated by Kubernetes.
      </p>
      <p>
        The React client is a server-side rendered app that fetches data from
        the API services. The client is built with Next.js, a React framework
        that provides a simple and intuitive way to build React apps.
      </p>
    </div>
  );
}
