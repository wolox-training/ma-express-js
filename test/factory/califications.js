const { factory } = require('factory-girl');

const { factoryWithCustomizedValue } = require('./factory_by_models');

const modelName = 'Calification';

factoryWithCustomizedValue(modelName, 'deletedAt', null);

module.exports = {
  create: weetData => factory.create(modelName, weetData)
};
