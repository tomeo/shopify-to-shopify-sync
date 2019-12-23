const axios = require('axios');

module.exports = config => {
  let messages = [];

  const log = message => {
    messages = [...messages, message];
    console.log(message);
  };

  const print = () =>
    axios.post(config.url, {
      text: `\`\`\`${messages.join('\n')}\`\`\``,
    });

  return {
    log,
    print,
  };
};
