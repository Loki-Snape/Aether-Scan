// NOTE: API key moved to server environment variable for security.
// Do NOT store API keys in client-side code.
let isGhostActive = false;
let currentGhostType = null;
let currentGhostName = null; 
let cooldownCounter = 0;
let isFetching = false; // Prevents the mic from breaking if you talk too fast

const scanBtn = document.getElementById('scan-btn');
const outputLog = document.getElementById('output-log');
const micStatus = document.getElementById('mic-status');
const freqDisplay = document.getElementById('frequency');
const glitch = document.getElementById('glitch-overlay');
const ghostDot = document.getElementById('ghost-dot'); 

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;

scanBtn.addEventListener('click', () => {
    try {
        recognition.abort();
        recognition.start();
        micStatus.innerText = "MIC: LISTENING";
        micStatus.style.color = "red";
    } catch (e) {
        logMessage("SYSTEM: MIC IS ALREADY WORKING...");
    }
});

recognition.onerror = (event) => {
    logMessage(`SCANNER ERROR: ${event.error}`);
    micStatus.innerText = "MIC: ERROR";
    micStatus.style.color = "orange";
};

recognition.onend = () => {
    if (micStatus.innerText === "MIC: LISTENING") {
        micStatus.innerText = "MIC: READY";
        micStatus.style.color = "#00ff41";
    }
};

recognition.onresult = (event) => {
    const userSpeech = event.results[0][0].transcript.toLowerCase();
    logMessage(`USER: "${userSpeech}"`);
    processLogic(userSpeech);
};

function logMessage(msg, className = "") {
    const p = document.createElement('p');
    p.innerText = `> ${msg}`;
    if (className) p.classList.add(className);
    outputLog.appendChild(p);
    outputLog.scrollTop = outputLog.scrollHeight;
}

function processLogic(input) {
    if (isFetching) {
        logMessage("SYSTEM: WAITING FOR SPIRIT TO REPLY...");
        return;
    }

    if (input.includes("hanumat") || input.includes("rudra") || input.includes("anubis")) {
        triggerBanishment();
        return;
    }

    if (isGhostActive) {
        if (currentGhostName.includes("Good Spirit") && (input.includes("leave") || input.includes("go"))) {
            triggerBanishment();
            return;
        }
        fetchGhostResponse(input);
        return;
    }

    if (cooldownCounter > 0) {
        cooldownCounter--;
        logMessage("ERROR: NO SPIRITUAL SIGNATURE FOUND.");
        return;
    }

    const chance = Math.random();
    if (chance < 0.25) { 
        isGhostActive = true;
        currentGhostType = ghostTypes[Math.floor(Math.random() * ghostTypes.length)];
        currentGhostName = currentGhostType.split(":")[0]; 
        
        if (ghostDot) ghostDot.style.display = "block"; 
        logMessage(`WARNING: IONIC DISTURBANCE DETECTED.`, "detected");
        triggerGlitch();
        logMessage("SYSTEM: CONNECTION ESTABLISHED.");
        fetchGhostResponse(input);
    } else {
        logMessage("ERROR: NO SPIRITUAL SIGNATURE FOUND.");
    }
}

function triggerBanishment() {
    if (currentGhostName === "Gaurav") {
        logMessage("SYSTEM: SPIRIT FADED AWAY SILENTLY.");
    } else if (currentGhostName === "Good Spirit") {
        logMessage("ENCODED: THANK YOU...");
        speak("Thank you, I am finally free.");
    } else if (currentGhostName === "Neutral Spirit") {
        logMessage("ENCODED: DON'T PLEASE DON'T CALL ME AGAIN...");
        speak("Please do not call me again.");
    } else {
        const screams = [
            "NOOO! YOU CANNOT SEND ME BACK! AHHH!",
            "IT BURNS! MAKE IT STOP! NOOOO!",
            "I WILL COME BACK FOR YOU! AHHHHH!",
            "NO NO NO! I WON'T GO! AHHHH!"
        ];
        const randomScream = screams[Math.floor(Math.random() * screams.length)];
        logMessage(`GHOST: ${randomScream}`, "detected");
        speak(randomScream);
    }

    logMessage("SYSTEM ERROR: CONNECTION BROKEN.", "detected");
    endSession();
}

function endSession() {
    isGhostActive = false;
    currentGhostType = null;
    currentGhostName = null;
    isFetching = false;
    if (ghostDot) ghostDot.style.display = "none"; 
    cooldownCounter = 10; 
    
    scanBtn.disabled = true;
    scanBtn.style.background = "#555";
    scanBtn.innerText = "COOLDOWN (60s)";
    micStatus.innerText = "MIC: LOCKED";
    micStatus.style.color = "orange";
    
    logMessage("SYSTEM: MIC DISABLED TO PREVENT OVERLOAD.");

    setTimeout(() => {
        scanBtn.disabled = false;
        scanBtn.style.background = "#00ff41";
        scanBtn.innerText = "START VOICE SCAN";
        micStatus.innerText = "MIC: READY";
        micStatus.style.color = "#00ff41";
        logMessage("SYSTEM: MIC UNLOCKED. READY TO SCAN.");
    }, 60000); 
}

const ghostTypes = [
    "Demonic: Randomly says 'Ankit' out of nowhere. Very aggressive. Wants to kill Gyan.",
    "Killer: Hates Mukul. Only wants to find Mukul and kill him. Aggressive to others.",
    "Evil Ghost: Pure hate. Mentions Mukul, Gyan or Mridul to scare you. Tells you to leave. Very aggressive. Might tell you about he will give Ayush sleep paralysis or kill Yatharth if we won't leave. Says he will come as Cat and eat Gyan in his sleep.",
    "Neutral Spirit: Came by mistake. Confused. Mention Saurav rarely. Wants to find way to leave. Not aggressive but can be scary if provoked.",
    "Good Spirit: Just wants to leave. Will go if you ask nicely. Talks very nicely.",
    "Demonic Liar: Pretends to be a child or a nice adult to trick you. He is pure evil and plays with your emotions. He is the most dangerous one.",
    "Gaurav: Committed suicide in VIT Bhopal 2018 batch. Curses Shri Ram Placement head and Poonkuntran Dean. Very sad and dark. Suggests other to never take this action as he is suffering so much. He knows no one so he doesn't address us with name.",
    "Priyanshu Hunter: Obsessed with Priyanshu. Wants to take him away. By killing him and marrying his soul."
];

async function fetchGhostResponse(prompt) {
    isFetching = true; // Locks the mic so it waits for Google
    try {
        // Send request to local proxy server which holds the API key in an environment variable
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, currentGhostType })
        });

        const data = await response.json();
        
        // Safety Valve: Disguise the Google limit as a ghost attack
        if (data.error) {
            logMessage("WARNING: MASSIVE ECTOPLASMIC SURGE DETECTED.", "detected");
            logMessage("SYSTEM: ENTITY OVERPOWERED SCANNER. DISCONNECTING TO PROTECT HARDWARE.");
            endSession(); 
            return;
        }

        const ghostText = data.candidates[0].content.parts[0].text;
        
        logMessage(`ENCODED: ${ghostText}`);
        speak(ghostText);
        isFetching = false; // Unlocks the mic

    } catch(e) {
        logMessage("SYSTEM CRASH: DEMONIC FEEDBACK LOOP. FORCING RESET.");
        endSession(); 
    }
}

function triggerGlitch() {
    glitch.style.display = 'block';
    setTimeout(() => { glitch.style.display = 'none'; }, 1000);
}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 0.1;
    utterance.rate = 0.6;
    window.speechSynthesis.speak(utterance);
}