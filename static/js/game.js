let currentGame = {
    gameId: null,
    mode: null,
    currentPlayerIndex: 0,
    totalPlayers: 0,
    playerNames: [],
    groupId: null
};


// Screen management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    updateGroupHeader();
}

// Update impostor options based on player count and selected mode
function updateImpostorOptions() {
    const numPlayers = parseInt(document.getElementById('num-players').value);
    const selectedMode = document.querySelector('.mode-btn.selected');
    const mode = selectedMode ? selectedMode.dataset.mode : null;
    const impostorSelect = document.getElementById('num-impostors');
    const currentValue = impostorSelect.value;
    const wasRandom = currentValue === 'random';
    
    impostorSelect.innerHTML = '';
    
    if (mode === 'onewordlie') {
        const option = document.createElement('option');
        option.value = '1';
        option.textContent = '1 IMPOSTOR';
        option.selected = true;
        impostorSelect.appendChild(option);
        impostorSelect.disabled = true;
    } else {
        impostorSelect.disabled = false;
        
        const maxImpostors = numPlayers - 2;
        let hasSelected = false;
        
        for (let i = 1; i <= maxImpostors; i++) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = `${i} IMPOSTOR${i > 1 ? 'S' : ''}`;
            if (!wasRandom && (i === parseInt(currentValue) || (!hasSelected && i === 1 && (isNaN(parseInt(currentValue)) || parseInt(currentValue) > maxImpostors)))) {
                option.selected = true;
                hasSelected = true;
            }
            impostorSelect.appendChild(option);
        }
        
        const randomOption = document.createElement('option');
        randomOption.value = 'random';
        randomOption.textContent = 'RANDOM';
        if (wasRandom) {
            randomOption.selected = true;
            hasSelected = true;
        } else if (!hasSelected) {
            randomOption.selected = true;
        }
        impostorSelect.appendChild(randomOption);
    }
}

// Start menu handlers
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        
        // Update theme based on selected mode
        const mode = this.dataset.mode;
        document.body.className = document.body.className.replace(/mode-\w+/g, '');
        document.body.classList.add(`mode-${mode}`);
        
        updateImpostorOptions();
    });
});

document.getElementById('num-players').addEventListener('change', updateImpostorOptions);

document.getElementById('start-btn').addEventListener('click', function() {
    const selectedMode = document.querySelector('.mode-btn.selected');
    if (!selectedMode) {
        return;
    }
    
    currentGame.mode = selectedMode.dataset.mode;
    
    if (currentGame.groupId && currentGame.playerNames && currentGame.playerNames.length >= 3) {
        startGameWithGroup();
        return;
    }
    
    const numPlayers = parseInt(document.getElementById('num-players').value);
    currentGame.totalPlayers = numPlayers;
    
    const container = document.getElementById('player-names-container');
    container.innerHTML = '';
    
    for (let i = 0; i < numPlayers; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'player-name-input';
        input.placeholder = `PLAYER ${i + 1}`;
        input.maxLength = 20;
            container.appendChild(input);
        }
        
        const firstInput = container.querySelector('.player-name-input');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
    
    showScreen('player-names-screen');
});

// Start game with existing group
async function startGameWithGroup() {
    const playerNames = currentGame.playerNames;
    
    // Validate minimum players
    if (playerNames.length < 3) {
        showToast('Minimum 3 players required to play');
        return;
    }
    
    const impostorValue = document.getElementById('num-impostors').value;
    const numImpostors = impostorValue === 'random' ? 'random' : parseInt(impostorValue);
    
    try {
        const response = await fetch('/api/start-game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mode: currentGame.mode,
                numPlayers: playerNames.length,
                numImpostors: numImpostors,
                playerNames: playerNames,
                groupId: currentGame.groupId
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            showToast(error.error || 'Failed to start game');
            return;
        }
        
        const data = await response.json();
        currentGame.gameId = data.gameId;
        currentGame.currentPlayerIndex = data.currentPlayerIndex;
        if (data.groupId) {
            currentGame.groupId = data.groupId;
        }
        
        updateGroupHeader();
        
        const firstPlayerName = playerNames[0] || `Player 1`;
        showPlayerPrompt(firstPlayerName);
    } catch (error) {
        console.error('Error starting game:', error);
        showToast('Failed to start game. Please try again.');
    }
}

