exports.config = {
  environment: 'testing',
  isTesting: true,
  common: {
    database: {
      name: process.env.DB_NAME_TEST
    },

    session: {
      secret: 'some-super-secret',
      expirationDays: 1,
      urlRandomContent: 'https://geek-jokes.sameerkumar.website/api?format=json'
    }
  }
};
