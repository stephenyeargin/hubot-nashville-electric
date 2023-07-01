# Description:
#   Get reported power outages in Nashville.
#
# Configuration:
#   None
#
# Commands:
#   hubot nes - Get count of customers affected by power outage
#   hubot nes outage map - Get a link to the outage map

module.exports = (robot) ->
  # Get outage counts
  robot.respond /(power|power outages?|nes)$/i, (msg) ->
    userAgentString = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
    requestHeaders = {
      'User-Agent': userAgentString,
      referer: 'https://www.nespower.com/outages/'
    }
    url = 'https://www.nespower.com/outagemap/getall'
    msg.http(url)
      .timeout(3000)
      .headers(requestHeaders)
      .get() (err, res, body) ->
        if (err)
          robot.logger.error err
          msg.send 'Unable to retrieve outage information right now.'
          return
        try
          result = JSON.parse(body)
        catch err
          robot.logger.error body
          msg.send "Unable to retrieve outage information right now. (#{body.substring(0,100)})"
          return
        affectedCustomers = 0
        for block in result.MapList
          affectedCustomers += block.CustAffected
        lastUpdate = result.UpdateDateTimeFormatted
        msg.send "⚡️ NES reports #{affectedCustomers.toLocaleString('en-US')} customers without power as of #{lastUpdate}"

  # NES Map
  robot.respond /nes (outage )?map/i, (msg) ->
    msg.send 'https://www.nespower.com/outages/'
