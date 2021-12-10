
/* stats.js */

// $ > ~/stats.js
// nano ~/stats.js
// $ deno run --allow-read ../stats.js

import { parse } from 'https://deno.land/std@0.82.0/encoding/csv.ts'
import { blue, green, red, yellow } from 'https://deno.land/std/fmt/colors.ts'
const threshold = 3000; // flags up 3K changes
const barChar = '#'
const records = await parse(await Deno.readTextFile('../log.csv'))

let current = 0
let count = 0
const first = records[0]
const last = records[records.length - 1]
console.log() //insert a blank line for readability
for(const record of records) {
  const [timestamp, date, time, size] = record
  if(current < 1000) current = size // sets the base size of the code
  if(size !== current) {
    const diff = Math.abs(size - current)
    if(diff > 9000 && size > current) { // perhaps the box was reset?
      console.log(blue(`BOX RESET: ${date2ukdate(date)} ${time.substring(0, 5)}`))
      console.log()
    }
    if(diff > threshold && diff < 9000) { // ignore if project reset
      const hrMin = time.substring(0, 5) // remove the seconds
      const type = size > current ? 'ADDED' : 'DELETED'
      const barLen = Math.ceil(diff / 500) // one block per 500 byte change
      const msg = `${date2ukdate(date)} at ${hrMin} ${(diff/1000).toFixed(1)} Kb ${type}`
      if(type === 'ADDED') {
        console.log(green(msg))
      } else {
        console.log(red(msg))
      }
      for(let i = 0; i < barLen ; i++) await Deno.stdout.write(new TextEncoder().encode(barChar))
      console.log()
      console.log()
    }
    count++
    current = size
  }
}

console.log() //insert a blank line for readability
console.log('STUDENT ENGAGEMENT SUMMARY')
console.log(`assignment started: ${date2ukdate(first[1])}`)
console.log(`last edit made on ${date2ukdate(last[1])} at ${last[2]}`)
console.log(`Codio box open for ${Math.ceil(records.length * 5 / 60)} hrs`)
console.log(`student actively engaged on assignment for ${(count * 5 / 60).toFixed(1)} hrs`)
console.log(`engagement score (higher is better): ${Math.floor(count / records.length * 100)}`)

function date2ukdate(date) {
  const [month, day, year] = date.split('/')
  return `${day}/${month}/${year}`
}
