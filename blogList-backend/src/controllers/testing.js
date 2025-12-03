const router = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

/**
 * @name setupTest
 *
 * @description POST /api/testing/ Sets up the testing database, so it will be empty.
 *
 * @returns {Response} 204 No Content - Successfully reset the database.
 */
router.post('/reset', async (request, response) => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    response.status(204).end()
})

module.exports = router