jest.mock('cron');
const { CronJob } = require('cron');
const { sendDailyResume } = require('../../app/controllers/weets');

const { create: createUser } = require('../factory/users');
const { create: createWeet } = require('../factory/weets');

jest.mock('../../app/services/weets', () => ({
  wittererOfTheDay: () =>
    Promise.resolve({
      creator_id: 1
    })
}));

jest.mock('../../app/services/emails', () => ({
  sendCongratulationEmail: () =>
    Promise.resolve({
      accepted: ['martin.acosta@wolox.com.ar'],
      rejected: [],
      envelopeTime: 842,
      messageTime: 619,
      messageSize: 359,
      response: '250 Accepted [STATUS=new MSGID=YArApOFZMAOseYO5YA8iPRAQ.V41urp8AAAC2X0KraWcOwGYqAcOFDWZXCI]',
      envelope: { from: '', to: ['martin.acosta@wolox.com.ar'] },
      messageId: '<a0fc6a31-1d8a-9c3a-0bcf-8614e8806028@wolox-0185>'
    })
}));

describe('Check congratulation email function', () => {
  let emailSended = {};
  const user = {
    email: 'martin.acosta@wolox.com.ar'
  };

  beforeAll(async () => {
    await createUser(user);
    await createWeet({ creatorId: 1 });
    emailSended = await sendDailyResume();
  });

  test('The cron task is created with correct params.', () => {
    expect(CronJob).toBeCalledWith('0 59 23 * * *', expect.any(Function), null, true, 'America/Buenos_Aires');
  });

  test('On cron tick an email have to be sended to the most witterer of the day.', () => {
    expect(emailSended.accepted).toContain('martin.acosta@wolox.com.ar');
  });
});
