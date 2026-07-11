const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const role = require('../middlewares/role')
const amenityController = require('../controllers/amenity.controller')
const { auditLog } = require('../middlewares/auditLog')

router.get('/', amenityController.getAllAmenities)
router.get('/:id', amenityController.getAmenityById)
router.post('/', auth, role('admin'), auditLog('CREATE', 'Amenity'), amenityController.createAmenity)
router.put('/:id', auth, role('admin'), auditLog('UPDATE', 'Amenity'), amenityController.updateAmenity)
router.delete('/:id', auth, role('admin'), auditLog('DELETE', 'Amenity'), amenityController.deleteAmenity)
router.post('/:id/restore', auth, role('admin'), auditLog('RESTORE', 'Amenity'), amenityController.restoreAmenity)
router.delete('/:id/permanent', auth, role('admin'), auditLog('PERMANENT_DELETE', 'Amenity'), amenityController.permanentDeleteAmenity)
router.post('/assign-to-room', auth, role('admin'), auditLog('ASSIGN', 'RoomAmenity'), amenityController.assignAmenityToRoom)
router.get('/room/:roomId', amenityController.getRoomAmenities)

module.exports = router
