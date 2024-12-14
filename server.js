// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');

class MistralAIService {
    constructor() {
        this.apiKey = process.env.MISTRAL_API_KEY; // API-Schlüssel aus der .env-Datei
        this.model = "mistral-large-latest"; // Modellname
    }

    async simpleCompletion(messages) {
        try {
            const response = await axios.post('https://api.mistral.ai/v1/chat/completions', { // Aktualisierter Endpunkt
                model: this.model,
                messages: messages,
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Fehler bei der Anfrage:', error);
            throw error;
        }
    }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/ask', async (req, res) => {
    const messages = req.body.messages;
    const mistralService = new MistralAIService();

    try {
        const chatCompletion = await mistralService.simpleCompletion(messages);
        res.json(chatCompletion);
    } catch (error) {
        res.status(500).send('Fehler bei der Anfrage an die Mistral API');
    }
});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});