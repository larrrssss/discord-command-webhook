require('dotenv/config');

const axios = require('axios');

const {
  DISCORD_BOT_TOKEN,
  DISCORD_WEBHOOK_URL,
  DISCORD_BOT_ID,
} = process.env;

function reduceToString(id, prefix, options) {
  let content = '';
  for (const o of options.sort((a, b) => a.type - b.type)) {
    if (o.type === 2) {
      content += `\n${reduceToString(id, `${prefix} ${o.name}`, o.options)}`;
      continue;
    }

    if (o.type === 1)
      content += `</${prefix} ${o.name}:${id}> - \`</${o.name}:${id}>\`\n`;
  }
  return content;
}

(async () => {
  const { data: commands } = await axios.get(
    `https://discord.com/api/v9/applications/${DISCORD_BOT_ID}/commands`,
    {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`
      },
    },
  );

  let content = '';

  for (const command of commands) {
    if (command.type !== 1) continue;
  
    if (command.options?.find((c) => c.type === 2)) {
      content += `${reduceToString(command.id, command.name, command.options)}\n`;
      continue;
    }

    content += `</${command.name}:${command.id}> - \`</${command.name}:${command.id}>\`\n`;
  }

  await axios.post(
    DISCORD_WEBHOOK_URL,
    {
      content,
    },
  );
})();