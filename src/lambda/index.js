require('dotenv').config();

// MOCKS
const examplePayload = require('../../mocks/example-payload.json');
const messagePresets = require('./messages/messages-presets.json');

// SERVICES
const axiosService = require('./services/axios');

async function handle() {
  try {
    // const axiosService = new axiosService();
    // const response = await axiosService.getTweets({ userId: '759683995563094017' });
    
    const response = examplePayload

    // Get last tweet URL
    const lastPost = response.data[0]
    const lastPostUrl = lastPost.entities.urls[0].expanded_url

    // Format and send message to discord
    const discordMessagePreset = getRandomMessagePreset()
    const message = `${discordMessagePreset} ${lastPostUrl}`
    const sendDiscordMessageResponse = await axiosService.sendDiscordMessage({ message })

    console.log('SEND DISCORD MESSAGE')
    console.log(sendDiscordMessageResponse)
  } catch (error) {
    console.error('ERROR', error)
  }
}

function getRandomMessagePreset() {
  const randomIndex = Math.floor(Math.random() * messagePresets.length);
  return messagePresets[randomIndex];
}

handle()

// exports.handler = async (event) => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify("Olá do Lambda!"),
//   };
// };
