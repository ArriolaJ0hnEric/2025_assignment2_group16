import { useState } from 'react'
import PropTypes from 'prop-types'

const Blog = ({ blog, addLike, deleteBlog }) => {
    const [fullView, setFullView] = useState(false)

    const handleFullView = (event) => {
        event.preventDefault()

        setFullView(!fullView)
    }

    const blogStyle = {
        paddingTop: 10,
        paddingLeft: 2,
        border: 'solid',
        borderWidth: 1,
        marginBottom: 5
    }

    const showDeleteButton = () => {
        const loggedUser = window.localStorage.getItem('loggedUser')
        const user = JSON.parse(loggedUser)
        return blog.user.username === user.username
    }

    const handleLike = async (event) => {
        event.preventDefault()

        await addLike({
            ...blog,
            likes: blog.likes + 1,
            user: blog.user.id
        })
    }

    const handleDelete = async (event) => {
        event.preventDefault()

        if(window.confirm(`Are you sure you wanna delete ${blog.title}??`)){
            await deleteBlog(blog)
        }
    }

    const notFullInfo = () => (
        <p>{blog.title} {blog.author} <button onClick={handleFullView}>
          view
        </button></p>
    )

    const fullInfo = () => (
        <div>
            <p className='blogAllInfo'>{blog.title} {blog.author}
                <button onClick={handleFullView}>hide</button> <br />
                <a href={blog.url}>{blog.url}</a><br />
                likes {blog.likes} <button onClick={handleLike}>like</button> <br />
                {blog.user.username} <br />
                {showDeleteButton()
                    ? <button onClick={handleDelete}>delete</button>
                    : ''}
            </p>
        </div>
    )

    return(
        <div style={blogStyle} className='blog'>
            {fullView
                ? fullInfo()
                : notFullInfo()}
        </div>
    )
}

Blog.propTypes = {
    blog: PropTypes.object.isRequired,
    addLike: PropTypes.func.isRequired,
    deleteBlog: PropTypes.func.isRequired
}

export default Blog