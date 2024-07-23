const Errors = ({ errors }) => {
  return (
    <div className="alert alert-danger">
      <h4>Errors</h4>
      <ul className="my-0">
        {errors.map((error) => (
          <li key={error.message}>{error.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default Errors;
