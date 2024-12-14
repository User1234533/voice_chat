// public/script.js
let voices = []; // Array für die Stimmen
let recognition; // Globale Variable für die Spracheingabe
let utterance; // Globale Variable für die Sprachausgabe

// Stimmen abrufen, wenn die Seite geladen wird
window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
    console.log('Verfügbare Stimmen:', voices); // Verfügbare Stimmen in der Konsole ausgeben
};

document.getElementById('voiceButton').addEventListener('click', () => {
    if (utterance && window.speechSynthesis.speaking) {
        // Wenn bereits gesprochen wird, stoppe die Sprachausgabe
        window.speechSynthesis.cancel();
        resetIcon(); // Setze das Icon zurück zum Mikrofon
        return;
    }

    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'de-DE'; // Sprache auf Deutsch setzen
    recognition.interimResults = false;

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Erkannter Text:', transcript); // Erkannten Text in der Konsole ausgeben

        // Automatisches Absenden der Frage
        await handleQuestion(transcript); // Frage direkt übergeben
    };

    recognition.onerror = (event) => {
        console.error('Fehler bei der Spracheingabe:', event.error);
    };

    recognition.start(); // Spracheingabe starten
});

// Funktion zum Verarbeiten der Frage
async function handleQuestion(question) {
    const responseDiv = document.getElementById('response');

    // Füge den Text "agiere als assistent" hinzu
    const assistantPrompt = "Antworte so kurz wie möglich und simpel!" + question;

    const messages = [
        {
            "role": "user",
            "content": assistantPrompt, // Verwende den modifizierten Text
        }
    ];

    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages }),
        });

        if (response.ok) {
            const data = await response.json();
            const answer = data.choices[0].message.content; // Annahme, dass die Antwort in dieser Struktur kommt
            responseDiv.innerText = answer; // Antwort auf der Seite anzeigen
            console.log('Antwort von Mistral API:', answer); // Antwort in der Konsole ausgeben

            // Text-to-Speech mit einer verfügbaren Stimme
            // Filtere den Text, um alle '*' zu entfernen
            const filteredAnswer = answer.replace(/\*/g, ''); // Entferne alle '*' Zeichen

            utterance = new SpeechSynthesisUtterance(filteredAnswer); // Verwende den gefilterten Text
            utterance.lang = 'de-DE'; // Sprache auf Deutsch setzen

            // Stimmen abrufen und die erste verfügbare Stimme auswählen
            const selectedVoice = voices[0]; // Wähle die erste verfügbare Stimme
            if (selectedVoice) {
                utterance.voice = selectedVoice; // Die Stimme setzen
                console.log('Verwendete Stimme:', selectedVoice.name); // Verwendete Stimme in der Konsole ausgeben
            } else {
                console.warn('Keine Stimme gefunden, es wird keine Sprachausgabe erfolgen.'); // Warnung, wenn keine Stimme gefunden wird
            }

            // Sprachausgabe starten
            window.speechSynthesis.speak(utterance); // Antwort abspielen

            // Ändere das Icon zu einem Kreuz
            document.querySelector('#voiceButton i').classList.remove('fas', 'fa-microphone');
            document.querySelector('#voiceButton i').classList.add('cross-icon', 'fas', 'fa-times');

            // Event-Listener für das Ende der Sprachausgabe
            utterance.onend = () => {
                console.log('Sprachausgabe beendet.');
                resetIcon(); // Setze das Icon zurück zum Mikrofon
            };

            // Event-Listener für Fehler bei der Sprachausgabe
            utterance.onerror = (event) => {
                console.error('Fehler bei der Sprachausgabe:', event.error);
                resetIcon(); // Setze das Icon zurück zum Mikrofon bei Fehler
            };
        } else {
            responseDiv.innerText = 'Fehler bei der Anfrage an die Mistral API';
            console.error('Fehler bei der Anfrage:', response.statusText); // Fehler in der Konsole ausgeben
        }
    } catch (error) {
        responseDiv.innerText = 'Fehler bei der Anfrage an die Mistral API';
        console.error('Fehler:', error); // Fehler in der Konsole ausgeben
    }
}

// Funktion zum Zurücksetzen des Icons
function resetIcon() {
    const icon = document.querySelector('#voiceButton i');
    icon.classList.remove('cross-icon', 'fas', 'fa-times');
    icon.classList.add('fas', 'fa-microphone');
}