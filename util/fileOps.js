const storage = require('./storage.js')
const currentGuilds = storage.currentGuilds
const models = storage.models

exports.updateFile = (guildRss, shardingManager, callback) => {
  if (typeof guildRss !== 'object') return console.log(`Warning: Unable to updateFile due to non-object parameter (${guildRss}) for guildRss`)
  models.GuildRss().update({ id: guildRss.id }, guildRss, { overwrite: true, upsert: true, strict: true }, (err, res) => {
    if (err) {
      if (typeof callback === 'function') return callback(err)
      return console.log(`Guilds Info: Unable to update profile ${guildRss.id}`, err.message || err)
    }
    if (typeof callback === 'function') callback()
    if (!process.send) currentGuilds.set(guildRss.id, guildRss) // Only do this for non-sharded instances since this function may not be called by a process that has this guild

    // For sharded instances
    if (shardingManager) shardingManager.broadcast({ type: 'updateGuild', guildRss: guildRss })
    else if (process.send) process.send({ type: 'updateGuild', guildRss: guildRss }) // If this is a child process
  })
}

exports.deleteGuild = (guildId, shardingManager, callback) => {
  const guildRss = currentGuilds.get(guildId)
  models.GuildRss().find({ id: guildId }).remove((err, res) => {
    if (err) return callback(err)
    currentGuilds.delete(guildId)
    if (shardingManager) shardingManager.broadcast({type: 'deleteGuild', guildId: guildId})
    else if (process.send) process.send({type: 'deleteGuild', guildId: guildId}) // If this is a child process
    if (guildRss) models.GuildRssBackup().update({ id: guildId }, guildRss, { overwrite: true, upsert: true, strict: true }, (err, res) => callback(err))
  })
}

exports.isEmptySources = (guildRss, shardingManager) => { // Used on the beginning of each cycle to check for empty sources per guild
  if (guildRss.sources && Object.keys(guildRss.sources).length > 0) return false
  if (!guildRss.timezone && !guildRss.dateFormat && !guildRss.dateLanguage) { // Delete only if server-specific special settings are not found
    exports.deleteGuild(guildRss.id, shardingManager, err => {
      if (err) return console.log(`Guild Warning: Error while deleting guild ${guildRss.id} due to 0 sources:`, err.message || err)
      console.log(`RSS Info: (${guildRss.id}) => 0 sources found with no custom settings, deleting.`)
    })
  } else console.log(`RSS Info: (${guildRss.id}) => 0 sources found, skipping.`)
  return true
}

exports.restoreBackup = (guildId, shardingManager, callback) => {
  models.GuildRssBackup().find({ id: guildId }, (err, docs) => {
    if (err) return callback(err)
    if (docs.length === 0) return
    exports.updateFile(docs[0], shardingManager, err => {
      callback(err)
      if (err) return
      models.GuildRssBackup().find({ id: guildId }).remove((err, res) => {
        if (err) console.log(`Guild Warning: Unable to remove backup for guild ${guildId} after restore:`, err.message || err)
      })
    })
  })
}
