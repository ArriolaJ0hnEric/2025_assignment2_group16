const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

/**
 * @name login
 *
 * @description POST /api/login/ Authenticates a User with username and passowrd.
 * compares the computed password hash, with the saved password hash inside the database.
 *
 * @param {Object} request.body - username and password.
 * @returns {Object} the user's username, name and a JWT.
 */
loginRouter.post('/', async (request, response) => {
    const { username, password } = request.body

    const user = await User.findOne({ username })
    const passwordCorrect = user === null
        ? false
        : bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password'
        })
    }

    const userForToken = {
        username: user.username,
        id: user._id
    }

    const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60*60 })

    response
        .status(200)
        .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter