const { Calification, User, Weet, sequelize } = require('../models');
const { getPosition } = require('../mappers/califications');
const logger = require('../logger');
const errors = require('../errors');
const errorCatalog = require('../schemas/errors_catalog');

const getScores = rawWeetsArray =>
  Promise.all(
    rawWeetsArray.map(async rawWeet => {
      const score = await Calification.findAll({ where: { weetId: rawWeet.dataValues.id } });
      const weetScoreArray = score.map(weetScore => weetScore.dataValues.score);
      return weetScoreArray;
    })
  );

const findVotedWeet = calification => {
  const { weetId, ratingUserId } = calification;
  return Calification.findOne({ where: { ratingUserId, weetId } });
};

exports.saveScoreAndUpdatePosition = async calification => {
  let transaction = {};
  try {
    transaction = await sequelize.transaction();

    const weet = await Weet.findByPk(calification.weetId);
    const user = await User.findByPk(weet.creatorId);
    const rawWeetsArray = await Weet.findAll({ where: { creatorId: user.id } });

    const scoresArray = await getScores(rawWeetsArray);
    const weetScoreArray = scoresArray.map(score =>
      score.reduce((acum, currentScore) => acum + currentScore, 0)
    );
    const puntajeUser =
      weetScoreArray.reduce((acum, currentScore) => acum + currentScore) + calification.score;
    const positionByScore = getPosition(puntajeUser);
    const actualPosition = user.position;

    const existsVotedWeet = await findVotedWeet(calification);
    if (existsVotedWeet && existsVotedWeet.dataValues.score !== calification.score) {
      existsVotedWeet.score = calification.score;
      await existsVotedWeet.save({ transaction });
    } else await Calification.create(calification, { transaction });

    if (actualPosition !== positionByScore) {
      user.position = positionByScore;
      await user.save({ transaction });
    }

    await transaction.commit();
  } catch (error) {
    if (transaction.rollback) await transaction.rollback();
    logger.error('Error while trying to save calification.', error.message);
    throw errors.databaseError(errorCatalog.CALIFICATION_ERROR);
  }
};

exports.findById = id =>
  Calification.findByPk(id).catch(error => {
    logger.error('Error while trying to get calification by ID.', error.message);
    throw errors.databaseError(error.message);
  });

exports.findSameRating = req => {
  const { weetId, ratingUserId, score } = req;
  return Calification.findOne({ where: { ratingUserId, weetId, score } });
};
