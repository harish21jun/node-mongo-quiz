const nodemailer = require('nodemailer');

exports.sendMail = function(req, res, next) {
console.log("Inside sendMail");
  nodemailer.createTestAccount((err, account) => {
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
          host: '142.178.52.177',
          port: 25,
          secure: false, // true for 465, false for other ports
          tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false
      }

      });

      // setup email data with unicode symbols
      let mailOptions = {
          from: '"Harish Dewangan" <DoNotReply@telus.com>', // sender address
          to: 'harish.dewangan@telus.com', // list of receivers
          subject: 'TOCP Quiz Score for '+ req.session.user.username , // Subject line
          //text: 'Hello world?', // plain text body
          html:    '<h2>Score: '+  req.session.user.correctCount/(req.session.user.incorrectCount+req.session.user.correctCount)*100 +'%<h2>'
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log('Message sent: %s', info.messageId);
        //  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      });

  });

  res.render('sendScore', {
  page : 'sendScore',
  score:req.session.user.correctCount/(req.session.user.incorrectCount+req.session.user.correctCount)*100,
  errors: []
});
}
