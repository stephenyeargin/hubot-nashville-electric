/* global describe beforeEach afterEach it */
/* eslint-disable func-names */
const Helper = require('hubot-test-helper');
const chai = require('chai');
const nock = require('nock');

const {
  expect,
} = chai;

const helper = new Helper([
  './adapters/slack.js',
  '../src/nashville-electric.js',
]);

describe('nashville-electric slack', () => {
  beforeEach(function () {
    nock.disableNetConnect();
    this.room = helper.createRoom();
  });

  afterEach(function () {
    nock.cleanAll();
    this.room.destroy();
  });

  it('gets current outage count', function (done) {
    nock('https://www.nespower.com')
      .get('/outagemap/getall')
      .replyWithFile(200, `${__dirname}/fixtures/getall.json`);

    const selfRoom = this.room;
    selfRoom.user.say('alice', '@hubot nes');
    setTimeout(
      () => {
        try {
          expect(selfRoom.messages).to.eql([
            ['alice', '@hubot nes'],
            [
              'hubot',
              {
                attachments: [
                  {
                    author_icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Nashville_Electric_Service.svg/190px-Nashville_Electric_Service.svg.png?20210429001318',
                    author_link: 'https://www.nespower.com',
                    author_name: 'Nashville Electric Service',
                    color: 'danger',
                    fallback: '⚡️ NES reports 2,520 customers without power as of Friday, March 26, 2021 9:55 AM',
                    fields: [
                      {
                        short: true,
                        title: 'Affected Customers',
                        value: '2,520',
                      },
                      {
                        short: true,
                        title: 'Last Update',
                        value: 'March 26, 2021 9:55 AM',
                      },
                    ],
                    title: 'Power Outages',
                    title_link: 'https://www.nespower.com/outages/',
                    ts: 1616770502,
                  },
                ],
              },
            ],
          ]);
          done();
        } catch (err) {
          done(err);
        }
      },
      100,
    );
  });

  it('gets current outage count < 100', function (done) {
    nock('https://www.nespower.com')
      .get('/outagemap/getall')
      .replyWithFile(200, `${__dirname}/fixtures/getall-less-than-100.json`);

    const selfRoom = this.room;
    selfRoom.user.say('alice', '@hubot nes');
    setTimeout(
      () => {
        try {
          expect(selfRoom.messages).to.eql([
            ['alice', '@hubot nes'],
            [
              'hubot',
              {
                attachments: [
                  {
                    author_icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Nashville_Electric_Service.svg/190px-Nashville_Electric_Service.svg.png?20210429001318',
                    author_link: 'https://www.nespower.com',
                    author_name: 'Nashville Electric Service',
                    color: 'warning',
                    fallback: '⚡️ NES reports 12 customers without power as of Friday, March 26, 2021 9:55 AM',
                    fields: [
                      {
                        short: true,
                        title: 'Affected Customers',
                        value: '12',
                      },
                      {
                        short: true,
                        title: 'Last Update',
                        value: 'March 26, 2021 9:55 AM',
                      },
                    ],
                    title: 'Power Outages',
                    title_link: 'https://www.nespower.com/outages/',
                    ts: 1616770502,
                  },
                ],
              },
            ],
          ]);
          done();
        } catch (err) {
          done(err);
        }
      },
      100,
    );
  });

  it('gets current outage count zero', function (done) {
    nock('https://www.nespower.com')
      .get('/outagemap/getall')
      .replyWithFile(200, `${__dirname}/fixtures/getall-zero.json`);

    const selfRoom = this.room;
    selfRoom.user.say('alice', '@hubot nes');
    setTimeout(
      () => {
        try {
          expect(selfRoom.messages).to.eql([
            ['alice', '@hubot nes'],
            [
              'hubot',
              {
                attachments: [
                  {
                    author_icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Nashville_Electric_Service.svg/190px-Nashville_Electric_Service.svg.png?20210429001318',
                    author_link: 'https://www.nespower.com',
                    author_name: 'Nashville Electric Service',
                    color: 'good',
                    fallback: '⚡️ NES reports 0 customers without power as of Friday, March 26, 2021 9:55 AM',
                    fields: [
                      {
                        short: true,
                        title: 'Affected Customers',
                        value: '0',
                      },
                      {
                        short: true,
                        title: 'Last Update',
                        value: 'March 26, 2021 9:55 AM',
                      },
                    ],
                    title: 'Power Outages',
                    title_link: 'https://www.nespower.com/outages/',
                    ts: 1616770502,
                  },
                ],
              },
            ],
          ]);
          done();
        } catch (err) {
          done(err);
        }
      },
      100,
    );
  });

  it('gets the outage map', function (done) {
    const selfRoom = this.room;
    selfRoom.user.say('alice', '@hubot nes outage map');
    setTimeout(
      () => {
        try {
          expect(selfRoom.messages).to.eql([
            ['alice', '@hubot nes outage map'],
            [
              'hubot',
              {
                attachments: [
                  {
                    author_icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Nashville_Electric_Service.svg/190px-Nashville_Electric_Service.svg.png?20210429001318',
                    author_name: 'Nashville Electric Service',
                    author_link: 'https://www.nespower.com',
                    color: '#256ab4',
                    fallback: 'https://www.nespower.com/outages/',
                    title: 'NES Power Outage Map',
                    title_link: 'https://www.nespower.com/outages/',
                  },
                ],
              },
            ],
          ]);
          done();
        } catch (err) {
          done(err);
        }
      },
      100,
    );
  });
});
