const Payment = require('../models/payment')
const Booking = require('../models/Booking')
const User = require('../models/User')
const Room = require('../models/Room')
const ExcelJS = require('exceljs')
const { sendPaymentReceived, sendPaymentVerified } = require('../services/emailService')
const { createNotification } = require('../controllers/notification.controller')
const { generateInvoicePDF } = require('../services/pdfService')
const { createAuditLog } = require('../middlewares/auditLog')
const path = require('path')
const generatePaymentCode = async () => {
    const lastPayment = await Payment.findOne({
        order: [['id', 'DESC']]
    })
    const nextNumber = lastPayment
        ? lastPayment.id + 1
        : 1
    return `PAY-${String(nextNumber).padStart(4, '0')}`
}

exports.createPayment = async (req, res, next) => {
    try {
        const { bookingId, payment_method } = req.body
        const booking = await Booking.findByPk(bookingId)
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' })
        }
        if (booking.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Forbidden access' })
        }
        if (booking.status !== 'approved') {
            return res.status(400).json({ success: false, message: 'Booking must be approved first' })
        }
        const existingPayment = await Payment.findOne({
            where: {
                bookingId
            }
        })
        if (existingPayment) {
            return res.status(400).json({ success: false, message: 'Payment already exists' })
        }
        const payment_code = await generatePaymentCode()
        const payment = await Payment.create({
            bookingId,
            payment_method,
            amount: booking.total_price,
            payment_date: new Date(),
            proof_image: req.file
                ? req.file.filename
                : null,
            payment_code
        })

        const user = await User.findByPk(req.user.id)
        const room = await Room.findByPk(booking.roomId)

        try {
            await sendPaymentReceived(payment, booking, user, room)
        } catch (emailError) {
            console.error('Failed to send payment email:', emailError)
        }

        try {
            await createNotification(
                req.user.id,
                'Payment Received',
                `Your payment proof for booking ${booking.booking_code} has been received. Awaiting admin verification.`,
                'payment',
                `/user/my-payments`,
                'credit-card'
            )
        } catch (notifError) {
            console.error('Failed to create notification:', notifError)
        }

        await createAuditLog(req.user.id, 'CREATE', 'Payment', payment.id, null, payment.toJSON(), req, 'Payment created')

        return res.status(201).json({ success: true, data: payment })
    } catch (error) {
        next(error)
    }
}
exports.getPayments = async (req, res, next) => {
    try {
        const {
            status,
            payment_method,
            page = 1,
            limit = 10
        } = req.query
        const currentPage = Math.max(Number(page), 1)
        const currentLimit = Math.min(Math.max(Number(limit), 1), 100)
        const offset = (currentPage - 1) * currentLimit
        const whereClause = {}
        if (status) {
            whereClause.status = status
        }
        if (payment_method) {
            whereClause.payment_method = payment_method
        }
        const { count, rows } = await Payment.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Booking,
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'name', 'email']
                        },
                        {
                            model: Room
                        }
                    ]
                }
            ],
            order: [['id', 'DESC']],
            limit: currentLimit,
            offset
        })
        return res.status(200).json({
            success: true,
            page: currentPage,
            limit: currentLimit,
            totalData: count,
            totalPage: Math.ceil(count / currentLimit),
            data: rows
        })
    } catch (error) {
        next(error)
    }
}
exports.getMyPayments = async (req, res, next) => {
    try {
        const payments = await Payment.findAll({
            include: [
                {
                    model: Booking,
                    where: {
                        userId: req.user.id
                    },
                    include: [
                        {
                            model: Room
                        }
                    ]
                }
            ],
            order: [['id', 'DESC']]
        })
        return res.status(200).json({
            success: true,
            data: payments
        })
    } catch (error) {
        next(error)
    }
}
exports.verifyPayment = async (req, res, next) => {
    try {
        const payment = await Payment.findByPk(req.params.id)
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            })
        }
        if (payment.status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment already verified'
            })
        }
        payment.status = 'paid'
        await payment.save()

        const booking = await Booking.findByPk(payment.bookingId, {
            include: [
                { model: User },
                { model: Room }
            ]
        })

        try {
            await sendPaymentVerified(payment, booking, booking.User, booking.Room)
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError)
        }

        try {
            await createNotification(
                booking.userId,
                'Payment Verified',
                `Your payment for booking ${booking.booking_code} has been verified. Your booking is confirmed!`,
                'payment',
                `/user/my-payments`,
                'check-circle'
            )
        } catch (notifError) {
            console.error('Failed to create notification:', notifError)
        }

        await createAuditLog(req.user.id, 'VERIFY', 'Payment', payment.id, { status: 'pending' }, { status: 'paid' }, req, 'Payment verified')

        return res.status(200).json({
            success: true,
            message: 'Payment verified',
            data: payment
        })
    } catch (error) {
        next(error)
    }
}
exports.refundPayment = async (req, res, next) => {
    try {
        const payment = await Payment.findByPk(req.params.id)
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' })
        }
        if (payment.status !== 'paid') {
            return res.status(400).json({ success: false, message: 'Only paid payment can be refunded' })
        }
        payment.status = 'refunded'
        await payment.save()

        const booking = await Booking.findByPk(payment.bookingId, {
            include: [{ model: User }]
        })

        try {
            await createNotification(
                booking.userId,
                'Payment Refunded',
                `Your payment for booking ${booking.booking_code} has been refunded.`,
                'payment',
                `/user/my-payments`,
                'alert-circle'
            )
        } catch (notifError) {
            console.error('Failed to create notification:', notifError)
        }

        await createAuditLog(req.user.id, 'REFUND', 'Payment', payment.id, { status: 'paid' }, { status: 'refunded' }, req, 'Payment refunded')

        return res.status(200).json({ success: true, message: 'Payment refunded', data: payment })
    } catch (error) {
        next(error)
    }
}
exports.getPaymentById = async (req, res, next) => {
    try {
        const payment = await Payment.findByPk(
            req.params.id,
            {
                include: [
                    {
                        model: Booking,
                        include: [
                            {
                                model: User,
                                attributes: [
                                    'id',
                                    'name',
                                    'email',
                                    'phone',
                                    'address',
                                    'avatar'
                                ]
                            },
                            {
                                model: Room
                            }
                        ]
                    }
                ]
            }
        )
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' })
        }
        if (req.user.role !== 'admin') {
            const bookingUserId = payment.Booking?.userId
            if (bookingUserId !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden access'
                })
            }
        }

        return res.status(200).json({ success: true, data: payment })
    } catch (error) {
        next(error)
    }
}

