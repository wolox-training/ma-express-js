const weetService = require('../services/weets');
const randomContentService = require('../services/random_content');
const { serializeWeets } = require('../serializers/weets');

exports.createWeet = async (req, res, next) => {
  try {
    const randomWeet = await randomContentService.randomContent();
    const weet = {
      content: randomWeet.joke,
      creatorId: req.userId
    };
    await weetService.createWeet(weet);
    return res.sendStatus(201);
  } catch (error) {
    return next(error);
  }
};

exports.listWeets = async (req, res, next) => {
  try {
    const { rawListWeets, page, limit } = await weetService.listWeets(req.query.page, req.query.limit);
    return res.status(200).json(serializeWeets(rawListWeets, page, limit));
  } catch (error) {
    return next(error);
  }
};