// Confirm names and start game
document.getElementById('confirm-names-btn').addEventListener('click', async function() {
    const inputs = document.querySelectorAll('.player-name-input');
    let playerNames = Array.from(inputs).map(input => input.value.trim()).filter(name => name);
    
    if (playerNames.length < 3) {
        showToast('At least 3 players required');
        return;
    }
    
    // Create or get group session
    let groupId = currentGame.groupId;
    if (!groupId) {
        try {
            const groupResponse = await fetch('/api/create-group', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerNames: playerNames })
            });
            
            if (groupResponse.ok) {
                const groupData = await groupResponse.json();
                groupId = groupData.groupId;
                currentGame.groupId = groupId;
                playerNames = groupData.players;
            }
        } catch (error) {
            console.error('Error creating group:', error);
        }
    }
    
    const impostorValue = document.getElementById('num-impostors').value;
    const numImpostors = impostorValue === 'random' ? 'random' : parseInt(impostorValue);
    
    try {
        const response = await fetch('/api/start-game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mode: currentGame.mode,
                numPlayers: playerNames.length,
                numImpostors: numImpostors,
                playerNames: playerNames,
                groupId: groupId
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            showToast(error.error || 'Failed to start game');
            return;
        }
        
        const data = await response.json();
        currentGame.gameId = data.gameId;
        currentGame.currentPlayerIndex = data.currentPlayerIndex;
        currentGame.playerNames = playerNames;
        if (data.groupId) {
            currentGame.groupId = data.groupId;
        }
        
        // Start game directly
        const firstPlayerName = playerNames[0] || data.currentPlayer || `Player 1`;
        showPlayerPrompt(firstPlayerName);
        // Hide group button during game (updateGroupHeader called by showPlayerPrompt)
    } catch (error) {
        console.error('Error starting game:', error);
        showToast('Failed to start game. Please try again.');
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && document.getElementById('player-names-screen').classList.contains('active')) {
        const inputs = document.querySelectorAll('.player-name-input');
        const focusedInput = Array.from(inputs).find(input => document.activeElement === input);
        
        if (focusedInput) {
            const index = Array.from(inputs).indexOf(focusedInput);
            if (index < inputs.length - 1) {
                inputs[index + 1].focus();
            } else {
                document.getElementById('confirm-names-btn').click();
            }
        }
    }
});

function showPlayerPrompt(playerName) {
    document.getElementById('player-name-text').textContent = playerName.toUpperCase();
    showScreen('player-prompt-screen');
    updateGroupHeader();
}

// Reveal word
document.getElementById('reveal-btn').addEventListener('click', async function() {
    try {
        const response = await fetch('/api/get-word', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameId: currentGame.gameId,
                playerIndex: currentGame.currentPlayerIndex
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            showToast(error.error || 'Failed to get word');
            return;
        }
        
        const data = await response.json();
        const wordDisplay = document.getElementById('word-display');
        wordDisplay.textContent = data.word;
        
        if (data.isImpostor) {
            wordDisplay.classList.add('impostor');
        } else {
            wordDisplay.classList.remove('impostor');
        }
        
        showScreen('word-reveal-screen');
    } catch (error) {
        console.error('Error getting word:', error);
        showToast('Failed to get word. Please try again.');
    }
});

document.getElementById('next-btn').addEventListener('click', function() {
    showScreen('pass-phone-screen');
});

document.getElementById('continue-btn').addEventListener('click', async function() {
    try {
        const response = await fetch('/api/next-player', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameId: currentGame.gameId
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            showToast(error.error || 'Failed to continue');
            return;
        }
        
        const data = await response.json();
        
        if (data.allPlayersDone) {
            // Show statistics first
            showStatistics();
        } else {
            currentGame.currentPlayerIndex = data.currentPlayerIndex;
            showPlayerPrompt(data.currentPlayer);
        }
    } catch (error) {
        console.error('Error continuing:', error);
        showToast('Failed to continue. Please try again.');
    }
});


async function showStatistics() {
    try {
        const response = await fetch('/api/get-statistic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameId: currentGame.gameId
            })
        });
        
        if (!response.ok) {
            showScreen('final-screen');
            return;
        }
        
        const data = await response.json();
        
        if (data.stat) {
            document.getElementById('stat-display').textContent = data.stat;
            showScreen('statistics-screen');
        } else {
            // No more stats, go to final screen
            showScreen('final-screen');
        }
    } catch (error) {
        console.error('Error getting statistic:', error);
        showScreen('final-screen');
    }
}

