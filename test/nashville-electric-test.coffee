Helper = require('hubot-test-helper')
chai = require 'chai'
nock = require 'nock'

expect = chai.expect

helper = new Helper('../src/nashville-electric.coffee')

describe 'nashville-electric', ->
  beforeEach ->
    nock.disableNetConnect()
    @room = helper.createRoom()

  afterEach ->
    nock.cleanAll()
    @room.destroy()

  it 'gets current outage count', (done) ->
    nock('https://www.nespower.com')
      .get('/outagemap/getall')
      .replyWithFile(200, __dirname + '/fixtures/getall.json')

    selfRoom = @room
    selfRoom.user.say('alice', '@hubot nes')
    setTimeout(() ->
      try
        expect(selfRoom.messages).to.eql [
          ['alice', '@hubot nes']
          ['hubot', '⚡️ NES reports 2,520 customers without power as of 03/26/2021, 09:55 AM']
        ]
        done()
      catch err
        done err
    , 100)

  it 'gets the outage map', ->
    selfRoom = @room
    selfRoom.user.say('alice', '@hubot nes outage map').then =>
      expect(selfRoom.messages).to.eql [
        ['alice', '@hubot nes outage map']
        ['hubot', 'https://www.nespower.com/outages/']
      ]
