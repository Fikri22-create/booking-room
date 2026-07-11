const { apiLimiter } = require('./src/middlewares/rateLimiter')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./src/docs/swagger')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')
const routes = require('./src/routes')
const app = express()

app.use(cors())
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}))
app.use(morgan('dev'))
app.use('/api', apiLimiter)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use("/api/users", require("./src/routes/user.routes"));
app.use('/api', routes)
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: 'Route not found'
    })
})
app.use((error, req, res, next) => {
    return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error'
    })
})

module.exports = app
