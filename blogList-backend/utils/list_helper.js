const lodash = require('lodash')
const core = require('lodash/core')
const fp = require('lodash/fp')

const array = require('lodash/array')

const dummy = (blogs) => {
    if(blogs.length !== 0) {
        blogs.map(blog => {
            console.log(blog.likes)
        })
    }

    return 1
}

const totalLikes = (blogs) => {
    const totalLikes_helper = (totLikes, blog) => {
        return totLikes + blog.likes
    }

    return blogs.length === 0
        ? 0
        : blogs.reduce(totalLikes_helper, 0)
}

const mostLikes = (blogs) => {
    const mostLikes_help = (blog, maxBlog) => {
        return blog.likes >= maxBlog.likes
            ? blog
            : maxBlog
    }

    if(blogs.length === 0) {
        return 'no blogs'
    } else {
        const mostLikes = blogs.reduce(mostLikes_help)

        return {
                title: mostLikes.title,
                author: mostLikes.author,
                likes: mostLikes.likes
            }
    }
}

const mostBlogs = (blogs) => {
    if(blogs.length === 0) {
        return 'no blogs'
    } else {
        const group = lodash.groupBy(blogs, lodash.property('author'))

        var max = {
            author: "",
            length: 0
        }

        lodash.forOwn(group, (value, key) => {
            if(value.length >= max.length){
                max = { author: key,
                        length: value.length }
            }
        })

        return {
            author: max.author,
            blogs: max.length
        }
    }
}

const topLikes = (blogs) => {
    if(blogs.length === 0) {
        return 'no blogs'
    } else {
        const group = lodash.groupBy(blogs, lodash.property('author'))

        var max = {
            author: "",
            likes: 0
        }

        lodash.forOwn(group, (value, key) => {
            let totalLikes = 0
            value.forEach((x) => {
                totalLikes += x.likes
            })
            if(totalLikes >= max.likes){
                max = {
                    author: key,
                    likes: totalLikes
                }
            }
        })

        return max
    }
}

const test = () => {
    const manyBlogsManyAuthors = [
        {
            _id: "5a422b891b54a676234d17fa",
            title: "First class tests",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
            likes: 10,
            __v: 0
        },
        {
            _id: "5a422b3a1b54a676234d17f9",
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12,
            __v: 0
        },
        {
            _id: "5a422ba71b54a676234d17fb",
            title: "TDD harms architecture",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
            likes: 0,
            __v: 0
        },
        {
            _id: "5a422aa71b54a676234d17f8",
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 5,
            __v: 0
        },
        {
            _id: "5a422bc61b54a676234d17fc",
            title: "Type wars",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
            likes: 2,
            __v: 0
        },
        {
            _id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Edsger W. Dijkstra",
            url: "https://reactpatterns.com/",
            likes: 7,
            __v: 0
        },
    ]

    topLikes(manyBlogsManyAuthors)
}

test()


module.exports = {
    dummy,
    totalLikes,
    mostLikes,
    mostBlogs,
    topLikes
}