// Statistics continue button
document.getElementById('stat-next-btn').addEventListener('click', function() {
    showScreen('final-screen');
});

document.getElementById('discussion-btn').addEventListener('click', async function() {
    const finalInstructions = document.getElementById('final-instructions');
    finalInstructions.innerHTML = '<p>Each player describes the word.</p><p>Identify the impostor.</p>';
    
    if (currentGame.mode === 'party') {
        await showPartyCard();
    } else {
        currentGame.gameId = null;
        
        if (currentGame.groupId) {
            showScreen('start-screen');
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
        } else {
            showScreen('game-end-screen');
        }
    }
});

async function showPartyCard() {
    try {
        const response = await fetch('/api/get-party-card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameId: currentGame.gameId
            })
        });
        
        if (!response.ok) {
            showScreen('game-end-screen');
            return;
        }
        
        const data = await response.json();
        
        if (data.card) {
            document.getElementById('party-card-display').textContent = data.card;
            showScreen('party-card-screen');
        } else {
            showScreen('game-end-screen');
        }
    } catch (error) {
        console.error('Error getting party card:', error);
        showScreen('game-end-screen');
    }
}

document.getElementById('party-card-next-btn').addEventListener('click', function() {
    currentGame.gameId = null;
    
    if (currentGame.groupId) {
        showScreen('start-screen');
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
    } else {
        showScreen('game-end-screen');
    }
});

async function showGroupScreen() {
    if (!currentGame.groupId) {
        return;
    }
    
    try {
        const response = await fetch('/api/get-group', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId: currentGame.groupId })
        });
        
        if (response.ok) {
            const data = await response.json();
            renderPlayersList(data.players);
            currentGame.playerNames = data.players;
            updateGroupHeader();
            showScreen('group-screen');
        } else {
            // Group doesn't exist
            currentGame.groupId = null;
            currentGame.playerNames = [];
            updateGroupHeader();
        }
    } catch (error) {
        console.error('Error getting group:', error);
    }
}

function updateGroupHeader() {
    const groupHeader = document.getElementById('group-header');
    const groupCount = document.getElementById('group-count');
    const numPlayersItem = document.getElementById('num-players-item');
    
    const activeScreen = document.querySelector('.screen.active');
    const activeScreenId = activeScreen ? activeScreen.id : '';
    
    const allowedScreens = ['start-screen', 'group-screen', 'add-player-screen'];
    const isAllowedScreen = allowedScreens.includes(activeScreenId);
    const isGameActive = currentGame.gameId !== null;
    
    if (currentGame.groupId && currentGame.playerNames && currentGame.playerNames.length >= 3 && isAllowedScreen && !isGameActive) {
        groupHeader.style.display = 'block';
        groupCount.textContent = currentGame.playerNames.length;
        numPlayersItem.style.display = 'none';
    } else {
        groupHeader.style.display = 'none';
        if (activeScreenId === 'start-screen' && (!currentGame.groupId || !currentGame.playerNames || currentGame.playerNames.length < 3)) {
            numPlayersItem.style.display = 'block';
        }
    }
}

function renderPlayersList(players) {
    const container = document.getElementById('players-list');
    container.innerHTML = '';
    
    if (players.length === 0) {
        container.innerHTML = '<p style="opacity: 0.5; text-align: center;">No players</p>';
        // Auto-close if no players (dissolve group)
        setTimeout(() => {
            if (currentGame.groupId) {
                // Exit group on backend
                fetch('/api/exit-group', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ groupId: currentGame.groupId })
                }).catch(() => {});
            }
            currentGame.groupId = null;
            currentGame.playerNames = [];
            updateGroupHeader();
            showScreen('start-screen');
            showToast('Group session ended');
        }, 500);
        return;
    }
    
    // Show warning if less than 3 players
    if (players.length < 3 && players.length > 0) {
        const warning = document.createElement('div');
        warning.className = 'group-warning';
        warning.innerHTML = '<p style="opacity: 0.6; font-size: 0.8125rem; text-align: center; margin-bottom: 1rem;">Minimum 3 players required to play</p>';
        container.appendChild(warning);
    }
    
    players.forEach((player, index) => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        playerItem.innerHTML = `
            <span class="player-item-name">${player}</span>
            <button class="player-item-remove" data-player="${player}">×</button>
        `;
        
        const removeBtn = playerItem.querySelector('.player-item-remove');
        removeBtn.addEventListener('click', async () => {
            await removePlayer(player);
        });
        
        container.appendChild(playerItem);
    });
}

