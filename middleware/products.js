const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization')
    // console.log(req.header('Authorization'))
    // console.log(process.env.ACCESS_TOKEN_SECRET)
    const token = authHeader && authHeader.split(' ')[1]

    if (!token)
        return res
            .status(401)
            .json({ success: false, message: 'Access token not found' })

    try {

        const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // console.log(data)
        next()

    } catch (error) {
        console.log(error)
        return res.status(403).json({ success: false, message: 'Invalid token' })
    }
}

module.exports = verifyToken
