const { DEFAULT_PAGE, DEFAULT_LIMIT } = require('../utils/constants');

exports.pagination = req => ({
  page: parseInt(req.query.page || DEFAULT_PAGE),
  limit: parseInt(req.query.limit || DEFAULT_LIMIT)
});
