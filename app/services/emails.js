const nodemailer = require('nodemailer');
const { emailUser, emailPass } = require('../../config').common.session;

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

exports.sendWelcomeEmail = user => {
  const welcomeMailOptions = {
    from: 'Witter',
    to: user.email,
    subject: 'Welcome to Witter!',
    text: `Welcome to Witter ${user.name} ${user.lastName}!`
  };
  return transporter.sendMail(welcomeMailOptions);
};

exports.sendCongratulationEmail = (user, stats) => {
  const dailyMailOptions = {
    from: 'Witter',
    to: user.email,
    subject: 'Congratulations!',
    text: `Congratulations ${user.name} ${user.lastName}! You are the most Witterer of the day with ${stats.weets_quantity} Witters.`
  };
  return transporter.sendMail(dailyMailOptions);
};
