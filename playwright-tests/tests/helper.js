const loginWith = async (page, username, password) => {
    await page.getByTestId('username-input').fill(username)
    await page.getByTestId('password-input').fill(password)

    await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, title, author, url) => {
    await page.getByRole('button', { name: 'create new blog' }).click()
    
    await page.getByTestId('title-input').fill(title)
    await page.getByTestId('author-input').fill(author)
    await page.getByTestId('url-input').fill(url)
    
    await page.getByRole('button', { name: 'create' }).click()
    await page.getByText(`${title} ${author}`).waitFor()
}

const addLike = async (page, text, index) => {
    await page
        .locator('p')
        .filter({ hasText: `${text} view` })
        .getByRole('button')
        .click()

    for (let i = 0; i < index; i++) {
        await page
            .getByRole('button', { name: 'like' })
            .click()

        await page
            .getByText(`likes ${i + 1}`)
            .waitFor()
    }

    await page
        .getByRole('button', { name: 'hide' })
        .click()
}

export { 
    loginWith,
    createBlog,
    addLike
 }