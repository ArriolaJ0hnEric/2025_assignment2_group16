const { test, describe, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const app = require('../app')
const Blog = require('../models/blog')
const supertest = require('supertest')
const assert = require('node:assert')
const helper = require('./test_helper')
const { lastIndexOf } = require('lodash')
const jwt = require('jsonwebtoken')


const api = supertest(app)

let token = ''

beforeEach(async () => {
    await Blog.deleteMany({})

    const validUser = helper.validUser

    const response = await api
        .post('/api/login')
        .send(validUser)
    
    token = response.body.token

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(helper.initialBlogs[0])

    await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(helper.initialBlogs[1])
})

describe('GET tests', () => {
    test('test return json', async () => {
        await api.get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('returns correct number of blogs', async () => {
        const response = await api.get('/api/blogs')

        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('unique identifier is id', async () => {
        const response = await api.get('/api/blogs')

        const first_keys = Object.keys(response.body[0])

        assert(first_keys.includes('id'))
    })
})

describe('POST tests', () => {
    test('POST adds a new blog to database', async () => {
        const newBlog = {
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAfter = await helper.notesInDb()
        
        assert.strictEqual(blogsAfter.length, helper.initialBlogs.length + 1)

        const content = blogsAfter.map(b => b.title)

        assert(content.includes('React patterns'))

        const users = blogsAfter.map(b => b.user)
        const tokenValidated = jwt.verify(token, process.env.SECRET)
        const userId = tokenValidated.id
        const lastIndex = lastIndexOf(users) -1

        assert.strictEqual(users[lastIndex].toString(), userId.toString())
    })

    test('no likes equals 0 likes', async () => {
        const newBlog = {
            title: "TDD harms architecture",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAfter = await helper.notesInDb()

        const content = blogsAfter.map(b => b.likes)

        assert.strictEqual(content[content.length - 1], 0)
    })

    test('fail with statuscode 400 if bad request', async () => {
        const newBlog = {
            author: "Robert C. Martin",
            likes: 5,
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(400)
    })

    test('fail with proper statuscode and error when token not provided', async () => {
        const newBlog = {
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
        }

        const response = await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
        
        assert.strictEqual(response.body.error, 'invalid token')
    })
})

describe('DELETE tests', () => {
    test('deletes a document from DB', async () => {
        const blogBefore = await helper.notesInDb()
        const blogToDelete = blogBefore[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)

        const blogsAfter = await helper.notesInDb()

        assert.strictEqual(blogsAfter.length, helper.initialBlogs.length - 1)
    })

    test('fail with proper statuscode and error when token not provided', async () => {
        const blogBefore = await helper.notesInDb()
        const blogToDelete = blogBefore[0]

        const response = await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(401)
        
        assert.strictEqual(response.body.error, 'invalid token')
    })
})

describe('PUT tests', () => {
    test('updates a document from DB', async () => {
        const blogsBefore = await helper.notesInDb()
        const blogToUpdate = blogsBefore[0]

        blogToUpdate.likes = 10

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(blogToUpdate)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const blogsAfter = await helper.notesInDb()
        const updatedBlog = blogsAfter[0]

        assert.strictEqual(updatedBlog.likes, 10)
    })

    test('fails with errorcode 400 if id is invalid', async () => {
        const blogsBefore = await helper.notesInDb()
        const blogToUpdate = blogsBefore[0]

        blogToUpdate.id = '56'
        blogToUpdate.likes = 10

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(blogToUpdate)
            .expect(400)
    })

    test('fail with proper statuscode and error when token not provided', async () => {
        const blogBefore = await helper.notesInDb()
        const blogToUpdate = blogBefore[0]

        blogToUpdate.likes = 10

        const response = await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .expect(401)
        
        assert.strictEqual(response.body.error, 'invalid token')
    })
})

after(async () => {
    await mongoose.connection.close()
})