async function removePlayer(playerName) {
    if (!currentGame.groupId) return;
    
    try {
        const response = await fetch('/api/remove-player', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                groupId: currentGame.groupId,
                playerName: playerName
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            renderPlayersList(data.players);
            currentGame.playerNames = data.players;
            updateGroupHeader();
            
            // If 0 players, dissolve group automatically
            if (data.players.length === 0) {
                if (currentGame.groupId) {
                    // Exit group on backend
                    fetch('/api/exit-group', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ groupId: currentGame.groupId })
                    }).catch(() => {});
                }
                currentGame.groupId = null;
                currentGame.playerNames = [];
                updateGroupHeader();
                showScreen('start-screen');
                showToast('Group session ended');
                return;
            }
            
            // Show warning if less than 3 players
            if (!data.canPlay && data.players.length < 3) {
                showToast('Minimum 3 players required to play. Add more players to start a game.');
            }
        }
    } catch (error) {
        console.error('Error removing player:', error);
        showToast('Error removing player');
    }
}

document.getElementById('add-player-btn').addEventListener('click', function() {
    document.getElementById('new-player-input').value = '';
    showScreen('add-player-screen');
    setTimeout(() => document.getElementById('new-player-input').focus(), 100);
});

document.getElementById('confirm-add-btn').addEventListener('click', async function() {
    const playerName = document.getElementById('new-player-input').value.trim();
    
    if (!playerName) {
        return;
    }
    
    if (!currentGame.groupId) {
        showToast('No active group session');
        return;
    }
    
    try {
        const response = await fetch('/api/add-player', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                groupId: currentGame.groupId,
                playerName: playerName
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            renderPlayersList(data.players);
            currentGame.playerNames = data.players;
            updateGroupHeader();
            showScreen('group-screen');
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to add player');
        }
    } catch (error) {
        console.error('Error adding player:', error);
        showToast('Failed to add player');
    }
});

// Cancel add player
document.getElementById('cancel-add-btn').addEventListener('click', function() {
    showScreen('group-screen');
});

// Settings button
document.getElementById('settings-btn').addEventListener('click', function() {
    showToast('Developed by Dr.Fum');
});

// Group manage button (in header)
document.getElementById('group-manage-btn').addEventListener('click', function() {
    showGroupScreen();
});

document.getElementById('close-group-btn').addEventListener('click', function() {
    // Check if there are less than 3 players (but more than 0)
    if (currentGame.playerNames && currentGame.playerNames.length > 0 && currentGame.playerNames.length < 3) {
        showToast('Cannot close: minimum 3 players required. Add more players or remove all to exit.');
        return;
    }
    
    showScreen('start-screen');
});

document.getElementById('restart-btn').addEventListener('click', async function() {
    try {
        if (currentGame.gameId) {
            await fetch('/api/reset-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    gameId: currentGame.gameId
                })
            });
        }
        
        const groupId = currentGame.groupId;
        const playerNames = currentGame.playerNames;
        currentGame = {
            gameId: null,
            mode: null,
            currentPlayerIndex: 0,
            totalPlayers: 0,
            playerNames: playerNames,
            groupId: groupId
        };
        
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
        document.getElementById('num-players').value = '4';
        document.getElementById('num-impostors').value = '1';
        updateImpostorOptions();
        document.getElementById('num-impostors').dispatchEvent(new Event('change'));
        document.getElementById('stat-display').textContent = '';
        document.getElementById('party-card-display').textContent = '';
        
        document.body.className = document.body.className.replace(/mode-\w+/g, '');
        
        updateGroupHeader();
        showScreen('start-screen');
    } catch (error) {
        console.error('Error resetting game:', error);
        showScreen('start-screen');
    }
});

function showToast(message) {
    const toast = document.getElementById('toast-message');
    const toastText = document.getElementById('toast-text');
    
    toastText.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
