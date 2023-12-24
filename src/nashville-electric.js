// Description:
//   Get reported power outages in Nashville.
//
// Configuration:
//   None
//
// Commands:
//   hubot nes - Get count of customers affected by power outage
//   hubot nes outage map - Get a link to the outage map

module.exports = (robot) => {
  // Get outage counts
  robot.respond(/(power|power outages?|nes)$/i, (msg) => {
    const userAgentString = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const requestHeaders = {
      'User-Agent': userAgentString,
      referer: 'https://www.nespower.com/outages/',
    };
    const url = 'https://www.nespower.com/outagemap/getall';
    msg.http(url)
      .timeout(3000)
      .headers(requestHeaders)
      .get()((err, _res, body) => {
        let result;
        if (err) {
          robot.logger.error(err);
          msg.send('Unable to retrieve outage information right now.');
          return;
        }
        try {
          result = JSON.parse(body);
        } catch (err2) {
          robot.logger.debug(body);
          robot.logger.error(err2);
          msg.send(`Unable to retrieve outage information right now. (${body.substring(0, 100)})`);
          return;
        }
        let affectedCustomers = 0;
        result.MapList.forEach((block) => {
          affectedCustomers += block.CustAffected;
        });
        const lastUpdate = result.UpdateDateTimeFormatted;
        msg.send(`⚡️ NES reports ${affectedCustomers.toLocaleString('en-US')} customers without power as of ${lastUpdate}`);
      });
  });

  // NES Map
  robot.respond(/nes (outage )?map/i, (msg) => {
    msg.send('https://www.nespower.com/outages/');
  });
};
