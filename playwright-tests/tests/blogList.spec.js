const { test, describe, beforeEach, expect } = require('@playwright/test')
const { loginWith, createBlog, addLike } = require('./helper')

describe('Blog app', () => {
    beforeEach(async ({ page, request }) => {
        await request.post('/api/testing/reset')
        await request.post('/api/users', {
            data: {
                name: 'test1',
                username: 'test1',
                password: 't3$t1'
            }
        })

        await page.goto('/')
    })

    test('login form is shown', async ({ page }) => {
        const locator = await page.getByRole('heading', { name: 'Log in to application' })
        await expect(locator).toBeVisible()
    })

    describe('Login', () => {
        test('succeeds with correct credentials', async ({ page }) => {
            await loginWith(page, 'test1', 't3$t1')

            page.pause()

            await expect(page.getByText('test1 logged in')).toBeVisible()
        })

        test('fails with wrong credentials', async ({ page }) => {
            await loginWith(page, 'wrong', 'wrong')

            await expect(page.getByText('Wrong credentials')).toBeVisible()
        })

        describe('When logged in', () => {
            beforeEach(async ({ page }) => {
                await loginWith(page, 'test1', 't3$t1')
            })
    
            test('a new blog can be created', async ({ page }) => {
                await createBlog(
                    page,
                    'test blog',
                    'test author',
                    'test url'
                )
    
                await expect(page.getByText('a new blog test blog added')).toBeVisible()
            })

            describe('When there\'s a blog', () => {
                beforeEach(async ({ page }) => {
                    await createBlog(
                        page,
                        'blog1',
                        'author1',
                        'url1'
                    )
                })

                test('a blog can be liked', async ({ page }) => {
                    await page.getByRole('button', { name: 'view' }).click()

                    await page.getByRole('button', { name: 'like' }).click()

                    await expect(page.getByText('likes 1')).toBeVisible()
                })

                test('a blog can be deleted', async ({ page }) => {
                    page.on('dialog', async (dialog) => {
                        console.log(dialog.message())
                        expect(dialog.message()).toEqual(
                            'Are you sure you wanna delete blog1??'
                        )
                        await dialog.accept()
                    })
                    await page.getByRole('button', { name: 'view' }).click()

                    await page.getByRole('button', { name: 'delete' }).click()

                    await expect(page.getByText('blog1 author1')).not.toBeAttached()
                })

                describe('When changing user', () => {
                    beforeEach(async ({ page, request }) => {
                        await request.post('/api/users', {
                            data: {
                                name: 'test2',
                                username: 'test2',
                                password: 't3$t2'
                            }
                        })

                        await page.getByRole('button', { name: 'logOut' }).click()

                        await loginWith(page, 'test2', 't3$t2')
                    })

                    test('Unauthorized users can\'t see delete button', async ({ page }) => {
                        await page.getByRole('button', { name: 'view' }).click()

                        await expect(page.getByRole('button', { name: 'delete' })).not.toBeAttached()
                    })
                })
            })

            describe('When there are more blogs', () => {
                beforeEach(async ({ page }) => {
                    let i = 1
                    while (i <= 3) {
                        await createBlog(
                            page,
                            `blog ${i}`,
                            `author ${i}`,
                            `url ${i}`
                        )
                        i++
                    }
                    for (let j = 1; j <= 3; j++) {
                        await addLike(page, `blog ${j} author ${j}`, j)
                    }
                    //the likes corresponds to the blog number
                })

                test('blogs are sorted by likes', async ({ page }) => {
                    await expect(page.locator('div').filter({ hasText: /^blog \d author \d view$/ }))
                        .toHaveText([
                            'blog 3 author 3 view',
                            'blog 2 author 2 view',
                            'blog 1 author 1 view'
                        ])

                    await expect(page.locator('div').filter({ hasText: /^blog \d author \d view$/ }))
                        .not
                        .toHaveText([
                            'blog 1 author 1 view',
                            'blog 3 author 3 view',
                            'blog 2 author 2 view'
                        ])
                })
            })
        })
    })
})