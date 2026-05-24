const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const nock = require('nock');
const { createTestBot } = require('./common/TestBot');

describe('nashville-electric slack', () => {
  it('gets current outage count', async () => {
    const ctx = await createTestBot({ adapterName: 'slack' });
    try {
      nock('https://www.nespower.com')
        .get('/outagemap/getall')
        .replyWithFile(200, path.join(__dirname, 'fixtures/getall.json'));

      const response = await ctx.sendAndWaitForResponse('hubot nes');
      assert.deepEqual(response, {
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
      });
    } finally {
      ctx.shutdown();
    }
  });

  it('gets current outage count < 100', async () => {
    const ctx = await createTestBot({ adapterName: 'slack' });
    try {
      nock('https://www.nespower.com')
        .get('/outagemap/getall')
        .replyWithFile(200, path.join(__dirname, 'fixtures/getall-less-than-100.json'));

      const response = await ctx.sendAndWaitForResponse('hubot nes');
      assert.deepEqual(response, {
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
      });
    } finally {
      ctx.shutdown();
    }
  });

  it('gets current outage count zero', async () => {
    const ctx = await createTestBot({ adapterName: 'slack' });
    try {
      nock('https://www.nespower.com')
        .get('/outagemap/getall')
        .replyWithFile(200, path.join(__dirname, 'fixtures/getall-zero.json'));

      const response = await ctx.sendAndWaitForResponse('hubot nes');
      assert.deepEqual(response, {
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
      });
    } finally {
      ctx.shutdown();
    }
  });

  it('gets the outage map', async () => {
    const ctx = await createTestBot({ adapterName: 'slack' });
    try {
      const response = await ctx.sendAndWaitForResponse('hubot nes outage map');
      assert.deepEqual(response, {
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
      });
    } finally {
      ctx.shutdown();
    }
  });
});
