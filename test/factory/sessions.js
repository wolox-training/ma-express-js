const { factory } = require('factory-girl');

const { factoryWithCustomizedValue } = require('./factory_by_models');

const modelName = 'Session';

factoryWithCustomizedValue(modelName, 'userId', 1);

module.exports = {
  create: sessionData => factory.create(modelName, sessionData)
};
