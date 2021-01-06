exports.config = {
  environment: 'production',
  common: {
    database: {
      name: process.env.DB_NAME,
      ssl: process.env.DB_SSL
    }
  },
  isProduction: true
};
