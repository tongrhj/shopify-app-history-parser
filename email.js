const MailListener = require("mail-listener2-updated")

require('dotenv').config()

async function downloadEmailAttachment () {

  const mailListener = new MailListener({
    username: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PW,
    host: 'imap.gmail.com',
    port: 993, // imap port
    tls: true,
    connTimeout: 10000, // Default by node-imap
    authTimeout: 5000, // Default by node-imap,
    debug: console.log, // Or your custom function with only one incoming argument. Default: null
    tlsOptions: { rejectUnauthorized: false },
    mailbox: process.env.EMAIL_MAILBOX, // mailbox to monitor
    searchFilter: ['UNSEEN'], // the search filter being used after an IDLE notification has been retrieved
    markSeen: false, // all fetched email willbe marked as seen and not fetched next time
    fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
    attachments: true, // download attachments as they are encountered to the project directory
    attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
  })

  mailListener.start()

  mailListener.on("server:connected", function () {
    console.log("imapConnected")
    console.log()
  })

  mailListener.on("server:disconnected", function () {
    console.log("imapDisconnected");
  })

  mailListener.on("error", function (err) {
    console.log(err);
  })

  mailListener.on("mail", function (mail, seqno, attributes) {
    // do something with mail object including attachments
    console.log("emailParsed", mail);
    // mail processing code goes here
  })

  mailListener.on("attachment", function (attachment) {
    console.log(attachment.path)
    console.log('Stopping')
    mailListener.stop()
  })
}

downloadEmailAttachment()
