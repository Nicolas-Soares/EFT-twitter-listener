require('dotenv').config();

// MOCKS
// const examplePayload = require('../../mocks/example-payload.json');
const messagePresets = require('./messages/messages-presets.json');

// SERVICES
const axiosService = require('./services/axios');

// REMOVE AFTER TESTS
// (async () => {
//     await handle();
// })();

async function handle() {
  try {
    const userId = '759683995563094017'
    const userName = 'tarkov'

    let shouldSendMessage = false;
    let auxCounter = 0;

    // const response = examplePayload
    const response = await axiosService.getTweets({ userId });
    const last5Posts = response.data.data.slice(0,5)
    const lastPostsUrls = last5Posts.map(p => `https://x.com/${userName}/status/${p.id}`) // [0] is the most recent post
    const botLastSentMessages = await getBotLastSentMessageOnDiscord();

    console.log('[LOG] Last posts URLs: ', lastPostsUrls);
    console.log('[LOG] Bot last sent messages: ', botLastSentMessages)

    for (const postUrl of lastPostsUrls) {
      botLastSentMessages.some(msg => msg.content.includes(postUrl)) ? auxCounter++ : null;
    }

    if (auxCounter != lastPostsUrls.length) shouldSendMessage = true;
    if (!shouldSendMessage) {
      console.log('[LOG] Posts already sent');

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
    
    for (let i = 0; i < lastPostsUrls.length; i++) {
      const message = (i == 0) ? `${discordMessagePreset}\n-----\n${lastPostsUrls[i]}` : `\n-----\n${lastPostsUrls[i]}`;
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
  let botLastSentMessages = [];
  
  try {
    do {
      const getDiscordMessagesResponse = await axiosService.getDiscordMessages({
        limit,
        messageId: oldestMessageId
      });

      const lastMessagesSentOnChannel = getDiscordMessagesResponse.data
      
          botLastSentMessages.push(...lastMessagesSentOnChannel.filter(message => message.author.id === process.env.DISCORD_BOT_ID));
      if (botLastSentMessages && botLastSentMessages.length >= 5) return botLastSentMessages.slice(0, 5);
  
      oldestMessageId = lastMessagesSentOnChannel[limit - 1].id
    } while (botLastSentMessages.length < 5);
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
