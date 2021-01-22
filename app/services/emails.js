const nodemailer = require('nodemailer');
const { emailUser, emailPass } = require('../../config').common.session;

exports.sendEmail = user => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
  const mailOptions = {
    from: 'Witter',
    to: user.email,
    subject: '¡Bienvenido a Witter!',
    text: `¡Bienvenido a Witter ${user.name} ${user.lastName}!`
  };
  return transporter.sendMail(mailOptions);
};
