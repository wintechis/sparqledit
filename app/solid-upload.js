// ---------------------------------------------------------------
const credentials = {
  idp: 'https://solidcommunity.net',
  username: process.env.SOLID_USERNAME,                  
  password: process.env.SOLID_PASSWORD
}
const remote = 'https://smeckler.solidcommunity.net/private/apps/sparqledit/'
//const remote = 'https://solid.ti.rw.fau.de/private/sparqledit/app/'
const local  = 'file://' + process.cwd() + '/build/'
// ---------------------------------------------------------------

const auth = require('solid-auth-cli')
const FileClient = require('solid-file-client')
const fc = new FileClient(auth)

async function run(){
  try {
    await auth.login(credentials)
    console.log('login successful')
    // delete if existing
    if(await fc.itemExists(remote)) {
      await fc.deleteFolder(remote)
    }
    // create folder + upload
    await fc.copyFolder(local, remote)
  }
  catch(err) {
    console.log(err)
  }
  console.log('upload successful')
}
run()