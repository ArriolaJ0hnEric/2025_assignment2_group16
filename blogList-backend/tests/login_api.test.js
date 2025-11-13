const { test, describe, after } = require('node:test')
const app = require('../app')
const supertest = require('supertest')
const assert = require('assert')
const mongoose = require('mongoose')
const helper = require('./test_helper')

const api = supertest(app)

describe('login tests', () => {
    test('login with valid username and password', async () => {

        await api
            .post('/api/login')
            .send(helper.validUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('fails with correct statuscode when logging in with nonexistent user', async () => {
        const invalidUser = {
            username: 'nonuser',
            password: 'nonpassword'
        }

        const result = await api
            .post('/api/login')
            .send(invalidUser)
            .expect(401)
            .expect('Content-Type', /application\/json/)

        assert(result.body.error.includes('invalid username or password'))
    })

    test('fails with correct statuscode when logging in with incorrect password', async () => {
        const invalidUser = {
            username: 'root',
            password: 'nonpassword'
        }

        const result = await api
            .post('/api/login')
            .send(invalidUser)
            .expect(401)
            .expect('Content-Type', /application\/json/)

        assert(result.body.error.includes('invalid username or password'))
    })
})

after( async () => {
    await mongoose.connection.close()
})