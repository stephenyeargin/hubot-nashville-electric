// Description:
//   Get reported power outages in Nashville.
//
// Configuration:
//   None
//
// Commands:
//   hubot nes - Get count of customers affected by power outage
//   hubot nes outage map - Get a link to the outage map

const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');

dayjs.extend(localizedFormat);

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
          msg.send('Unable to retrieve outage information right now. [Error parsing server response]');
          return;
        }
        let affectedCustomers = 0;
        result.MapList.forEach((block) => {
          affectedCustomers += block.CustAffected;
        });
        const lastUpdate = result.UpdateDateTimeFormatted;
        // example result.UpdateDateTime: \/Date(1616770502877)\/
        // extract only the timestamp
        const lastUpdateUnix = result.UpdateDateTime.replace(/\/Date\((\d+)\)\//, '$1');
        const fallback = `⚡️ NES reports ${affectedCustomers.toLocaleString('en-US')} customers without power as of ${dayjs(lastUpdate).format('LLLL')}`;
        if (/slack/.test(robot.adapterName)) {
          let color;
          switch (true) {
            case affectedCustomers === 0:
              color = 'good';
              break;
            case affectedCustomers < 100:
              color = 'warning';
              break;
            default:
              color = 'danger';
              break;
          }

          msg.send({
            attachments: [
              {
                fallback,
                title: 'Power Outages',
                title_link: 'https://www.nespower.com/outages/',
                color,
                author_name: 'Nashville Electric Service',
                author_icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Nashville_Electric_Service.svg/190px-Nashville_Electric_Service.svg.png?20210429001318',
                author_link: 'https://www.nespower.com',
                ts: dayjs(parseInt(lastUpdateUnix, 10)).unix(),
                fields: [
                  { title: 'Affected Customers', value: affectedCustomers.toLocaleString('en-US'), short: true },
                  { title: 'Last Update', value: dayjs(lastUpdate).format('LLL'), short: true },
                ],
              },
            ],
          });
          return;
        }
        msg.send(fallback);
      });
  });

  // NES Map
  robot.respond(/nes (outage )?map/i, (msg) => {
    const fallback = 'https://www.nespower.com/outages/';
    if (/slack/.test(robot.adapterName)) {
      msg.send({
        attachments: [
          {
            fallback,
            title: 'NES Power Outage Map',
            title_link: 'https://www.nespower.com/outages/',
            color: '#256ab4',
            author_name: 'Nashville Electric Service',
            author_icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Nashville_Electric_Service.svg/190px-Nashville_Electric_Service.svg.png?20210429001318',
            author_link: 'https://www.nespower.com',
          },
        ],
      });
      return;
    }
    msg.send(fallback);
  });
};
