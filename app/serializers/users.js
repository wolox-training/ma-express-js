exports.serializeUsers = (rawListUsers, current_page, limit) => ({
  page: rawListUsers.map(user => ({
    id: user.dataValues.id,
    name: user.dataValues.name,
    last_name: user.dataValues.lastName,
    email: user.dataValues.email
  })),
  current_page,
  limit
});
