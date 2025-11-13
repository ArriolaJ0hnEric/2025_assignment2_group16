import { screen, render } from '@testing-library/react'
import Blog from './Blog'
import { describe, expect, test, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

describe('<Blog />', () => {


    test('initially only show author and blog title', () => {
        const blog = {
            title: 'test',
            author: 'test-author',
            url: 'test-url',
            likes: 0,
            user: {
                username: 'test username',
                name: 'test name',
                id: 'test user id'
            }
        }

        const { container } = render(<Blog blog={blog} />)

        const div = container.querySelector('.blog')
        expect(div).toHaveTextContent(
            `${blog.title} ${blog.author}`
        )
    })

    test('show likes and url after clicking show button', async () => {
        const blog = {
            title: 'test',
            author: 'test-author',
            url: 'test-url',
            likes: 5,
            user: {
                username: 'test username',
                name: 'test name',
                id: 'test user id'
            }
        }

        localStorage.setItem('loggedUser', JSON.stringify(blog.user))

        render(<Blog blog={blog} />)

        const user = userEvent.setup()
        const viewButton = screen.getByText('view')
        await user.click(viewButton)

        const urlElement = await screen.getByText(`${blog.url}`, { exact: false })
        const likesElement = await screen.getByText(`likes ${blog.likes}`, { exact: false })

        expect(urlElement).toBeDefined()
        expect(likesElement).toBeDefined()
    })

    test('addLike is called correctly when button is pressed', async () => {
        const blog = {
            title: 'test',
            author: 'test-author',
            url: 'test-url',
            likes: 5,
            user: {
                username: 'test username',
                name: 'test name',
                id: 'test user id'
            }
        }

        localStorage.setItem('loggedUser', JSON.stringify(blog.user))

        const addLike = vi.fn()
        render(<Blog blog={blog} addLike={addLike} />)

        const user = userEvent.setup()
        const viewButton = screen.getByText('view')
        await user.click(viewButton)

        const likeButton = screen.getByText('like')
        await user.click(likeButton)
        await user.click(likeButton)

        expect(addLike.mock.calls).toHaveLength(2)
    })
})