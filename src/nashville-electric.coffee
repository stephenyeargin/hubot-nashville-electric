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

  # NES Twitter
  robot.respond /nes twitter/i, (msg) ->
    return unless process.env.HUBOT_TWITTER_CONSUMER_KEY && process.env.HUBOT_TWITTER_CONSUMER_SECRET
    Twitter = require 'twitter'
    twitter_client = new Twitter
      consumer_key: process.env.HUBOT_TWITTER_CONSUMER_KEY
      consumer_secret: process.env.HUBOT_TWITTER_CONSUMER_SECRET
      access_token_key: process.env.HUBOT_TWITTER_ACCESS_TOKEN
      access_token_secret: process.env.HUBOT_TWITTER_ACCESS_TOKEN_SECRET
    params =
      screen_name: 'NESpower'
      tweet_mode: 'extended'
      exclude_replies: true
      exclude_retweets: true
    twitter_client.get 'statuses/user_timeline', params, (error, tweets, response) ->
      if error || tweets.length == 0
        robot.logger.error error
        msg.send "Failed to retrieve tweets"
        return
      robot.logger.debug tweets
      tweet = tweets[0]
      msg.send "<#{tweet.user.screen_name}> #{tweet.full_text} - #{tweet.created_at}"
