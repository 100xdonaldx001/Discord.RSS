const feedServices = require('../../../services/feed.js')

/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function getFailRecords (req, res, next) {
  const guildID = req.params.guildID
  try {
    const feeds = await feedServices.getFeedsOfGuild(guildID)
    const urls = new Set()
    for (const feed of feeds) {
      urls.add(feed.url)
    }
    const records = Array.from(urls).map(url => feedServices.getFailRecord(url))
    res.json(await Promise.all(records))
  } catch (err) {
    next(err)
  }
}

module.exports = getFailRecords
