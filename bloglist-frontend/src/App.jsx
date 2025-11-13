import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import AddNew from './components/AddNew'
import Notification from './components/Notification'
import './css/index.css'
import Togglable from './components/Togglable'

const App = () => {
    const [blogs, setBlogs] = useState([])
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [user, setUser] = useState(null)
    const [message, setMessage] = useState({
        message: null,
        type: null
    })
    const blogFormRef = useRef()
    const errorMessage = (exception) => ({
        message: exception.error,
        type: 'error'
    })

    const compare = (a, b) => {
        if (a.likes < b.likes){
            return 1
        } else if (a.likes > b.likes) {
            return -1
        }

        return 0
    }

    const fetchBlogs = async () => {
        const blogs = await blogService.getAll()
        blogs.sort(compare)
        setBlogs(blogs)
    }

    useEffect(() => {
        fetchBlogs()
    }, [])

    useEffect(() => {
        const loggedUser = window.localStorage.getItem('loggedUser')
        if (loggedUser) {
            const user = JSON.parse(loggedUser)
            setUser(user)
            blogService.setToken(user.token)
        }
    }, [])

    const handleLogin = async (event) => {
        event.preventDefault()

        try {
            const user = await loginService.login({
                username, password,
            })
            window.localStorage.setItem('loggedUser', JSON.stringify(user))
            setUser(user)
            setUsername('')
            setPassword('')
            blogService.setToken(user.token)
        } catch (exception) {
            handleMessage({
                msg: 'Wrong credentials',
                type: 'error'
            })
        }
    }

    const handleMessage = (msg) => {
        setMessage(msg)
        setTimeout(() => {
            setMessage({
                msg: null,
                type: null
            })
        }, 5000)
    }

    const addblog = async (blogObject) => {
        try {
            blogFormRef.current.toggleVisibility()
            const createdBlog = await blogService.create(blogObject)
            await fetchBlogs()
        } catch (exception) {
            handleMessage(errorMessage(exception))
        }
    }

    const handleLike = async (blogObject) => {
        try {
            await blogService.update(blogObject)
            fetchBlogs()
        } catch (exception) {
            console.log(exception)
            handleMessage(errorMessage(exception))
        }
    }

    const handleDelete = async (blogObject) => {
        try {
            await blogService.del(blogObject)
            fetchBlogs()
        } catch (exception) {
            console.log(exception)
            handleMessage(errorMessage(exception))
        }
    }

    const handleLogout = (event) => {
        event.preventDefault()

        setUser(null)
        window.localStorage.removeItem('loggedUser')
    }

    const login = () => (
        <div>
            <Notification message={message} />
            <h2>Log in to application</h2>
            <form onSubmit={handleLogin}>
                <div>
                username
                    <input
                        data-testid='username-input'
                        type='text'
                        value={username}
                        name='Username'
                        onChange={({ target }) => setUsername(target.value)}
                    />
                </div>
                <div>
                password
                    <input
                        data-testid='password-input'
                        type='password'
                        value={password}
                        name='Password'
                        onChange={({ target }) => setPassword(target.value)}
                    />
                </div>
                <button type='submit'>login</button>
            </form>
        </div>
    )

    const blogsList = () => (
        <>
            <Togglable buttonLabel='create new blog' ref={blogFormRef}>
                <AddNew createBlog={addblog} createMessage={handleMessage} />
            </Togglable>
            <div>
                <h2>blogs</h2>
                {blogs.map(blog =>
                    <Blog key={blog.id} blog={blog} addLike={handleLike} deleteBlog={handleDelete}/>
                )}
            </div>
        </>
    )


    return (
        <div>
            {user === null
                ? login()
                : <>
                    <Notification message={message} />
                    <p>{user.name} logged in <button onClick={handleLogout}>logOut</button></p>
                    {blogsList()}
                </>
            }
        </div>
    )
}

export default App