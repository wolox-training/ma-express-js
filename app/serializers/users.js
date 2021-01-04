exports.serializeUsers = (rawListUsers, offset, limit) => {
  let response = {};
  if (rawListUsers) {
    const listUsers = rawListUsers.map(user => ({
      id: user.dataValues.id,
      name: user.dataValues.name,
      last_name: user.dataValues.lastName,
      email: user.dataValues.email
    }));
    response = {
      page: listUsers,
      offset,
      limit
    };
  }
  return response;
};
