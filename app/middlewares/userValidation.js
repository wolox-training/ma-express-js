exports.validationUser = (req, next) => {
  const { email, password, name, lastname } = req.body;
  const userValid = email || password || name || lastname;
  if (!userValid) next('error');
};
