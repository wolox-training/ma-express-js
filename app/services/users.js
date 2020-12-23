const { User } = require('../models');

exports.emailExists = email => User.findOne({ where: { email } });

exports.create = (email, password, name, lastName) => User.create({ email, password, name, lastName });
