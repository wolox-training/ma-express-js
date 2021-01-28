const { CronJob } = require('cron');
const weetService = require('../services/weets');
const userService = require('../services/users');
const emailService = require('../services/emails');
const randomContentService = require('../services/random_content');
const calificationsService = require('../services/califications');
const { serializeWeets } = require('../serializers/weets');
const { pagination } = require('../mappers/paginations');
const { mapCalificationParams } = require('../mappers/califications');

exports.sendDailyResume = async () => {
  const dailyStats = await weetService.wittererOfTheDay();
  const witterer = await userService.findById(dailyStats.creator_id);
  if (!witterer) return false;
  const emailSended = await emailService.sendCongratulationEmail(witterer.dataValues, dailyStats);
  return emailSended;
};

const cron = '0 59 23 * * *';
const job = new CronJob(cron, () => exports.sendDailyResume(), null, true, 'America/Buenos_Aires');
job.start();

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
    const repeatedVote = await calificationsService.findSameRating(calification);
    if (repeatedVote) return res.sendStatus(202);
    await calificationsService.saveScoreAndUpdatePosition(calification);
    return res.sendStatus(201);
  } catch (error) {
    return next(error);
  }
};
