import { Base64 } from 'https://deno.land/x/bb64/mod.ts'
/* util.js */

export function file2DataURI(file) {
  return new Promise((resolve, reject) => {
		try {
			const reader = new FileReader()
			reader.onload = () => {
				resolve(reader.result)
			}
			reader.readAsDataURL(file)
		} catch(err) {
			reject(err)
		}
  })
}

// checks if file exists
async function fileExists(path) {
	try {
	  const stats = await Deno.lstat(path)
	  return stats && stats.isFile
	} catch(e) {
	  if (e && e instanceof Deno.errors.NotFound) {
		return false
	  } else {
		throw e
	  }
	}
  }
  
  export function saveFile(base64String, username) {
	  console.log('save file')
	  const [ metadata, base64Image ] = base64String.split(';base64,')
	  console.log(metadata)
	  const extension = metadata.split('/').pop()
	  console.log(extension)
	  const filename = `${username}-${Date.now()}.${extension}`
	  console.log(filename)
	  Base64.fromBase64String(base64Image).toFile(`./public/uploads/${filename}`)
	  console.log('file saved')
	  return filename
  }