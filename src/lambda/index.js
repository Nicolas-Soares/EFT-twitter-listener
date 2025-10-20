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
    const last5PostsUrls = last5Posts.map(p => `https://x.com/${userName}/status/${p.id}`) // [0] is the most recent post
    const botLastSentMessages = await getBotLastSentMessageOnDiscord();

    console.log('[LOG] Last posts URLs: ', last5PostsUrls);
    console.log('[LOG] Bot last sent messages: ', botLastSentMessages)

    for (const postUrl of last5PostsUrls) {
      botLastSentMessages.some(msg => msg.content.includes(postUrl)) ? counter++ : null;
    }

    if (counter != last5PostsUrls.length) shouldSendMessage = true;
    if (!shouldSendMessage) {
      return {
        statusCode: 200,
        body: JSON.stringify("Posts already sent"),
      };
    }

    // Format and send message to discord
    let discordMessagePreset = getRandomMessagePreset()
    if (discordMessagePreset.includes('userId')) {
      discordMessagePreset = discordMessagePreset.replace('userId', process.env.GANSO_DISCORD_USER_ID);
    }
    
    for (const postUrl of last5PostsUrls) {
      const message = `${discordMessagePreset}\n-----\n${postUrl}`;
      const sendMessageResponse = await axiosService.sendDiscordMessage({ message })
      console.log("[LOG] Message sent: ", { message, sendMessageResponse })
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Message sent' }),
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
  let botLastSentMessage = [];
  
  try {
    do {
      const getDiscordMessagesResponse = await axiosService.getDiscordMessages({
        limit,
        messageId: oldestMessageId
      });

      const lastMessagesSentOnChannel = getDiscordMessagesResponse.data
      
          botLastSentMessage.push(...lastMessagesSentOnChannel.filter(message => message.author.id === process.env.DISCORD_BOT_ID));
      if (botLastSentMessage && botLastSentMessage.length >= 5) return botLastSentMessage.slice(0, 5);
  
      oldestMessageId = lastMessagesSentOnChannel[limit - 1].id
    } while (botLastSentMessage.length < 5);
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
