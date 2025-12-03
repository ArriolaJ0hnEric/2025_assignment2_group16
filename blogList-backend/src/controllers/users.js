const bcrypt = require('bcrypt')
const User = require('../models/user')
const usersRouter = require('express').Router()

/**
 * @name getAllUsers
 *
 * @description GET /api/users/ Gets a list of all users inside the database, with the blog they posted.
 *
 * @returns {Object} User info, with corresponding blogs they posted.
 */
usersRouter.get('/', async (request, response) => {
    const users = await User.find({})
        .populate('blogs', { url: 1, title: 1, author: 1 })
    response.json(users)
})

/**
 * @name signup
 *
 * @description POST /api/users Creates a new user in the database. The password is hashed before storage.
 * The username, name, and password are taken from the request body.
 *
 * @param {Object} request.body - The request payload.
 * @param {string} request.body.username - The desired username.
 * @param {string} request.body.name - The display name of the user.
 * @param {string} request.body.password - The raw password (must be at least 3 characters).
 *
 * @returns {Response} 201 Created - Returns the newly created user.
 * @returns {Response} 400 Bad Request - Returned when the password is too short or validation fails.
 */
usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    if(password.length < 3){
        return response.status(400).json({ error: 'password must be at least 3 characters long' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username: username,
        name: name,
        passwordHash: passwordHash
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
})

module.exports = usersRouter