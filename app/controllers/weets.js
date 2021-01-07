const weetService = require('../services/weets');
const randomContentService = require('../services/random_content');

exports.createWeet = async (req, res, next) => {
  try {
    const randomWeet = await randomContentService.randomContent();
    const weet = {
      content: randomWeet.joke,
      creatorId: req.userId
    };
    await weetService.createWeet(weet);
    return res.json({ status: 201, describe: 'Weet created.' });
  } catch (error) {
    return next(error);
  }
};
