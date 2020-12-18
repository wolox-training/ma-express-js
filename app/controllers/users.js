exports.register = (req, res) => {
  const { email, password, name, lastname } = req.body;
  const userValid = email || password || name || lastname;
  res.send(userValid);
};
