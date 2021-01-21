exports.config = {
  environment: 'development',
  common: {
    database: {
      name: process.env.DB_NAME_DEV
    },
    session: {
      emailUser: process.env.EMAIL_USER,
      emailPass: process.env.EMAIL_PASS
    }
  },
  isDevelopment: true
};
