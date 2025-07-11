const axios = require("axios");

const DISCORD_BOT_TOKEN = '';
const DISCORD_CHANNEL_ID = '';

async function sendMessageToDiscord(tweetUrl) {
  await axios.post(
    `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`,
    {
      content: `message`,
    },
    {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

async function getLastMessageFromDiscordChannel() {
  try {
    const res = await axios.get(
      `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages?limit=1`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    );

    const messages = res.data;

    if (messages.length === 0) {
      console.log("Nenhuma mensagem encontrada.");
      return null;
    }

    const lastMessage = messages[0];
    console.log("Última mensagem:", lastMessage.content);
    return lastMessage;
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error.response.data || error.message);
    return null;
  }
}

// sendMessageToDiscord();
getLastMessageFromDiscordChannel()
