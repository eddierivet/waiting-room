document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('start-button');
    const gameContainer = document.getElementById('game-container');
    const breathingContainer = document.getElementById('breathing-container');
    const timerElement = document.getElementById('timer');
    const breathingInstruction = document.getElementById('breathing-instruction');
    
    let waitTimeInSeconds = 15 * 60; // 15 minutes
    let timerInterval;
    let gameInProgress = false;
    let cardsFlipped = 0;
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let matchedPairs = 0;
    
    // Global variables for progress tracking
    let totalGamesPlayed = 0;
    let totalPairsMatched = 0;
    let bestTime = Infinity; // Best time to complete a game
    let currentGameStartTime = 0; // To track time per game
    let achievementsUnlocked = []; // Track unlocked achievements
    
    // Image sources for the memory game (nature-themed for calmness)
    const images = [
        'https://upload.wikimedia.org/wikipedia/commons/b/bf/Golden_Gate_Bridge_as_seen_from_Battery_East.jpg', // Golden Gate Bridge
        'https://upload.wikimedia.org/wikipedia/commons/0/04/Beach_sounds_South_Carolina.ogg', // Beach
        'https://upload.wikimedia.org/wikipedia/commons/c/c5/Moraine_Lake_17092005.jpg', // Mountain
        'https://upload.wikimedia.org/wikipedia/commons/3/3a/Bray%27s_Bayou_through_Braeswood.jpg', // Forest
        'https://upload.wikimedia.org/wikipedia/commons/5/57/Rose_Amber_Flush.jpg', // Flower
        'https://upload.wikimedia.org/wikipedia/commons/b/bb/Kittyply_edit.jpg' // Cat (for cuteness)
    ];

    // Update the timer display
    function updateTimer() {
        const minutes = Math.floor(waitTimeInSeconds / 60);
        const seconds = waitTimeInSeconds % 60;
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        // Update progress bar
        const progressPercent = 100 - (waitTimeInSeconds / (15 * 60) * 100);
        document.getElementById('timer-progress-bar').style.width = `${progressPercent}%`;
        
        // Update waiting message based on time remaining
        const waitingMessageElement = document.getElementById('waiting-message');
        if (waitTimeInSeconds > 10 * 60) { // More than 10 minutes
            waitingMessageElement.textContent = "Your provider will be with you soon";
        } else if (waitTimeInSeconds > 5 * 60) { // Between 5-10 minutes
            waitingMessageElement.textContent = "Almost there, not much longer now";
        } else if (waitTimeInSeconds > 60) { // Between 1-5 minutes
            waitingMessageElement.textContent = "You're next in line";
        } else if (waitTimeInSeconds > 0) { // Less than a minute
            waitingMessageElement.textContent = "We're ready for you any moment now";
        } else {
            waitingMessageElement.textContent = "We're ready for you!";
            document.getElementById('wait-time').classList.add('time-ready');
        }
        
        waitTimeInSeconds--;
        if (waitTimeInSeconds < 0) {
            clearInterval(timerInterval);
            timerElement.textContent = "Ready!";
            // Add a gentle pulse animation to draw attention
            document.getElementById('wait-time').classList.add('pulse-animation');
        }
    }
    
    // Create the memory game
    function createMemoryGame() {
        gameContainer.innerHTML = '';
        gameContainer.classList.add('memory-game');
        
        // Create pairs of cards (12 cards = 6 pairs)
        const cardPairs = [...images, ...images].slice(0, 12);
        // Shuffle the cards
        cardPairs.sort(() => Math.random() - 0.5);
        
        // Create card elements
        cardPairs.forEach((img, index) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.cardIndex = index;
            card.dataset.image = img;
            
            // Card inner structure (front and back)
            card.innerHTML = `
                <div class="memory-card-inner">
                    <div class="memory-card-back">?</div>
                    <div class="memory-card-front">
                        <img src="${img}" alt="Card image">
                    </div>
                </div>
            `;
            
            // Add click event
            card.addEventListener('click', flipCard);
            
            gameContainer.appendChild(card);
        });
        
        gameInProgress = true;
        
        // Reset game tracking variables
        firstCard = null;
        secondCard = null;
        lockBoard = false;
        matchedPairs = 0;
        
        // Record game start time
        currentGameStartTime = Date.now();
    }
    
    // Card flip logic
    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;
        
        this.classList.add('flipped');
        
        if (!firstCard) {
            // First card flipped
            firstCard = this;
            return;
        }
        
        // Second card flipped
        secondCard = this;
        lockBoard = true;
        
        // Check for match
        checkForMatch();
    }
    
    function checkForMatch() {
        const isMatch = firstCard.dataset.image === secondCard.dataset.image;
        
        if (isMatch) {
            disableCards();
            matchedPairs++;
            totalPairsMatched++; // Update total pairs for progress tracking
            
            // Check if all pairs are matched
            if (matchedPairs === images.length) {
                // Calculate game completion time
                const gameTimeSeconds = Math.floor((Date.now() - currentGameStartTime) / 1000);
                
                // Update progress with this game's stats
                updateProgress(gameTimeSeconds);
                
                setTimeout(() => {
                    showBreathingExercise();
                }, 1000);
            }
        } else {
            unflipCards();
        }
    }
    
    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        resetBoard();
    }
    
    function unflipCards() {
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            
            resetBoard();
        }, 1500);
    }
    
    function resetBoard() {
        [firstCard, secondCard] = [null, null];
        lockBoard = false;
    }
    
    // Show breathing exercise between rounds
    function showBreathingExercise() {
        gameContainer.classList.add('hidden');
        breathingContainer.classList.remove('hidden');
        
        const breathingCircle = document.getElementById('breathing-circle');
        let breathingPhase = 0;
        let secondsRemaining = 4; // Start with inhale phase (4 seconds)
        
        // Update breathing instruction and circle animation based on phase
        function updateBreathingPhase() {
            // Update the circle animation class
            breathingCircle.className = '';
            breathingCircle.classList.add('breathing-circle');
            
            if (breathingPhase === 0) {
                // Inhale phase - 4 seconds
                breathingCircle.classList.add('inhale');
                breathingInstruction.textContent = `Inhale... ${secondsRemaining}`;
                secondsRemaining = (secondsRemaining === 1) ? 7 : secondsRemaining - 1;
                
                if (secondsRemaining === 7) {
                    breathingPhase = 1; // Move to hold phase
                }
            } 
            else if (breathingPhase === 1) {
                // Hold phase - 7 seconds
                breathingCircle.classList.add('hold');
                breathingInstruction.textContent = `Hold... ${secondsRemaining}`;
                secondsRemaining = (secondsRemaining === 1) ? 8 : secondsRemaining - 1;
                
                if (secondsRemaining === 8) {
                    breathingPhase = 2; // Move to exhale phase
                }
            } 
            else if (breathingPhase === 2) {
                // Exhale phase - 8 seconds
                breathingCircle.classList.add('exhale');
                breathingInstruction.textContent = `Exhale... ${secondsRemaining}`;
                secondsRemaining = (secondsRemaining === 1) ? 4 : secondsRemaining - 1;
                
                if (secondsRemaining === 4) {
                    breathingPhase = 0; // Move back to inhale phase
                    breathingCycles++;
                    
                    // After 2 complete cycles, return to game
                    if (breathingCycles >= 2) {
                        clearInterval(breathingInterval);
                        setTimeout(() => {
                            breathingContainer.classList.add('hidden');
                            resetGame();
                        }, 1000);
                    }
                }
            }
        }
        
        let breathingCycles = 0;
        updateBreathingPhase(); // Initial update
        
        // Update every second
        let breathingInterval = setInterval(updateBreathingPhase, 1000);
    }
    
    function resetGame() {
        matchedPairs = 0;
        gameContainer.classList.remove('hidden');
        createMemoryGame();
    }
    
    // Background color shift for calming effect
    function startBackgroundShift() {
        const colors = [
            'linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 100%)',
            'linear-gradient(135deg, #e1f5fe 0%, #e0f7fa 100%)',
            'linear-gradient(135deg, #e3f2fd 0%, #e1f5fe 100%)',
            'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)'
        ];
        
        let colorIndex = 0;
        
        setInterval(() => {
            document.body.style.background = colors[colorIndex];
            colorIndex = (colorIndex + 1) % colors.length;
        }, 30000); // Change every 30 seconds
    }
    
    // Initialize progress tracking
    function initProgressTracking() {
        // Create progress display container if it doesn't exist
        if (!document.getElementById('progress-container')) {
            const progressContainer = document.createElement('div');
            progressContainer.id = 'progress-container';
            progressContainer.classList.add('progress-container', 'hidden');
            
            progressContainer.innerHTML = `
                <h3>Your Progress</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-value" id="games-played">0</span>
                        <span class="stat-label">Games Played</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="pairs-matched">0</span>
                        <span class="stat-label">Pairs Matched</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="best-time">--:--</span>
                        <span class="stat-label">Best Time</span>
                    </div>
                </div>
                <div id="achievements-container">
                    <h4>Achievements</h4>
                    <div id="achievements-list" class="achievements-list">
                        <div class="achievement locked" id="achievement-first-game">
                            <span class="achievement-icon">🎮</span>
                            <span class="achievement-name">First Steps</span>
                        </div>
                        <div class="achievement locked" id="achievement-three-games">
                            <span class="achievement-icon">🏆</span>
                            <span class="achievement-name">Getting Comfortable</span>
                        </div>
                        <div class="achievement locked" id="achievement-fast-game">
                            <span class="achievement-icon">⚡</span>
                            <span class="achievement-name">Quick Thinker</span>
                        </div>
                    </div>
                </div>
                <button id="toggle-progress-button" class="secondary-button">Hide Progress</button>
            `;
            
            document.querySelector('.container').appendChild(progressContainer);
            
            // Add event listener for toggling progress visibility
            document.getElementById('toggle-progress-button').addEventListener('click', toggleProgressVisibility);
            
            // Add a button to show progress in the main container
            if (!document.getElementById('show-progress-button')) {
                const showProgressButton = document.createElement('button');
                showProgressButton.id = 'show-progress-button';
                showProgressButton.classList.add('secondary-button');
                showProgressButton.textContent = 'Show Progress';
                showProgressButton.addEventListener('click', toggleProgressVisibility);
                
                // Insert after the breathing container
                document.querySelector('.container').insertBefore(
                    showProgressButton, 
                    document.getElementById('breathing-container').nextSibling
                );
            }
        }
        
        // Try to load saved progress from localStorage
        loadProgress();
    }
    
    // Toggle progress container visibility
    function toggleProgressVisibility() {
        const progressContainer = document.getElementById('progress-container');
        const showProgressButton = document.getElementById('show-progress-button');
        const toggleProgressButton = document.getElementById('toggle-progress-button');
        
        if (progressContainer.classList.contains('hidden')) {
            progressContainer.classList.remove('hidden');
            showProgressButton.classList.add('hidden');
            toggleProgressButton.textContent = 'Hide Progress';
            updateProgressDisplay();
        } else {
            progressContainer.classList.add('hidden');
            showProgressButton.classList.remove('hidden');
            toggleProgressButton.textContent = 'Show Progress';
        }
    }
    
    // Update progress after completing a game
    function updateProgress(gameTimeSeconds) {
        totalGamesPlayed++;
        
        // Check for achievements
        checkAndUnlockAchievements(gameTimeSeconds);
        
        // Update best time if this game was faster
        if (gameTimeSeconds < bestTime && gameTimeSeconds > 0) {
            bestTime = gameTimeSeconds;
        }
        
        // Update display
        updateProgressDisplay();
        
        // Save progress
        saveProgress();
    }
    
    // Check for unlockable achievements
    function checkAndUnlockAchievements(gameTimeSeconds) {
        // First game achievement
        if (totalGamesPlayed === 1 && !achievementsUnlocked.includes('first-game')) {
            unlockAchievement('first-game');
        }
        
        // Three games achievement
        if (totalGamesPlayed >= 3 && !achievementsUnlocked.includes('three-games')) {
            unlockAchievement('three-games');
        }
        
        // Fast game achievement (under 30 seconds)
        if (gameTimeSeconds < 30 && !achievementsUnlocked.includes('fast-game')) {
            unlockAchievement('fast-game');
        }
    }
    
    // Unlock an achievement with visual feedback
    function unlockAchievement(achievementId) {
        achievementsUnlocked.push(achievementId);
        
        const achievementElement = document.getElementById(`achievement-${achievementId}`);
        if (achievementElement) {
            achievementElement.classList.remove('locked');
            achievementElement.classList.add('unlocked');
            
            // Add a temporary celebration effect
            achievementElement.classList.add('celebration');
            setTimeout(() => {
                achievementElement.classList.remove('celebration');
            }, 3000);
            
            // Show notification
            showNotification(`Achievement unlocked: ${achievementElement.querySelector('.achievement-name').textContent}`);
        }
    }
    
    // Show a temporary notification
    function showNotification(message) {
        // Create notification if it doesn't exist
        if (!document.getElementById('notification')) {
            const notification = document.createElement('div');
            notification.id = 'notification';
            notification.classList.add('notification');
            document.body.appendChild(notification);
        }
        
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Update the progress display with current stats
    function updateProgressDisplay() {
        document.getElementById('games-played').textContent = totalGamesPlayed;
        document.getElementById('pairs-matched').textContent = totalPairsMatched;
        
        if (bestTime !== Infinity) {
            const minutes = Math.floor(bestTime / 60);
            const seconds = bestTime % 60;
            document.getElementById('best-time').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
        
        // Update achievements display
        achievementsUnlocked.forEach(achievementId => {
            const achievementElement = document.getElementById(`achievement-${achievementId}`);
            if (achievementElement) {
                achievementElement.classList.remove('locked');
                achievementElement.classList.add('unlocked');
            }
        });
    }
    
    // Save progress to localStorage
    function saveProgress() {
        const progressData = {
            totalGamesPlayed,
            totalPairsMatched,
            bestTime: bestTime === Infinity ? null : bestTime,
            achievementsUnlocked
        };
        
        try {
            localStorage.setItem('waitingRoomGameProgress', JSON.stringify(progressData));
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }
    
    // Load progress from localStorage
    function loadProgress() {
        try {
            const savedProgress = localStorage.getItem('waitingRoomGameProgress');
            if (savedProgress) {
                const progressData = JSON.parse(savedProgress);
                
                totalGamesPlayed = progressData.totalGamesPlayed || 0;
                totalPairsMatched = progressData.totalPairsMatched || 0;
                bestTime = progressData.bestTime || Infinity;
                achievementsUnlocked = progressData.achievementsUnlocked || [];
                
                updateProgressDisplay();
            }
        } catch (error) {
            console.error('Failed to load progress:', error);
        }
    }
    
    startButton.addEventListener('click', function() {
        startButton.classList.add('hidden');
        createMemoryGame();
        
        // Start the countdown timer
        timerInterval = setInterval(updateTimer, 1000);
        
        // Start background shifts
        startBackgroundShift();
        
        // Initialize progress tracking
        initProgressTracking();
    });
});
