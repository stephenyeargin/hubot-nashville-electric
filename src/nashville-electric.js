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
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = (robot) => {
  // Get outage counts
  robot.respond(/(power|power outages?|nes)$/i, (msg) => {
    const requestHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      referer: 'https://www.nespower.com/outages/',
    };
    const baseUrl = 'https://utilisocial.io/datacapable/v2/p/NES/map';

    const fetchJson = (feed) => new Promise((resolve, reject) => {
      msg.http(`${baseUrl}/${feed}`)
        .timeout(3000)
        .headers(requestHeaders)
        .get()((err, _res, body) => {
          if (err) {
            reject(err);
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (err2) {
            robot.logger.debug(body);
            const parseError = err2;
            parseError.isParseError = true;
            reject(parseError);
          }
        });
    });

    Promise.all([fetchJson('events'), fetchJson('stats')])
      .then(([events, stats]) => {
        const affectedCustomers = events
          .reduce((total, event) => total + (event.numPeople || 0), 0);
        const lastUpdateMs = parseInt(stats.lastUpdatedTime, 10);
        const lastUpdate = dayjs(lastUpdateMs).tz('America/Chicago');
        const fallback = `⚡️ NES reports ${affectedCustomers.toLocaleString('en-US')} customers without power as of ${lastUpdate.format('LLLL')}`;
        if (/slack/i.test(robot.adapterName)) {
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
                ts: lastUpdate.unix(),
                fields: [
                  { title: 'Affected Customers', value: affectedCustomers.toLocaleString('en-US'), short: true },
                  { title: 'Last Update', value: lastUpdate.format('LLL'), short: true },
                ],
              },
            ],
          });
          return;
        }
        msg.send(fallback);
      })
      .catch((err) => {
        robot.logger.error(err);
        msg.send(`Unable to retrieve outage information right now.${err.isParseError ? ' [Error parsing server response]' : ''}`);
      });
  });

  // NES Map
  robot.respond(/nes (outage )?map/i, (msg) => {
    const fallback = 'https://www.nespower.com/outages/';
    if (/slack/i.test(robot.adapterName)) {
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
