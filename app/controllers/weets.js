const weetService = require('../services/weets');
const randomContentService = require('../services/random_content');

exports.createWeet = async (req, res, next) => {
  try {
    const randomWeet = await randomContentService.randomContent();
    const weet = {
      content: randomWeet.joke,
      userId: req.userId
    };
    weetService.createWeet(weet);
    return res.json({ weet: randomWeet.joke });
  } catch (error) {
    return next(error);
  }
};
