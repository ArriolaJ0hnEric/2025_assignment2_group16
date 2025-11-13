import { render, screen } from '@testing-library/react'
import AddNew from './AddNew'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

describe('<AddNew />', () => {
    test('event handler is called correctly when form is submitted', async () => {
        const createBlog = vi.fn()
        const createMessage = vi.fn()

        const { container } = render(<AddNew
            createBlog={createBlog}
            createMessage={createMessage} />)

        const user = userEvent.setup()
        const authorInput = container.querySelector('#author-input')
        const titleInput = container.querySelector('#title-input')
        const urlInput = container.querySelector('#url-input')
        const createButton = container.querySelector('#create-button')

        await user.type(authorInput, 'test author')
        await user.type(titleInput, 'test title')
        await user.type(urlInput, 'test url')
        await user.click(createButton)

        expect(createBlog.mock.calls).toHaveLength(1)
        expect(createMessage.mock.calls).toHaveLength(1)
    })
})