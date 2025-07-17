require('dotenv').config();

// MOCKS
// const examplePayload = require('../../mocks/example-payload.json');
const messagePresets = require('./messages/messages-presets.json');

// SERVICES
const axiosService = require('./services/axios');

async function handle() {
  try {
    const userId = '759683995563094017'
    const userName = 'tarkov'

    const response = await axiosService.getTweets({ userId });
    // const response = examplePayload

    // Get last tweet URL
    const lastPostId = response.data.data[0].id
    const lastPostUrl = `https://x.com/${userName}/status/${lastPostId}`

    console.log('Last post URL: ', lastPostUrl)

    // Validate if post was already sent
    const botLastSentMessage = await getBotLastSentMessageOnDiscord()
    const isLastPostAlreadySent = botLastSentMessage.content.includes(lastPostUrl)
    if (isLastPostAlreadySent) {
      console.log("Post already sent")

      return {
        statusCode: 200,
        body: JSON.stringify("Post already sent"),
      };
    }

    // Format and send message to discord
    let discordMessagePreset = getRandomMessagePreset()
    if (discordMessagePreset.includes('userId')) {
      discordMessagePreset = discordMessagePreset.replace('userId', process.env.GANSO_DISCORD_USER_ID);
    }
    
    const message = `${discordMessagePreset} ${lastPostUrl}`
    const sendDiscordMessageResponse = await axiosService.sendDiscordMessage({ message })

    console.log("Message sent successfully: ", message)

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Message sent successfully',
        discordMessage: sendDiscordMessageResponse.data,
      }),
    };
  } catch (error) {
    console.error('ERROR', error)
  }
}

function getRandomMessagePreset() {
  const randomIndex = Math.floor(Math.random() * messagePresets.length);
  return messagePresets[randomIndex];
}

async function getBotLastSentMessageOnDiscord() {
  const limit = 100;

  let oldestMessageId;
  let botLastSentMessage;
  
  try {
    do {
      const getDiscordMessagesResponse = await axiosService.getDiscordMessages({
        limit,
        messageId: oldestMessageId
      });

      const lastMessagesSentOnChannel = getDiscordMessagesResponse.data
      
          botLastSentMessage = lastMessagesSentOnChannel.find(message => message.author.id === process.env.DISCORD_BOT_ID);
      if (botLastSentMessage) return botLastSentMessage;
  
      oldestMessageId = lastMessagesSentOnChannel[limit - 1].id
    } while (!botLastSentMessage);
  } catch (error) {
    const err = new Error('Error getting bot last sent message on Discord')
          err.details = error
    throw err;
  }
}

exports.handler = async (event) => {
  const response = await handle();
  return response
};
