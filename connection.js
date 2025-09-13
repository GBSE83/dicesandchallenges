// connection.js

let connectionState = {
    role: null,
    name: '',
    accessCode: '',
    peer: null,
    peerId: null,
    hostConnection: null,
    guestConnections: [],
    isConnected: false
};

const connectionIndicator = document.getElementById('connection-indicator');
const userRoleSpan = document.getElementById('user-role');
const exitGameBtn = document.getElementById('exit-game-btn');

function initConnection() {
    const urlParams = new URLSearchParams(window.location.search);
    connectionState.role = urlParams.get('role');
    connectionState.name = urlParams.get('name');
    connectionState.accessCode = urlParams.get('accessCode');

    if (!connectionState.role || !connectionState.name || !connectionState.accessCode) {
        window.location.href = 'landing.html';
        return;
    }
    
    updateConnectionDisplay();
    exitGameBtn.addEventListener('click', exitGame);

    if (connectionState.role === 'host') {
        initHostConnection();
        setTimeout(setupHostFunctionOverrides, 1000); // Dar tiempo a que app.js cargue todo
    } else {
        initGuestConnection();
        disableControlsForGuests();
    }
}

function initHostConnection() {
    connectionState.peer = new Peer(`dice-game-${connectionState.accessCode}`);
    connectionState.peer.on('open', id => {
        connectionState.peerId = id;
        connectionState.isConnected = true;
        updateConnectionDisplay();
        console.log('Anfitrión conectado con ID:', id);

        connectionState.peer.on('connection', conn => {
            console.log('Invitado conectado:', conn.peer);
            setupGuestConnection(conn);
        });
    });

    connectionState.peer.on('error', err => {
        console.error('Error de PeerJS (Anfitrión):', err);
        connectionState.isConnected = false;
        updateConnectionDisplay();
    });
}

function initGuestConnection() {
    connectionState.peer = new Peer();
    connectionState.peer.on('open', id => {
        connectionState.peerId = id;
        console.log('Invitado conectado con ID:', id);
        
        const conn = connectionState.peer.connect(`dice-game-${connectionState.accessCode}`);
        connectionState.hostConnection = conn;

        conn.on('open', () => {
            connectionState.isConnected = true;
            updateConnectionDisplay();
            console.log('Conectado al anfitrión.');
            conn.send({ type: 'guest-info', name: connectionState.name });
        });

        conn.on('data', handleHostData);

        conn.on('close', () => {
            connectionState.isConnected = false;
            updateConnectionDisplay();
            alert('Se ha perdido la conexión con el anfitrión.');
            window.location.href = 'landing.html';
        });
    });

    connectionState.peer.on('error', err => {
        console.error('Error de PeerJS (Invitado):', err);
        connectionState.isConnected = false;
        updateConnectionDisplay();
    });
}

function setupGuestConnection(conn) {
    conn.on('open', () => {
        connectionState.guestConnections.push(conn);
        conn.on('data', data => {
            console.log('Datos del invitado:', data);
        });
        conn.on('close', () => {
            connectionState.guestConnections = connectionState.guestConnections.filter(c => c.peer !== conn.peer);
            console.log('Invitado desconectado:', conn.peer);
        });
        broadcastGameState(); // Enviar estado actual al nuevo invitado
    });
}

function handleHostData(data) {
    if (data.type === 'game-state') {
        updateGameState(data.payload);
    } else if (data.type === 'dice-roll-start') {
        window.showDiceRollingAnimation();
    }
}

function broadcastGameState() {
    if (connectionState.role !== 'host' || !window.gameState) return;

    const payload = {
        gameState: window.gameState,
        gameTitle: document.getElementById('game-title-input').value,
        gameDescription: document.getElementById('game-description').value,
        gameInstructions: document.getElementById('game-instructions').value,
        diceMaxValue: document.getElementById('dice-max-value').value,
        allowDuplicateRolls: document.getElementById('allow-duplicate-rolls-checkbox').checked,
    };

    const dataToSend = { type: 'game-state', payload };
    connectionState.guestConnections.forEach(conn => {
        if (conn.open) conn.send(dataToSend);
    });
}

function broadcastMessage(type, payload) {
    if (connectionState.role !== 'host') return;
    const message = { type, payload };
    connectionState.guestConnections.forEach(conn => {
        if (conn.open) conn.send(message);
    });
}

function updateGameState(payload) {
    // Actualiza el gameState local
    Object.assign(window.gameState, payload.gameState);
    
    // Actualiza los elementos de la UI
    document.getElementById('game-title-input').value = payload.gameTitle;
    document.getElementById('game-title').textContent = payload.gameTitle || "Juego de Dados y Pruebas";
    document.getElementById('game-description').value = payload.gameDescription;
    document.getElementById('game-instructions').value = payload.gameInstructions;
    document.getElementById('dice-max-value').value = payload.diceMaxValue;
    document.getElementById('allow-duplicate-rolls-checkbox').checked = payload.allowDuplicateRolls;

    // Llama a las funciones de app.js para redibujar las listas y estados
    window.updateUIFromGameState();
}

function updateConnectionDisplay() {
    const indicatorClass = connectionState.isConnected ? 'connected' : 'disconnected';
    const indicatorTitle = connectionState.isConnected ? 'Conectado' : 'Desconectado';
    connectionIndicator.className = indicatorClass;
    connectionIndicator.title = indicatorTitle;
    userRoleSpan.textContent = `Rol: ${connectionState.role} | Nombre: ${connectionState.name}`;
}

function disableControlsForGuests() {
    document.querySelectorAll('input, button, textarea').forEach(el => {
        if (!['theme-toggle', 'exit-game-btn', 'show-last-result-btn'].includes(el.id) && !el.classList.contains('toggle-btn')) {
            el.disabled = true;
        }
    });
    document.querySelectorAll('.item-list').forEach(list => {
        if(window.Sortable && window.Sortable.get(list)) {
            window.Sortable.get(list).option('disabled', true);
        }
    });
}

function exitGame() {
    if (confirm('¿Estás seguro de que quieres salir del juego?')) {
        if (connectionState.peer) {
            connectionState.peer.destroy();
        }
        window.location.href = 'landing.html';
    }
}

function setupHostFunctionOverrides() {
    const functionsToWrap = [
        'addPlayer', 'deletePlayer', 'togglePlayerActive',
        'addChallenge', 'deleteChallenge', 'toggleChallengeActive', 'updateChallenge',
        'startGame', 'resetGame'
    ];

    functionsToWrap.forEach(funcName => {
        const originalFunc = window[funcName];
        if (typeof originalFunc === 'function') {
            window[funcName] = (...args) => {
                originalFunc.apply(null, args);
                broadcastGameState();
            };
        }
    });
    
    // Caso especial para rollDice
    const originalRollDice = window.rollDice;
    window.rollDice = (...args) => {
        broadcastMessage('dice-roll-start');
        originalRollDice.apply(null, args);
        // El resultado se enviará cuando la animación termine, a través de `showDiceResult`
    };
    
    // Caso especial para showDiceResult (para enviar resultados después de la animación)
    const originalShowDiceResult = window.showDiceResult;
    window.showDiceResult = (...args) => {
        originalShowDiceResult.apply(null, args);
        broadcastGameState();
    };

    // Event listeners para cambios en inputs
    ['game-title-input', 'game-description', 'game-instructions', 'dice-max-value', 'allow-duplicate-rolls-checkbox'].forEach(id => {
        document.getElementById(id).addEventListener('change', broadcastGameState);
    });
}

document.addEventListener('DOMContentLoaded', initConnection);