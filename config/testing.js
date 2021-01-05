exports.config = {
  environment: 'testing',
  isTesting: true,
  common: {
    database: {
      name: process.env.DB_NAME_TEST
    },

    session: {
      secret: process.env.SECRET_KEY,
      expirationDays: process.env.EXPIRATION_DAYS
    }
  }
};
