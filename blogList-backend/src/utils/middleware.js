const logger = require('./logger')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

/**
 * Logs incoming HTTP requests using the logger utility.
 *
 * @middleware
 * @description Logs method, path, and body of the request for debugging.
 * @param {Object} request - Express request object.
 * @param {Object} response - Express response object.
 * @param {Function} next - Callback to pass control to the next middleware.
 */
const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
}

/**
 * Extracts a bearer token from the Authorization header.
 *
 * @middleware
 * @description Looks for a `Bearer <token>` header and attaches the token to `request.token`.
 * @param {Object} request - Express request object.
 * @param {Object} response - Express response object.
 * @param {Function} next - Callback to pass control to the next middleware.
 */
const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        request.token = authorization.replace('Bearer ', '')
    }

    next()
}

/**
 * Extracts the authenticated user from a verified JWT.
 *
 * @middleware
 * @async
 * @description Verifies `request.token` and attaches the corresponding user document
 * to `request.user`. Requires a valid JWT.
 * @throws {JsonWebTokenError} If the token is invalid.
 * @throws {TokenExpiredError} If the token has expired.
 * @param {Object} request - Express request object.
 * @param {Object} response - Express response object.
 * @param {Function} next - Callback to pass control to the next middleware.
 */
const userExtractor = async (request, response, next) => {
    const token = jwt.verify(request.token, process.env.SECRET)
    request.user = await User.findById(token.id)

    next()
}

/**
 * Handles unknown endpoint requests.
 *
 * @middleware
 * @description Returns a 404 error for any route not defined.
 * @param {Object} request - Express request object.
 * @param {Object} response - Express response object.
 */
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

/**
 * Centralized error-handling middleware.
 *
 * @middleware
 * @description Catches and formats various known Mongoose, JWT, and validation errors.
 * Logs error messages and returns appropriate HTTP responses.
 *
 * @param {Object} error - The error thrown in preceding middleware/controllers.
 * @param {Object} request - Express request object.
 * @param {Object} response - Express response object.
 * @param {Function} next - Callback to pass control to default Express error handler.
 *
 * @returns {Object} JSON error response when known error types are matched.
 */
const errorHandler = (error, request, response, next) => {
    logger.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (
        error.name === 'MongoServerError' &&
        error.message.includes('E11000 duplicate key error')
    ) {
        return response.status(400).json({ error: 'expected `username` to be unique' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: 'username must be at least 3 characters long' })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({ error: 'invalid token' })
    } else if (error.name === 'TokenExpiredError') {
        return response.status(401).json({ error: 'expired token' })
    }

    next(error)
}

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor
}