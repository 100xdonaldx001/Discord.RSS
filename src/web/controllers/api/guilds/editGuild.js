const guildServices = require('../../../services/guild.js')
const keys = [
  'alert',
  'dateFormat',
  'dateLanguage',
  'timezone',
  'prefix',
  'locale'
]

/**
 * @typedef {Object} GuildUpdate
 * @property {string} prefix
 * @property {string} dateFormat
 * @property {string} dateLanguage
 * @property {string} timezone
 * @property {string} locale
 * @property {string[]} alert
 */

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function editGuild (req, res, next) {
  const guild = req.guild
  /** @type {GuildUpdate} */
  const body = req.body
  const toUpdate = {}
  for (const key of keys) {
    const userValue = body[key]
    if (userValue === '') {
      toUpdate[key] = undefined
    } else if (userValue !== undefined) {
      toUpdate[key] = userValue
    }
  }
  try {
    const updated = await guildServices
      .updateProfile(guild.id, guild.name, toUpdate)
    res.json(updated)
  } catch (err) {
    next(err)
  }
}

module.exports = editGuild
