const transporter = require('../config/email')

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Roomora" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        })
        return info
    } catch (error) {
        console.error('Email send error:', error)
        throw error
    }
}

const sendWelcomeEmail = async (user) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #003580 0%, #0057b8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #003580; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to Roomora! 🎉</h1>
                </div>
                <div class="content">
                    <h2>Hi ${user.name},</h2>
                    <p>Thank you for registering at Roomora. We're excited to have you on board!</p>
                    <p>You can now browse our rooms, make bookings, and enjoy a seamless experience.</p>
                    <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a>
                    <p>If you have any questions, feel free to contact us.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Roomora. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `
    return sendEmail(user.email, 'Welcome to Roomora!', html)
}

const sendBookingConfirmation = async (booking, user, room) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #003580 0%, #0057b8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; }
                .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                .label { font-weight: bold; color: #003580; }
                .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; border-radius: 0 0 10px 10px; background: #f8f9fa; padding: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Booking Confirmation ✅</h1>
                </div>
                <div class="content">
                    <h2>Hi ${user.name},</h2>
                    <p>Your booking has been successfully created!</p>
                    <div class="booking-details">
                        <h3>Booking Details:</h3>
                        <div class="detail-row">
                            <span class="label">Booking Code:</span>
                            <span>${booking.booking_code}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Room:</span>
                            <span>${room.room_number} (${room.room_type})</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Check-in:</span>
                            <span>${booking.check_in}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Check-out:</span>
                            <span>${booking.check_out}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Guest Count:</span>
                            <span>${booking.guest_count}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Total Price:</span>
                            <span>Rp ${booking.total_price.toLocaleString('id-ID')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Status:</span>
                            <span style="color: #f59e0b; font-weight: bold;">Pending</span>
                        </div>
                    </div>
                    <p><strong>Next Step:</strong> Please upload your payment proof to confirm your booking.</p>
                    <a href="${process.env.FRONTEND_URL}/user/my-bookings" class="button">View My Bookings</a>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Roomora. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `
    return sendEmail(user.email, `Booking Confirmation - ${booking.booking_code}`, html)
}

const sendPaymentReceived = async (payment, booking, user, room) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; }
                .payment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                .label { font-weight: bold; color: #059669; }
                .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; border-radius: 0 0 10px 10px; background: #f8f9fa; padding: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Payment Received 💳</h1>
                </div>
                <div class="content">
                    <h2>Hi ${user.name},</h2>
                    <p>We have received your payment proof!</p>
                    <div class="payment-details">
                        <h3>Payment Details:</h3>
                        <div class="detail-row">
                            <span class="label">Payment Code:</span>
                            <span>${payment.payment_code}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Booking Code:</span>
                            <span>${booking.booking_code}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Amount:</span>
                            <span>Rp ${payment.amount.toLocaleString('id-ID')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Method:</span>
                            <span>${payment.payment_method}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Status:</span>
                            <span style="color: #f59e0b; font-weight: bold;">Pending Verification</span>
                        </div>
                    </div>
                    <div class="alert">
                        <strong>⏳ Verification in Progress</strong><br>
                        Our team is verifying your payment. You will receive a confirmation email once it's approved.
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Roomora. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `
    return sendEmail(user.email, `Payment Received - ${payment.payment_code}`, html)
}

const sendPaymentVerified = async (payment, booking, user, room) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; }
                .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                .label { font-weight: bold; color: #059669; }
                .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; border-radius: 0 0 10px 10px; background: #f8f9fa; padding: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Payment Verified ✅</h1>
                </div>
                <div class="content">
                    <h2>Hi ${user.name},</h2>
                    <div class="success-box">
                        <strong>🎉 Great News!</strong><br>
                        Your payment has been verified and your booking is confirmed!
                    </div>
                    <div class="booking-details">
                        <h3>Booking Details:</h3>
                        <div class="detail-row">
                            <span class="label">Booking Code:</span>
                            <span>${booking.booking_code}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Room:</span>
                            <span>${room.room_number} (${room.room_type})</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Check-in:</span>
                            <span>${booking.check_in}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Check-out:</span>
                            <span>${booking.check_out}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Status:</span>
                            <span style="color: #10b981; font-weight: bold;">Confirmed</span>
                        </div>
                    </div>
                    <p>We look forward to welcoming you! Please save your booking code for check-in.</p>
                    <a href="${process.env.FRONTEND_URL}/user/my-bookings" class="button">Download Invoice</a>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Roomora. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `
    return sendEmail(user.email, `Payment Verified - Booking Confirmed!`, html)
}

const sendPasswordResetEmail = async (user, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #003580 0%, #0057b8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; }
                .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .button { display: inline-block; padding: 12px 30px; background: #003580; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; border-radius: 0 0 10px 10px; background: #f8f9fa; padding: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request 🔐</h1>
                </div>
                <div class="content">
                    <h2>Hi ${user.name},</h2>
                    <p>We received a request to reset your password for your Roomora account.</p>
                    <p>Click the button below to reset your password:</p>
                    <a href="${resetUrl}" class="button">Reset Password</a>
                    <div class="alert">
                        <strong>⚠️ Security Notice</strong><br>
                        This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
                    </div>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #003580;">${resetUrl}</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Roomora. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `
    return sendEmail(user.email, 'Password Reset Request', html)
}

const sendPasswordResetSuccess = async (user) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; }
                .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; border-radius: 0 0 10px 10px; background: #f8f9fa; padding: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Successful ✅</h1>
                </div>
                <div class="content">
                    <h2>Hi ${user.name},</h2>
                    <div class="success-box">
                        <strong>🎉 Success!</strong><br>
                        Your password has been successfully reset.
                    </div>
                    <p>You can now login with your new password.</p>
                    <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a>
                    <p>If you didn't make this change, please contact us immediately.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Roomora. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `
    return sendEmail(user.email, 'Password Reset Successful', html)
}

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendBookingConfirmation,
    sendPaymentReceived,
    sendPaymentVerified,
    sendPasswordResetEmail,
    sendPasswordResetSuccess
}
