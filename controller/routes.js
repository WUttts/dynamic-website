
/* routes.js */

import { Router } from 'https://deno.land/x/oak@v6.5.1/mod.ts'
import { Handlebars } from 'https://deno.land/x/handlebars/mod.ts'
import { saveFileInfo, getFileInfo, deleteFileInfo, getByTag } from '../modules/photos.js'
import { saveFile } from '../public/util.js'
// import { upload } from 'https://cdn.deno.land/oak_upload_middleware/versions/v2/raw/mod.ts'
// import { parse } from 'https://deno.land/std/flags/mod.ts'

import { login, register } from '../modules/accounts.js'

const handle = new Handlebars({ defaultLayout: '' })

const router = new Router()

// the routes defined here
router.get('/', async context => {
	const authorised = context.cookies.get('authorised')
	const data = { authorised }
	const body = await handle.renderView('home', data)
	context.response.body = body
})

router.get('/login', async context => {
	const body = await handle.renderView('login')
	context.response.body = body
})

router.get('/register', async context => {
	const body = await handle.renderView('register')
	context.response.body = body
})

router.post('/register', async context => {
	console.log('POST /register')
	const body = context.request.body({ type: 'form' })
	const value = await body.value
	const obj = Object.fromEntries(value)
	console.log(obj)
	await register(obj)
	context.response.redirect('/login')
})

router.get('/logout', context => {
	// context.cookies.set('authorised', null) // this does the same
	context.cookies.delete('authorised')
	context.response.redirect('/')
})

router.post('/login', async context => {
	console.log('POST /login')
	const body = context.request.body({ type: 'form' })
	const value = await body.value
	const obj = Object.fromEntries(value)
	console.log(obj)
	try {
		const username = await login(obj)
		context.cookies.set('authorised', username)
		context.response.redirect('/foo')
	} catch (err) {
		console.log(err)
		context.response.redirect('/login')
	}
})

router.get('/foo', async context => {
	const authorised = context.cookies.get('authorised')
	if (authorised === undefined) context.response.redirect('/')
	const data = { authorised }
	const body = await handle.renderView('foo', data)
	context.response.body = body
})

router.post('/api/files', async context => {
	console.log('POST /api/files')
	try {
		const token = context.request.headers.get('Authorization')
		console.log(`auth: ${token}`)
		const body = await context.request.body()
		const data = await body.value
		console.log(data)
		const filename = saveFile(data.base64, data.user)
		await saveFileInfo(data.tag, data.category, filename, data.user)
		context.response.status = 201
		context.response.body = JSON.stringify(
			{
				data: {
					message: 'file uploaded'
				}
			}
		)
	} catch (err) {
		context.response.status = 400
		context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: 'a problem occurred',
						detail: err.message
					}
				]
			}
		)
	}
})


router.get('/photos', async context => {
	const authorised = context.cookies.get('authorised')
	if (authorised === undefined) context.response.redirect('/')
	const data = { authorised }
	const body = await handle.renderView('photos', data)
	context.response.body = body
})

router.get('/api/photos', async context => {
	const authorised = context.cookies.get('authorised')
	if (authorised === undefined) context.response.redirect('/')
	const data = await getFileInfo()
	console.log(data);
	context.response.headers.set('Content-Type', 'application/vnd.api+json')
	context.response.headers.set('charset', 'utf-8')
	context.response.body = JSON.stringify({
		data: {
			data
		}
	})
})

router.get('/api/search/:value', async ({ params, response }) => {
	console.log(params.value);
	try {
		const data = await getByTag(params.value)
		response.status = 200
		response.body = JSON.stringify(
			{
				data: {
					data
				}
			}
		)
	} catch (err) {
		response.status = 400
		response.body = JSON.stringify(
			{
				errors: [
					{
						title: 'a problem occurred',
						detail: err.message
					}
				]
			}
		)
	}
})

router.delete('/api/photos/:id', async ({ params, response }) => {
	console.log('DELETE /api/photos')
	console.log(params.id);
	try {
		const data = await deleteFileInfo(params.id)
		response.status = 200
		response.body = JSON.stringify(
			{
				data: {
					data
				}
			}
		)
	} catch (err) {
		response.status = 400
		response.body = JSON.stringify(
			{
				errors: [
					{
						title: 'a problem occurred',
						detail: err.message
					}
				]
			}
		)
	}
})

router.get('/api/photos/download/:filename', async ({ params, response }) => {
	console.log('download /api/photos')
	console.log(params.filename);
	try {
		const img = await Deno.readTextFile(`./spa/uploads/${params.filename}`);
		console.log(text);
		response.status = 200
		response.headers = {
			'Content-Type': 'application/octet-stream'
		}
		response.body = img
	} catch (err) {
		response.status = 400
		response.body = JSON.stringify(
			{
				errors: [
					{
						title: 'a problem occurred',
						detail: err.message
					}
				]
			}
		)
	}
})

export default router
