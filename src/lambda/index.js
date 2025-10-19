require('dotenv').config();

// MOCKS
const examplePayload = require('../../mocks/example-payload.json');
const messagePresets = require('./messages/messages-presets.json');

// SERVICES
const axiosService = require('./services/axios');

// REMOVE AFTER TESTS
(async () => {
    await handle();
})();

async function handle() {
  try {
    const userId = '759683995563094017'
    const userName = 'tarkov'

    let shouldSendMessage = false;
    let counter = 0;

    // const response = await axiosService.getTweets({ userId });
    const response = examplePayload
    const last5Posts = response.data.slice(0,5)
    const last5PostsUrls = last5Posts.map(p => `https://x.com/${userName}/status/${p.id}`)

    console.log('Last 5 posts URLs: ', last5PostsUrls)

    const botLastSentMessage = await getBotLastSentMessageOnDiscord()

    for (const postUrl of last5PostsUrls) {
      botLastSentMessage.content.includes(postUrl) ? counter++ : null;
    }

    if (counter != last5PostsUrls.length) shouldSendMessage = true;
    if (!shouldSendMessage) {
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
    
    let message = `${discordMessagePreset}`;

    for (const postUrl of last5PostsUrls) message += `\n-----\n${postUrl}`;

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

// exports.handler = async (event) => {
//   const response = await handle();
//   return response
// };
