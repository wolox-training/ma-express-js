exports.serializeWeets = (rawListWeets, current_page, limit) => ({
  page: rawListWeets.map(weet => ({
    id: weet.dataValues.id,
    content: weet.dataValues.content
  })),
  current_page,
  limit
});
