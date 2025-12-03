const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

/**
 * @name getBlogs
 *
 * @description GET /api/blogs Fetch all blogs from the database.
 * Populates the `user` field with username and name.
 *
 *
 * @returns {Object[]} Array of blog objects.
 */
blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
        .populate('user', { username: 1, name: 1 })

    response.json(blogs)
})

/**
 * @name createNewBlog
 *
 * @description POST /api/blogs Create a new blog entry.
 * Requires authentication and extracts the user via middleware.
 * Automatically sets likes to 0 if not provided.
 *
 * @param {Object} request.body - The blog content.
 * @param {string} request.body.title - Blog title.
 * @param {string} request.body.author - Blog author.
 * @param {string} request.body.url - Blog URL.
 * @param {number} [request.body.likes] - Number of likes.
 *
 * @returns {Object} Newly created blog object.
 */
blogsRouter.post('/', middleware.userExtractor,async (request, response) => {
    const body = request.body

    const user = request.user

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user.id
    })

    if(!blog.likes){
        blog.likes = 0
    }

    if (!blog.title || !blog.url) {
        response.status(400).end()
    } else {
        const result = await blog.save()
        user.blogs = user.blogs.concat(result._id)
        await user.save()
        response.status(201).json(result)
    }
})

/**
 * @name deleteBlog
 *
 * @description DELETE /api/blogs/:id Delete a blog by ID.
 * Only the user who created the blog may delete it.
 *
 * @returns {Response} 204 No Content - Successfully deleted.
 * @returns {Response} 400 Bad Request - Blog not found.
 * @returns {Response} 401 Unauthorized - User not authorized.
 */
blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
    const blog = await Blog.findById(request.params.id)

    const user = request.user

    if (!blog) {
        response.status(400).end()
    }

    if (blog.user.toString() === user.id.toString()) {
        await Blog.findByIdAndDelete(request.params.id)
        response.status(204).end()
    }

    response.status(401).end()
})

/**
 * @name addLikeToBlog
 *
 * @description PUT /api/blogs/:id Update an existing blog's fields.
 * Allows updating likes, title, author, and url.
 *
 * @param {Object} request.body - Updated blog fields.
 * @returns {Object} Updated blog object.
 */
blogsRouter.put('/:id', middleware.userExtractor, async (request, response) => {
    const body = request.body

    const blog = {
        ...body,
        likes: body.likes,
    }

    const findBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.status(200).json(findBlog)

})

module.exports = blogsRouter