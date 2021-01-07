exports.createWeet = (req, res, next) => {
  try {
    const request = req.body;
    return res.json({ msg: request });
  } catch (error) {
    return next(error);
  }
};
