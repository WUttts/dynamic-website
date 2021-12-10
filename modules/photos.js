import { db } from './db.js'

export async function saveFileInfo(tag,category,filename,username) {
	console.log(tag,username,filename,category);
	const sql = `INSERT INTO photos (tag, category,filename,create_user) VALUES("${tag}", "${category}","${filename}","${username}")`
	console.log(sql)
	await db.query(sql)
	return true
}

export async function getFileInfo(tag,category,filename,username) {
	console.log(tag,username,filename,category);
	const sql = `select * from photos`
	console.log(sql)
	const records = await db.query(sql)
	return records
}

export async function getByTag(tag) {
	let sql =``
	if(tag != 'default'){
		sql = `select * from photos where tag = "${tag}"`
	}else{
		sql =  `select * from photos`
	}

	console.log(sql)
	const records = await db.query(sql)
	return records
}

export async function deleteFileInfo(id) {
	const sql = `delete from photos where id = "${id}"`
	console.log(sql)
	const records = await db.query(sql)
	console.log(records)
	return records
}