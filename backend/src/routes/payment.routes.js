const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const role = require('../middlewares/role')
const upload = require('../middlewares/upload')
const paymentController = require('../controllers/payment.controller')
const { auditLog } = require('../middlewares/auditLog')

router.post('/', auth, role('user'), upload.single('proof_image'), auditLog('CREATE', 'Payment'), paymentController.createPayment)
router.get('/', auth, role('admin'), paymentController.getPayments)
router.get('/export/excel', auth, role('admin'), paymentController.exportPaymentsExcel)
router.get('/me', auth, role('user'), paymentController.getMyPayments)
router.get('/invoice/:bookingId', auth, paymentController.downloadInvoice)   // MUST be before /:id
router.get('/:id', auth, paymentController.getPaymentById)
router.patch('/:id/verify', auth, role('admin'), auditLog('VERIFY', 'Payment'), paymentController.verifyPayment)
router.patch('/:id/refund', auth, role('admin'), auditLog('REFUND', 'Payment'), paymentController.refundPayment)

module.exports = router