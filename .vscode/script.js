// A "state" object to hold our game data, like moves and secrets
const gameState = {
    playerA: { move: null, secret: null, commitment: null },
    playerB: { move: null, secret: null, commitment: null },
};

// --- Helper Functions (Our Tools) ---

// This function generates a random secret, just like os.urandom in Python
function generateSecret() {
    const array = new Uint32Array(8);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec =&gt; ('0' + dec.toString(16)).substr(-2)).join('');
}

// The JavaScript version of our hashing function
// It's "async" because browser crypto is non-blocking
async function generateCommitment(move, secret) {
    const combinedString = move + secret;
    const encoder = new TextEncoder();
    const data = encoder.encode(combinedString);
    // This is the JS equivalent of hashlib.sha256
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Convert bytes to a hex string
    const hashHex = http://hashArray.map(b =&gt; b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// The same winner-logic as our Python script
function determineWinner(moveA, moveB) {
    if (moveA === moveB) return "It's a Tie!";
    const winningMoves = {
        rock: "scissors",
        scissors: "paper",
        paper: "rock",
    };
    if (winningMoves[moveA] === moveB) {
        return "🏆 Player A Wins!";
    } else {
        return "🏆 Player B Wins!";
    }
}

// --- DOM Elements (Connecting JS to HTML) ---
// We "grab" the HTML elements by their ID so we can control them
const playerASection = document.getElementById('playerA-commit-section');
const playerBSection = document.getElementById('playerB-commit-section');
const revealSection = document.getElementById('reveal-section');
const resultsSection = document.getElementById('results-section');

const outputA = document.getElementById('outputA');
const outputB = document.getElementById('outputB');
const verificationLog = document.getElementById('verification-log');

const commitABtn = document.getElementById('commitA-btn');
const commitBBtn = document.getElementById('commitB-btn');
const revealBtn = document.getElementById('reveal-btn');
const choiceBtns = document.querySelectorAll('.choice-btn');

// --- Game Logic ---

// Handle clicks on the choice buttons (Rock, Paper, Scissors)
let selectedMove = null;
choiceBtns.forEach(btn =&gt; {
    btn.addEventListener('click', () =&gt; {
        // Clear previous selections
        choiceBtns.forEach(b =&gt; b.classList.remove('selected'));
        // Mark the new one as selected
        btn.classList.add('selected');
        selectedMove = btn.dataset.move;
    });
});

// Player A commits their move
commitABtn.addEventListener('click', async () =&gt; {
    if (!selectedMove) {
        alert('Player A, please select a move first!');
        return;
    }
    gameState.playerA.move = selectedMove;
    gameState.playerA.secret = generateSecret();
    gameState.playerA.commitment = await generateCommitment(gameState.playerA.move, gameState.playerA.secret);

    outputA.innerText = `Commitment Generated! Send this to Player B:\n\n${gameState.playerA.commitment}\n\nYour secret proof (keep this safe!):\n${gameState.playerA.secret}`;
    
    // Hide this section and show Player B's
    http://playerASection.style.display = 'none';
    http://playerBSection.style.display = 'block';
    selectedMove = null; // Reset for next player
    choiceBtns.forEach(b =&gt; b.classList.remove('selected'));
});

// Player B commits their move
commitBBtn.addEventListener('click', async () =&gt; {
    if (!selectedMove) {
        alert('Player B, please select a move first!');
        return;
    }
    gameState.playerB.move = selectedMove;
    gameState.playerB.secret = generateSecret();
    gameState.playerB.commitment = await generateCommitment(gameState.playerB.move, gameState.playerB.secret);

    outputB.innerText = `Commitment Generated! Send this to Player A:\n\n${gameState.playerB.commitment}\n\nYour secret proof (keep this safe!):\n${gameState.playerB.secret}`;
    
    // Hide this section and show the reveal button
    http://playerBSection.style.display = 'none';
    http://revealSection.style.display = 'block';
});

// Both players reveal and we verify the results
revealBtn.addEventListener('click', async () =&gt; {
    http://revealSection.style.display = 'none';
    http://resultsSection.style.display = 'block';

    let log = "--- Verifying Proofs ---\n\n";

    // Re-calculate the hash from the revealed info to verify
    const calculatedCommitmentA = await generateCommitment(gameState.playerA.move, gameState.playerA.secret);
    const calculatedCommitmentB = await generateCommitment(gameState.playerB.move, gameState.playerB.secret);

    const isAValid = calculatedCommitmentA === gameState.playerA.commitment;
    const isBValid = calculatedCommitmentB === gameState.playerB.commitment;

    log += `Player A revealed: ${gameState.playerA.move}\n`;
    log += `Original Commitment: ${gameState.playerA.commitment}\n`;
    log += `Verification: ${isAValid ? '✅ Honest!' : '❌ CHEATER!'}\n\n`;

    log += `Player B revealed: ${gameState.playerB.move}\n`;
    log += `Original Commitment: ${gameState.playerB.commitment}\n`;
    log += `Verification: ${isBValid ? '✅ Honest!' : '❌ CHEATER!'}\n\n`;

    if (isAValid &amp;&amp; isBValid) {
        log += "--- Game Result ---\n";
        const result = determineWinner(gameState.playerA.move, gameState.playerB.move);
        log += result;
    } else {
        log += "Result cannot be determined due to cheating.";
    }

    verificationLog.innerText = log;
});