const axios = require('axios');
const logger = require('../logger');
const errors = require('../errors');

const urlRandomContent = 'https://geek-jokes.sameerkumar.website/api?format=json';

exports.randomWeetContent = async () => {
  try {
    const weetContent = await axios.get(urlRandomContent);
  } catch (error) {
    logger.error('Error while trying to get random weet content', error.message);
    next(error);
  }
};
