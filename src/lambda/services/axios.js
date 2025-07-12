const axios = require('axios');

class AxiosService {
  constructor() {
    this.twitterBaseUrl = process.env.TWITTER_BASE_URL
    this.twitterBearerToken = process.env.TWITTER_TOKEN
    this.discordBaseUrl = process.env.DISCORD_BASE_URL
    this.discordBotToken = process.env.DISCORD_BOT_TOKEN
    this.discordChannelId = process.env.DISCORD_DEFAULT_CHANNEL_ID
  }

  async getTweets({ userId }) {
    try {
      const params = { 'tweet.fields': 'entities' };
      const header = { Authorization: this.twitterBearerToken }
      const url = `${this.twitterBaseUrl}/users/${userId}/tweets`
  
      const response = await axios.get(
        url,
        { header, params }
      )

      // const response = await axios.get(
    //   TWITTER_BASE_URL,
    //   {
    //     header: { Authorization: TWITTER_BEARER_TOKEN },
    //     params: { 'tweet.fields': 'entities' }
    //   }
    // )
      
      return response
    } catch (error) {
      const err = new Error('Failed to fetch tweets');
            err.details = error
      throw err;
    }
  }

  async sendDiscordMessage({ message }) {
    try {
      const url = `${this.discordBaseUrl}/channels/${this.discordChannelId}/messages`
      const headers = { Authorization: this.discordBotToken }
  
      const response = await axios.post(
        url,
        { content: message },
        { headers }
      )

      return response
    } catch (error) {
      const err = new Error('Failed to send Discord message');
            err.details = error
      throw err;
    }
  }

  async getDiscordMessages({ limit, messageId = null }) {
    try {
      const url = `${this.discordBaseUrl}/channels/${this.discordChannelId}/messages?`
      const headers = { Authorization: this.discordBotToken }
      const params = { limit }
      messageId && (params.before = messageId)
  
      const response = await axios.get(
        url,
        { headers, params }
      )

      return response
    } catch (error) {
      const err = new Error('Failed to send Discord message');
            err.details = error
      throw err;
    }
  }
}

module.exports = new AxiosService();
