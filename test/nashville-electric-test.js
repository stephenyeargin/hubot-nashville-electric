const {
  describe, it,
} = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const nock = require('nock');
const { createTestBot } = require('./common/TestBot');

describe('nashville-electric', () => {
  it('gets current outage count', async () => {
    const ctx = await createTestBot();
    try {
      nock('https://www.nespower.com')
        .get('/outagemap/getall')
        .replyWithFile(200, path.join(__dirname, 'fixtures/getall.json'));

      const response = await ctx.sendAndWaitForResponse('hubot nes');
      assert.equal(response, '⚡️ NES reports 2,520 customers without power as of Friday, March 26, 2021 9:55 AM');
    } finally {
      ctx.shutdown();
    }
  });

  it('returns an error when it cannot connect', async () => {
    const ctx = await createTestBot();
    try {
      nock('https://www.nespower.com')
        .get('/outagemap/getall')
        .replyWithError('Cannot connect to server');

      const response = await ctx.sendAndWaitForResponse('hubot nes');
      assert.equal(response, 'Unable to retrieve outage information right now.');
    } finally {
      ctx.shutdown();
    }
  });

  it('returns a server error', async () => {
    const ctx = await createTestBot();
    try {
      nock('https://www.nespower.com')
        .get('/outagemap/getall')
        .reply(500, 'Internal server error');

      const response = await ctx.sendAndWaitForResponse('hubot nes');
      assert.equal(response, 'Unable to retrieve outage information right now. [Error parsing server response]');
    } finally {
      ctx.shutdown();
    }
  });

  it('gets the outage map', async () => {
    const ctx = await createTestBot();
    try {
      const response = await ctx.sendAndWaitForResponse('hubot nes outage map');
      assert.equal(response, 'https://www.nespower.com/outages/');
    } finally {
      ctx.shutdown();
    }
  });
});
