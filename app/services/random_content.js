const axios = require('axios');
const logger = require('../logger');
const errors = require('../errors');

const urlRandomContent = 'https://geek-jokes.sameerkumar.website/api?format=json';

const generateContent = async () => {
  const { data: randomContent } = await axios.get(urlRandomContent);
  return randomContent;
};

exports.randomContent = async () => {
  let randomContent = {};
  try {
    do {
      randomContent = await generateContent();
    } while (randomContent.joke.length > 140);
    return randomContent;
  } catch (error) {
    logger.error('Error while trying to get random weet content', error.message);
    throw errors.externalApiError(error.message);
  }
};