exports.exportPaymentsExcel = async (req, res, next) => {
    try {
        const payments = await Payment.findAll({
            include: [
                {
                    model: Booking,
                    include: [
                        { model: User, attributes: ['name', 'email'] },
                        { model: Room, attributes: ['room_number'] }
                    ]
                }
            ],
            order: [['id', 'DESC']]
        })

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Payments')

        worksheet.columns = [
            { header: 'Payment Code', key: 'payment_code', width: 15 },
            { header: 'Booking Code', key: 'booking_code', width: 20 },
            { header: 'Guest Name', key: 'guest_name', width: 25 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Room No', key: 'room_number', width: 12 },
            { header: 'Payment Method', key: 'payment_method', width: 18 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Payment Status', key: 'status', width: 15 },
            { header: 'Payment Date', key: 'payment_date', width: 20 }
        ]

        payments.forEach((payment) => {
            worksheet.addRow({
                payment_code: payment.payment_code,
                booking_code: payment.booking?.booking_code,
                guest_name: payment.booking?.user?.name,
                email: payment.booking?.user?.email,
                room_number: payment.booking?.room?.room_number,
                payment_method: payment.payment_method,
                amount: payment.amount,
                status: payment.status,
                payment_date: payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('id-ID') : '-'
            })
        })

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=payments.xlsx'
        )

        await workbook.xlsx.write(res)
        res.end()
    } catch (error) {
        next(error)
    }
}

exports.downloadInvoice = async (req, res, next) => {
    try {
        const { bookingId } = req.params

        const booking = await Booking.findByPk(bookingId, {
            include: [
                { model: User },
                { model: Room },
                { model: Payment }
            ]
        })

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            })
        }

        if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden access'
            })
        }

        if (booking.status !== 'approved' || !booking.Payment || booking.Payment.status !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Invoice only available for approved bookings with verified payment'
            })
        }

        const fileName = await generateInvoicePDF(booking, booking.User, booking.Room, booking.Payment)
        const filePath = path.join(__dirname, '../uploads/invoices', fileName)

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('Download error:', err)
                return res.status(500).json({
                    success: false,
                    message: 'Failed to download invoice'
                })
            }
        })
    } catch (error) {
        next(error)
    }
}