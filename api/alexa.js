const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/api/alexa', async (req, res) => {
  const event = req.body;

  if (event.request.type === "LaunchRequest") {
    return res.json(buildResponse("Hola, soy tu asistente ChatGPT. ¿En qué puedo ayudarte?"));
  } else if (event.request.type === "IntentRequest") {
    if (event.request.intent.name === "ChatIntent") {
      const userQuery = event.request.intent.slots.Query.value;
      const chatResponse = await getChatGPTResponse(userQuery);
      return res.json(buildResponse(chatResponse));
    }
  }
  return res.json(buildResponse("Lo siento, no entendí eso."));
});

function buildResponse(outputText) {
  return {
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: outputText
      },
      shouldEndSession: false
    }
  };
}

async function getChatGPTResponse(query) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: query }],
      max_tokens: 150
    })
  });

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

module.exports = app;
