const sendGrid = require('@sendgrid/mail')

sendGrid.setApiKey(process.env.sendGridAPIKey);

const  sendWelcomeMessage = (email, name)=>{
    sendGrid.send({
        to:email,
        from: 'pritambiswaskorn@gmail.com',
        subject: 'Welcome to the application.',
        text: `Welcome to the application ${name}, We're happy to that you choose the application.`
    })
}
const userDeleteAccount = (email, name)=>{
          sendGrid.send({
              to: email,
              from: 'pritambiswaskorn@gmail.com',
              subject: 'Please tell us what we have mistaken',
              text: `Tell us where we can improved ourselves.`
          })  
}

module.exports = {
    sendWelcomeMessage,
    userDeleteAccount,

}