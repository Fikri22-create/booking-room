const PDFDocument = require('pdfkit')
const QRCode = require('qrcode')
const fs = require('fs')
const path = require('path')

const generateInvoicePDF = async (booking, user, room, payment) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' })
            const fileName = `invoice-${booking.booking_code}.pdf`
            const filePath = path.join(__dirname, '../uploads/invoices', fileName)
            const invoiceDir = path.join(__dirname, '../uploads/invoices')
            if (!fs.existsSync(invoiceDir)) {
                fs.mkdirSync(invoiceDir, { recursive: true })
            }
            const stream = fs.createWriteStream(filePath)
            doc.pipe(stream)
            doc.fontSize(28).fillColor('#003580').text('ROOMORA', 50, 50)
            doc.fontSize(10).fillColor('#666').text('Hotel Booking Platform', 50, 85)
            doc.fontSize(20).fillColor('#000').text('INVOICE', 400, 50)
            doc.fontSize(10).fillColor('#666').text(`Invoice #${booking.booking_code}`, 400, 80)
            doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 400, 95)
            doc.moveTo(50, 120).lineTo(550, 120).stroke('#ddd')
            doc.fontSize(12).fillColor('#000').text('Bill To:', 50, 140)
            doc.fontSize(10).fillColor('#666')
                .text(user.name, 50, 160)
                .text(user.email, 50, 175)
            if (user.phone) {
                doc.text(user.phone, 50, 190)
            }
            const qrData = JSON.stringify({
                bookingCode: booking.booking_code,
                roomNumber: room.room_number,
                checkIn: booking.check_in,
                checkOut: booking.check_out,
                guestName: user.name
            })
            const qrImage = await QRCode.toDataURL(qrData, {
                errorCorrectionLevel: 'H',
                margin: 1,
                width: 120
            })
            const qrBuffer = Buffer.from(qrImage.split(',')[1], 'base64')
            doc.image(qrBuffer, 450, 140, { width: 100, height: 100 })
            doc.fontSize(8).fillColor('#666').text('Scan for booking details', 450, 245, { width: 100, align: 'center' })
            doc.fontSize(12).fillColor('#000').text('Booking Details', 50, 280)
            doc.moveTo(50, 295).lineTo(550, 295).stroke('#ddd')
            const detailsY = 310
            doc.fontSize(10).fillColor('#666')
                .text('Booking Code:', 50, detailsY)
                .fillColor('#000').text(booking.booking_code, 200, detailsY)
                .fillColor('#666').text('Room Number:', 50, detailsY + 20)
                .fillColor('#000').text(room.room_number, 200, detailsY + 20)
                .fillColor('#666').text('Room Type:', 50, detailsY + 40)
                .fillColor('#000').text(room.room_type.toUpperCase(), 200, detailsY + 40)
                .fillColor('#666').text('Check-in Date:', 50, detailsY + 60)
                .fillColor('#000').text(new Date(booking.check_in).toLocaleDateString('en-US'), 200, detailsY + 60)
                .fillColor('#666').text('Check-out Date:', 50, detailsY + 80)
                .fillColor('#000').text(new Date(booking.check_out).toLocaleDateString('en-US'), 200, detailsY + 80)
                .fillColor('#666').text('Guest Count:', 50, detailsY + 100)
                .fillColor('#000').text(booking.guest_count.toString(), 200, detailsY + 100)
                .fillColor('#666').text('Status:', 50, detailsY + 120)
            const statusColor = booking.status === 'approved' ? '#10b981' : booking.status === 'rejected' ? '#ef4444' : '#f59e0b'
            doc.fillColor(statusColor).text(booking.status.toUpperCase(), 200, detailsY + 120)
            doc.moveTo(50, 460).lineTo(550, 460).stroke('#ddd')
            const tableTop = 480
            doc.fontSize(10).fillColor('#666')
                .text('Description', 50, tableTop)
                .text('Price', 350, tableTop, { width: 100, align: 'right' })
                .text('Qty', 450, tableTop, { width: 50, align: 'right' })
                .text('Amount', 500, tableTop, { width: 50, align: 'right' })
            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke('#ddd')
            const nights = Math.ceil((new Date(booking.check_out) - new Date(booking.check_in)) / (1000 * 60 * 60 * 24))
            doc.fontSize(10).fillColor('#000')
                .text(`${room.room_type.toUpperCase()} Room`, 50, tableTop + 25)
                .text(`Rp ${room.price_per_night.toLocaleString('id-ID')}`, 350, tableTop + 25, { width: 100, align: 'right' })
                .text(nights.toString(), 450, tableTop + 25, { width: 50, align: 'right' })
                .text(`Rp ${booking.total_price.toLocaleString('id-ID')}`, 500, tableTop + 25, { width: 50, align: 'right' })
            doc.moveTo(50, tableTop + 45).lineTo(550, tableTop + 45).stroke('#ddd')
            doc.fontSize(12).fillColor('#000')
                .text('Total Amount:', 400, tableTop + 60)
                .fontSize(14).fillColor('#003580')
                .text(`Rp ${booking.total_price.toLocaleString('id-ID')}`, 500, tableTop + 60, { width: 50, align: 'right' })
            if (payment) {
                doc.fontSize(10).fillColor('#666')
                    .text(`Payment Status: `, 400, tableTop + 85)
                const paymentColor = payment.status === 'paid' ? '#10b981' : payment.status === 'failed' ? '#ef4444' : '#f59e0b'
                doc.fillColor(paymentColor).text(payment.status.toUpperCase(), 490, tableTop + 85)
                doc.fillColor('#666').text(`Payment Method: ${payment.payment_method.replace('_', ' ').toUpperCase()}`, 400, tableTop + 100)
            }
            doc.fontSize(10).fillColor('#666')
                .text('Thank you for choosing Roomora!', 50, 680, { align: 'center', width: 500 })
                .text('For any questions, please contact us at support@roomora.com', 50, 695, { align: 'center', width: 500 })
            doc.moveTo(50, 720).lineTo(550, 720).stroke('#ddd')
            doc.fontSize(8).fillColor('#999')
                .text(`© ${new Date().getFullYear()} Roomora. All rights reserved.`, 50, 730, { align: 'center', width: 500 })
                .text('This is a computer-generated invoice and does not require a signature.', 50, 745, { align: 'center', width: 500 })
            doc.end()
            stream.on('finish', () => {
                resolve(fileName)
            })
            stream.on('error', (error) => {
                reject(error)
            })
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = { generateInvoicePDF }
