const { Calification } = require('../models');
const logger = require('../logger');
const errors = require('../errors');
const errorCatalog = require('../schemas/errors_catalog');

exports.createCalification = calification =>
  Calification.create(calification).catch(error => {
    logger.error('Error while trying to save calification in DB.', error.message);
    throw errors.databaseError(errorCatalog.CALIFICATION_ERROR);
  });

// exports.transfer = async ({ transmitterId, receptorId, amount }) => {
//   let transaction = {};
//   try {
//     transaction = await sequelize.transaction(); // Create transaction

//     const transmitter = await Account.findOne({ where: { id: transmitterId } }); // Get transmitter account
//     const receptor = await Account.findOne({ where: { id: receptorId } }); // Get transmitter account

//     await transmitter.increment('amount', { by: -amount, transaction }); // Decrement amount of transmitter account
//     await receptor.increment('amount', { by: amount, transaction }); // Increment amount of transmitter account

//     await transaction.commit(); // Commit the transaction
//   } catch (err) {
//     if (transaction.rollback) await transaction.rollback(); // Rollback the transaction in case of error
//     throw err;
//   }
// };
