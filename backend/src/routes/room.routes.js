const express = require("express")
const roomController = require("../controllers/room.controller")
const auth = require("../middlewares/auth")
const role = require("../middlewares/role")
const upload = require("../middlewares/upload")
const router = express.Router()
const validation = require('../middlewares/validation')
const { createRoomValidation, updateRoomValidation } = require('../validations/room.validation')

// Static / specific routes FIRST (before wildcard /:id)
router.get("/export/excel", auth, role("admin"), roomController.exportRoomsExcel)
router.get("/available", auth, roomController.getAvailableRooms)
router.get("/deleted", auth, role("admin"), roomController.getDeletedRooms)
router.delete("/gallery/:galleryId", auth, role("admin"), roomController.deleteGallery)  // MUST be before /:id

// CRUD for rooms
router.post(
    "/",
    auth,
    role("admin"),
    upload.single("image"),
    createRoomValidation,
    validation,
    roomController.createRoom
)
router.get("/", auth, roomController.getRooms)

// Wildcard /:id routes AFTER specific ones
router.get("/:id/gallery", auth, roomController.getRoomGallery)
router.get("/:id/booked-dates", auth, roomController.getRoomBookedDates)
router.get("/:id/bookings", auth, role("admin"), roomController.getRoomBookings)
router.post(
    "/:id/gallery",
    auth,
    role("admin"),
    upload.array("images", 10),
    roomController.uploadGallery
)
router.post("/:id/restore", auth, role("admin"), roomController.restoreRoom)
router.delete("/:id/permanent", auth, role("admin"), roomController.permanentDeleteRoom)
router.get("/:id", auth, roomController.getRoomById)
router.put(
    "/:id",
    auth,
    role("admin"),
    upload.single("image"),
    updateRoomValidation,
    validation,
    roomController.updateRoom
)
router.delete("/:id", auth, role("admin"), roomController.deleteRoom)

module.exports = router;