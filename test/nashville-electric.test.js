/* global describe beforeEach afterEach it */
/* eslint-disable func-names */
const Helper = require('hubot-test-helper');
const chai = require('chai');
const nock = require('nock');

const {
  expect,
} = chai;

const helper = new Helper('../src/nashville-electric.js');

describe('nashville-electric', () => {
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
            ['hubot', '⚡️ NES reports 2,520 customers without power as of Friday, March 26, 2021 9:55 AM'],
          ]);
          done();
        } catch (err) {
          done(err);
        }
      },
      100,
    );
  });

  it('returns an error when it cannot connect', function (done) {
    nock('https://www.nespower.com')
      .get('/outagemap/getall')
      .replyWithError('Cannot connect to server');

    const selfRoom = this.room;
    selfRoom.user.say('alice', '@hubot nes');
    setTimeout(
      () => {
        try {
          expect(selfRoom.messages).to.eql([
            ['alice', '@hubot nes'],
            ['hubot', 'Unable to retrieve outage information right now.'],
          ]);
          done();
        } catch (err) {
          done(err);
        }
      },
      100,
    );
  });

  it('returns a server error', function (done) {
    nock('https://www.nespower.com')
      .get('/outagemap/getall')
      .reply(500, 'Internal server error');

    const selfRoom = this.room;
    selfRoom.user.say('alice', '@hubot nes');
    setTimeout(
      () => {
        try {
          expect(selfRoom.messages).to.eql([
            ['alice', '@hubot nes'],
            ['hubot', 'Unable to retrieve outage information right now. [Error parsing server response]'],
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
            ['hubot', 'https://www.nespower.com/outages/'],
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
