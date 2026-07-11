const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const role = require('../middlewares/role')
const auditLogController = require('../controllers/auditLog.controller')

router.get('/', auth, role('admin'), auditLogController.getAllAuditLogs)
router.get('/stats', auth, role('admin'), auditLogController.getAuditStats)
router.get('/me', auth, auditLogController.getMyAuditLogs)
router.get('/:id', auth, role('admin'), auditLogController.getAuditLogById)

module.exports = router
