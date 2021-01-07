const axios = require('axios');
const logger = require('../logger');
const errors = require('../errors');
const errorsCatalog = require('../../app/schemas/errors_catalog');

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
    logger.error(errorsCatalog.EXTERNAL_API_ERROR);
    throw errors.externalApiError(errorsCatalog.EXTERNAL_API_ERROR);
  }
};
