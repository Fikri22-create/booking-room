require('dotenv').config()
const app = require('./app')
const sequelize = require('./src/config/database')

// Load all models to register Sequelize associations
require('./src/models/User')
require('./src/models/Room')
require('./src/models/Amenity')
require('./src/models/RoomAmenity')
require('./src/models/RoomGallery')
require('./src/models/RoomLike')
require('./src/models/Booking')
require('./src/models/payment')
require('./src/models/Review')
require('./src/models/Wishlist')
require('./src/models/Notification')
require('./src/models/AuditLog')
require('./src/models/PasswordReset')

const PORT = process.env.APP_PORT || 3000

sequelize.authenticate()
    .then(() => {
        console.log('Database connected')
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch((error) => {
        console.log(error)
    })