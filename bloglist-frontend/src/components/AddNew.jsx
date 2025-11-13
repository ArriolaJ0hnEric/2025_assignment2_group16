import { useState } from 'react'

const AddNew = ({ createBlog, createMessage }) => {
    const [title, setTitle] = useState('')
    const [author, setAuthor] = useState('')
    const [url, setUrl] = useState('')

    const handleSubmit = async (event) => {
        event.preventDefault()

        if(!title || !author || !url) {
            createMessage({
                msg: 'a field is blank, please compile it',
                type: 'error'
            })
        } else {
            await createBlog({
                author: author,
                title: title,
                url: url
            })
            setTitle('')
            setAuthor('')
            setUrl('')
            createMessage({
                msg: `a new blog ${title} added`,
                type: 'blogAdded'
            })
        }
    }

    return(
        <div>
            <h2>create new</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    title:
                    <input
                        data-testid='title-input'
                        id='title-input'
                        type="text"
                        value={title}
                        name='Title'
                        onChange={({ target }) => setTitle(target.value)}
                    />
                </div>
                <div>
                    author:
                    <input
                        data-testid='author-input'
                        id='author-input'
                        type="text"
                        value={author}
                        name='Author'
                        onChange={({ target }) => setAuthor(target.value)}
                    />
                </div>
                <div>
                    url:
                    <input
                        data-testid='url-input'
                        id='url-input'
                        type="text"
                        value={url}
                        name='Url'
                        onChange={({ target }) => setUrl(target.value)}
                    />
                </div>
                <button id='create-button' type="submit">create</button>
            </form>
        </div>
    )
}

export default AddNew