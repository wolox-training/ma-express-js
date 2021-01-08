const axios = require('axios');
const logger = require('../logger');
const errors = require('../errors');
const errorsCatalog = require('../../app/schemas/errors_catalog');
const { urlRandomContent } = require('../../config').common.session;

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
    logger.error(errorsCatalog.JOKE_API_ERROR);
    throw errors.jokeApiError(errorsCatalog.JOKE_API_ERROR);
  }
};
