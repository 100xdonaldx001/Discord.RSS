const requestIp = require('request-ip')
const authServices = require('../services/auth.js')
const routingServices = require('../services/routing.js')

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function authorize (req, res) {
  try {
    const oauthClient = req.app.get('oauth2')
    const session = await authServices.createAuthToken(req.query.code, oauthClient)
    req.session.token = session.token
    req.session.identity = session.identity
    log.web.info(`(${req.session.identity.id}, ${req.session.identity.username}) Logged in`)
    const ip = requestIp.getClientIp(req)
    res.redirect(routingServices.getPath(ip) || '/cp')
  } catch (err) {
    log.web.error(`Failed to authorize Discord`, err)
    res.redirect('/')
  }
}

module.exports = authorize
