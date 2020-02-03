const authenticated = require('./authenticated.js')
const config = require('./config.js')
const feeds = require('./feeds/index.js')  
const guilds = require('./guilds/index.js')
const users = require('./users/index.js')

module.exports = {
  guilds,
  feeds,
  users,
  authenticated,
  config
}
