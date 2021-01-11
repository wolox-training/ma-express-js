const weetService = require('../services/weets');
const randomContentService = require('../services/random_content');
const calificationsService = require('../services/califications');
const { serializeWeets } = require('../serializers/weets');
const { pagination } = require('../mappers/paginations');
const { mapCalificationParams } = require('../mappers/califications');

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

exports.rateWeet = async (req, res, next) => {
  try {
    const calification = mapCalificationParams(req);
    await calificationsService.saveScoreAndUpdatePosition(calification);
    return res.sendStatus(201);
  } catch (error) {
    return next(error);
  }
};
