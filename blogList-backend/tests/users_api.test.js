const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const app = require('../app')
const supertest = require('supertest')
const helper = require('./test_helper')
const User = require('../models/user')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const api = supertest(app)

beforeEach(async () => {
    await User.deleteMany({})

    let passwordHash = await bcrypt.hash('M0n4_$imp', 10)
    let user = new User({
        username: 'Mona_Simp',
        name: 'je1',
        passwordHash
    })

    await user.save()

    passwordHash = await bcrypt.hash('Strum$t0rgs', 10)
    user = new User({
        username: 'MonaGenshin',
        name: 'je2',
        passwordHash
    })

    await user.save()
})

describe('USERS API', () => {
    test('make sure users in db is initially 2', async () => {
        const response = await api
            .get('/api/users')

        assert.strictEqual(response.body.length, 2)
    })

    test('succeeds with proper statuscode when valid user', async () => {
        const validUser = {
            username: 'mluukkai',
            name: 'mluukkai',
            password: 'rics'
        }

        const usersBefore = await helper.usersInDb()

        await api
            .post('/api/users')
            .send(validUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAfter = await helper.usersInDb()
        assert.strictEqual(usersAfter.length, usersBefore.length + 1)

        const usernames = usersAfter.map(u => u.username)
        assert(usernames.includes(validUser.username))
    })

    test('fails with proper statuscode and message when trying to add a user with invalid password', async () => {
        const invalidUser = {
            username: 'errorUser',
            name: 'error',
            password: 'si'
        }

        const usersBefore = await helper.usersInDb()

        const response = await api
            .post('/api/users')
            .send(invalidUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        assert(response.body.error.includes('password must be at least 3 characters long'))

        const usersAfter = await helper.usersInDb()
        assert.strictEqual(usersAfter.length, usersBefore.length)
    })

    test('fails with proper statuscode and message when adding a user with already taken username', async () => {
        const userNameTaken = {
            username: 'Mona_Simp',
            name: 'already taken userName',
            password: 'sasasadas'
        }

        const usersBefore = await helper.usersInDb()

        const response = await api
            .post('/api/users')
            .send(userNameTaken)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        assert(response.body.error.includes('expected `username` to be unique'))

        const usersAfter = await helper.usersInDb()
        assert.strictEqual(usersAfter.length, usersBefore.length)
    })

    test('fails with proper statuscode and message when invalid username', async () => {
        const invalidUsername = {
            username: 'us',
            name: 'invalidUser',
            password: 'invaliduser'
        }

        const usersBefore = await helper.usersInDb()

        const response = await api
            .post('/api/users')
            .send(invalidUsername)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        assert(response.body.error.includes('username must be at least 3 characters long'))

        const usersAfter = await helper.usersInDb()
        assert.strictEqual(usersAfter.length, usersBefore.length)
    })
})

after(async () => {
    await mongoose.connection.close()
})