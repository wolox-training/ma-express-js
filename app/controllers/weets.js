const weetService = require('../services/weets');
const randomContentService = require('../services/random_content');
const { serializeWeets } = require('../serializers/weets');
const { pagination } = require('../mappers/paginations');

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
    const { page, limit } = pagination(req);
    const rawListWeets = await weetService.listWeets(page, limit);
    return res.status(200).json(serializeWeets(rawListWeets, page, limit));
  } catch (error) {
    return next(error);
  }
};

exports.rateWeet = (req, res, next) => {
  try {
    const { rating } = req.body;
    if (rating === 0) {
      console.log(req.params);
    }
    return res.sendStatus(201);
  } catch (error) {
    return next(error);
  }
};
