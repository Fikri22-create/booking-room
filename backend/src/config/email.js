const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})

transporter.verify(function (error) {
    if (error) {
        console.log('Email service error:', error)
    } else {
        console.log('Email service ready')
    }
})

module.exports = transporter
