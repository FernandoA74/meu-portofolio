/**
 * TaskQuest - Pet Hibernation System
 * Complete JavaScript with Hibernation Features
 * 
 * @description
 * This file contains the complete pet hibernation system.
 * When energy reaches zero, the pet enters hibernation mode and becomes sad.
 * Tasks are blocked until the pet recovers through petting or natural recovery.
 * 
 * @version 2.1.0
 * @author TaskQuest Development Team
 */

/* ==========================================
   GAME DATA & INITIALIZATION
   ========================================== */

/**
 * Main Game Data Object
 * 
 * Stores all game state including player progression, pet stats, and hibernation state.
 * Loaded from localStorage on startup, saved after each change.
 * 
 * @property {number} level - Current player level
 * @property {number} xp - Current XP toward next level
 * @property {number} totalXP - Lifetime XP earned
 * @property {number} streak - Consecutive days with completed tasks
 * @property {string|null} lastCompletedDate - Last task completion date
 * @property {number} totalCompleted - Total tasks completed
 * @property {Object} achievements - Unlocked achievements
 * @property {boolean} soundEnabled - Sound effects toggle
 * @property {number} petHappiness - Pet happiness stat (0-100)
 * @property {number} petEnergy - Pet energy stat (0-100)
 * @property {number} petHunger - Pet hunger stat (0-100)
 * @property {number} petStage - Current evolution stage
 * @property {number} petLastFed - Last feeding timestamp
 * @property {number} petLastPet - Last petting timestamp
 * @property {boolean} petHibernating - Is pet currently hibernating
 * @property {number|null} hibernationStartTime - When hibernation started
 * @property {number} petLastUpdate - Last stat decay update
 */
let gameData = JSON.parse(localStorage.getItem('taskQuestData')) || {
    // Player progression
    level: 1,
    xp: 0,
    totalXP: 0,
    streak: 0,
    lastCompletedDate: null,
    totalCompleted: 0,
    achievements: {},
    soundEnabled: true,
    
    // Pet stats
    petHappiness: 50,
    petEnergy: 75,
    petHunger: 30,
    petStage: 0,
    petLastFed: Date.now(),
    petLastPet: Date.now(),
    
    // Hibernation system
    petHibernating: false,
    hibernationStartTime: null,
    petLastUpdate: Date.now()
};

/**
 * Task Array
 * Stores all user tasks with their properties
 */
let tasks = JSON.parse(localStorage.getItem('taskQuestTasks')) || [];

/* ==========================================
   PET EVOLUTION SYSTEM
   ========================================== */

/**
 * Pet Evolution Stages
 * Defines all possible pet forms based on player level
 */
const petEvolutions = [
    { stage: 0, emoji: '🥚', name: 'Mysterious Egg', mood: 'Waiting to hatch...', minLevel: 1 },
    { stage: 1, emoji: '🐣', name: 'Baby Chick', mood: 'Chirp chirp!', minLevel: 1 },
    { stage: 2, emoji: '🐥', name: 'Young Bird', mood: 'Feeling playful!', minLevel: 5 },
    { stage: 3, emoji: '🐦', name: 'Teen Bird', mood: 'Getting stronger!', minLevel: 10 },
    { stage: 4, emoji: '🦅', name: 'Mighty Eagle', mood: 'Soaring high!', minLevel: 15 },
    { stage: 5, emoji: '🦜', name: 'Phoenix Master', mood: 'Maximum power!', minLevel: 20 },
    { stage: 6, emoji: '✨🦜✨', name: 'Cosmic Phoenix', mood: 'Transcendent!', minLevel: 25 }
];

/**
 * Pet Mood Text Banks
 * Different mood categories with multiple text variations
 */
const petMoods = {
    happy: ['So happy!', 'Loving it!', '😊', 'Best day ever!', 'Feeling great!'],
    neutral: ['Doing okay', 'Chilling', '😐', 'Alright', 'Not bad'],
    sad: ['A bit tired...', 'Need attention...', '😢', 'Feeling down', 'Missing you'],
    hungry: ['So hungry!', 'Feed me!', '😋', 'Tummy rumbling', 'Need food!'],
    energetic: ['Full of energy!', 'Ready to play!', '⚡', 'Let\'s go!', 'Pumped up!']
};

/**
 * Get Current Pet Evolution
 * 
 * Determines which evolution stage pet should be at based on current level.
 * Iterates backwards to find highest qualifying stage.
 * 
 * @returns {Object} Evolution stage object
 */
function getPetEvolution() {
    const level = gameData.level;
    
    for (let i = petEvolutions.length - 1; i >= 0; i--) {
        if (level >= petEvolutions[i].minLevel) {
            return petEvolutions[i];
        }
    }
    
    return petEvolutions[0];
}

/* ==========================================
   HIBERNATION SYSTEM
   ========================================== */

/**
 * Check Hibernation State
 * 
 * Determines if pet should enter or exit hibernation based on energy level.
 * Uses hysteresis pattern: enters at 0, exits at 20 to prevent flickering.
 * 
 * @returns {void}
 * 
 * Hysteresis Pattern:
 * The gap between entry (0) and exit (20) prevents rapid state switching.
 * Like a thermostat with deadband - more stable than simple threshold.
 */
function checkHibernation() {
    // Enter hibernation when energy depleted
    if (gameData.petEnergy <= 0 && !gameData.petHibernating) {
        enterHibernation();
    }
    
    // Exit hibernation when energy recovered
    if (gameData.petEnergy >= 20 && gameData.petHibernating) {
        wakeFromHibernation();
    }
}

/**
 * Enter Hibernation Mode
 * 
 * Pet becomes exhausted and goes to sleep.
 * Blocks task completion until recovery.
 * 
 * @returns {void}
 * 
 * Effects:
 * - Visual: Pet emoji changes to sleeping face, grayscale filter applied
 * - Gameplay: Tasks cannot be completed
 * - Stats: Happiness decreases by 30 (pet is sad)
 * - UI: Shows notification modal explaining state
 */
function enterHibernation() {
    // Update state
    gameData.petHibernating = true;
    gameData.hibernationStartTime = Date.now();
    
    // Pet becomes sad about being exhausted
    gameData.petHappiness = Math.max(0, gameData.petHappiness - 30);
    
    // Add visual styling class
    const petDisplay = document.getElementById('petDisplay');
    petDisplay.classList.add('hibernating');
    
    // Show notification
    showCelebration(
        '😴 Pet Hibernating!',
        'Your pet is completely exhausted and has fallen into deep sleep. Pet them to slowly restore energy, or wait for natural recovery!',
        '💤'
    );
    
    // Play sad sound
    playSound('hibernate');
    
    // Update UI and save
    updatePetDisplay();
    saveData();
}

/**
 * Wake from Hibernation
 * 
 * Pet has recovered enough energy to become active again.
 * Celebrates recovery and restores normal gameplay.
 * 
 * @returns {void}
 * 
 * Wake-Up Sequence:
 * 1. Remove hibernation flag
 * 2. Boost happiness (+20)
 * 3. Play wake-up animation
 * 4. Show celebration popup
 * 5. Create visual effects (hearts, confetti)
 */
function wakeFromHibernation() {
    // Update state
    gameData.petHibernating = false;
    
    // Pet is happy to be awake
    gameData.petHappiness = Math.min(100, gameData.petHappiness + 20);
    
    // Remove hibernation styling and add wake animation
    const petDisplay = document.getElementById('petDisplay');
    petDisplay.classList.remove('hibernating');
    petDisplay.classList.add('waking');
    
    // Remove animation class after completion
    setTimeout(() => {
        petDisplay.classList.remove('waking');
    }, 1000);
    
    // Show celebration
    showCelebration(
        '🌟 Pet Awakened!',
        'Your pet has recovered and is ready to help with tasks again!',
        '✨'
    );
    
    // Visual effects
    createHearts();
    createConfetti();
    
    // Play happy sound
    playSound('levelup');
    
    // Update UI and save
    updatePetDisplay();
    saveData();
}

/* ==========================================
   PET DISPLAY & VISUALS
   ========================================== */

/**
 * Update Pet Display
 * 
 * Refreshes all pet-related UI elements.
 * Shows different visuals when hibernating vs. active.
 * 
 * @returns {void}
 * 
 * Hibernation Visuals:
 * - Emoji changes to 😴 (sleeping face)
 * - Name shows "(Sleeping)" suffix
 * - Mood shows recovery instructions
 * - Grayscale filter and reduced opacity
 * - Stage banner shows "HIBERNATING" status
 * 
 * Normal Visuals:
 * - Shows evolution emoji
 * - Mood determined by stats
 * - Full color and opacity
 * - Normal stage banner
 */
function updatePetDisplay() {
    const evolution = getPetEvolution();
    const petDisplay = document.getElementById('petDisplay');
    const petName = document.getElementById('petName');
    const petMood = document.getElementById('petMood');
    const petStageBanner = document.getElementById('petStageBanner');
    
    if (gameData.petHibernating) {
        // HIBERNATION MODE VISUALS
        
        petDisplay.textContent = '😴';
        petName.textContent = evolution.name + ' (Sleeping)';
        petName.style.color = '#6c757d';
        petMood.textContent = '💤 ZZZ... Too tired to help. Pet me to recover!';
        petMood.style.color = '#dc3545';
        petDisplay.style.filter = 'grayscale(70%)';
        petDisplay.style.opacity = '0.7';
        petStageBanner.textContent = '😴 HIBERNATING';
        petStageBanner.style.background = 'linear-gradient(135deg, #6c757d 0%, #495057 100%)';
        
    } else {
        // NORMAL MODE VISUALS
        
        petDisplay.textContent = evolution.emoji;
        petName.textContent = evolution.name;
        petName.style.color = '#667eea';
        petStageBanner.textContent = `Stage ${evolution.stage + 1}`;
        petStageBanner.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        
        // Determine mood based on stats
        const avgMood = (gameData.petHappiness + gameData.petEnergy) / 2;
        let moodText = evolution.mood;
        
        if (gameData.petHunger > 80) {
            moodText = petMoods.hungry[Math.floor(Math.random() * petMoods.hungry.length)];
            petMood.style.color = '#ffc107';
        } else if (gameData.petEnergy < 30) {
            moodText = 'Getting sleepy... need tasks soon!';
            petMood.style.color = '#ff9800';
        } else if (avgMood > 70) {
            moodText = petMoods.happy[Math.floor(Math.random() * petMoods.happy.length)];
            petMood.style.color = '#28a745';
        } else if (avgMood < 30) {
            moodText = petMoods.sad[Math.floor(Math.random() * petMoods.sad.length)];
            petMood.style.color = '#6c757d';
        } else if (gameData.petEnergy > 80) {
            moodText = petMoods.energetic[Math.floor(Math.random() * petMoods.energetic.length)];
            petMood.style.color = '#17a2b8';
        } else {
            petMood.style.color = '#666';
        }
        
        petMood.textContent = moodText;
        petDisplay.style.filter = 'none';
        petDisplay.style.opacity = '1';
    }
    
    // Update stat bars
    document.getElementById('happinessBar').style.width = gameData.petHappiness + '%';
    document.getElementById('energyBar').style.width = gameData.petEnergy + '%';
    document.getElementById('hungerBar').style.width = gameData.petHunger + '%';
    
    // Color-code stat bars
    updateStatBarColors();
}

/**
 * Update Stat Bar Colors
 * 
 * Changes bar colors based on stat levels to provide visual warnings.
 * Red = critical, Orange = warning, Green/Normal = healthy.
 * 
 * @returns {void}
 * 
 * Color Thresholds:
 * - Energy: Red (0), Orange (<30), Green (healthy)
 * - Hunger: Red (100), Orange (>70), Yellow (normal)
 * - Happiness: Red (<20), Orange (<40), Pink (healthy)
 */
function updateStatBarColors() {
    // Energy bar
    const energyBar = document.getElementById('energyBar');
    if (gameData.petEnergy <= 0) {
        energyBar.style.background = 'linear-gradient(90deg, #dc3545, #c82333)';
    } else if (gameData.petEnergy < 30) {
        energyBar.style.background = 'linear-gradient(90deg, #ffc107, #ff9800)';
    } else {
        energyBar.style.background = 'linear-gradient(90deg, #51cf66, #94d82d)';
    }
    
    // Hunger bar
    const hungerBar = document.getElementById('hungerBar');
    if (gameData.petHunger >= 100) {
        hungerBar.style.background = 'linear-gradient(90deg, #dc3545, #c82333)';
    } else if (gameData.petHunger > 70) {
        hungerBar.style.background = 'linear-gradient(90deg, #ffc107, #ff9800)';
    } else {
        hungerBar.style.background = 'linear-gradient(90deg, #ffd43b, #ffa94d)';
    }
    
    // Happiness bar
    const happinessBar = document.getElementById('happinessBar');
    if (gameData.petHappiness < 20) {
        happinessBar.style.background = 'linear-gradient(90deg, #dc3545, #c82333)';
    } else if (gameData.petHappiness < 40) {
        happinessBar.style.background = 'linear-gradient(90deg, #ffc107, #ff9800)';
    } else {
        happinessBar.style.background = 'linear-gradient(90deg, #ff6b6b, #ff8787)';
    }
}

/* ==========================================
   PET INTERACTIONS
   ========================================== */

/**
 * Pet the Pet
 * 
 * User clicks on pet to increase happiness or help recovery.
 * Different effects during hibernation vs. normal mode.
 * Has 10-second cooldown to prevent spam.
 * 
 * @returns {void}
 * 
 * Normal Mode:
 * - Increases happiness by 10
 * - Creates 5 pink hearts
 * - Happy jump animation
 * 
 * Hibernation Mode:
 * - Increases energy by 5 (slower recovery)
 * - Increases happiness by 5
 * - Creates 2 blue hearts
 * - Gentle waking animation
 */
function petPet() {
    const now = Date.now();
    const timeSinceLastPet = now - gameData.petLastPet;
    
    // Cooldown check (10 seconds)
    if (timeSinceLastPet < 10000) {
        return;
    }
    
    gameData.petLastPet = now;
    const petDisplay = document.getElementById('petDisplay');
    
    if (gameData.petHibernating) {
        // Hibernation recovery mode
        gameData.petEnergy = Math.min(100, gameData.petEnergy + 5);
        gameData.petHappiness = Math.min(100, gameData.petHappiness + 5);
        
        petDisplay.classList.add('waking');
        setTimeout(() => petDisplay.classList.remove('waking'), 600);
        
        // Create 2 blue hearts
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.className = 'heart-particle';
                heart.textContent = '💙';
                
                const rect = petDisplay.getBoundingClientRect();
                heart.style.left = rect.left + rect.width / 2 + (Math.random() - 0.5) * 50 + 'px';
                heart.style.top = rect.top + rect.height / 2 + 'px';
                
                document.body.appendChild(heart);
                setTimeout(() => heart.remove(), 2000);
            }, i * 100);
        }
        
        playSound('pet');
        
    } else {
        // Normal petting mode
        gameData.petHappiness = Math.min(100, gameData.petHappiness + 10);
        
        petDisplay.classList.add('happy');
        setTimeout(() => petDisplay.classList.remove('happy'), 600);
        
        createHearts();
        playSound('pet');
    }
    
    // Check if petting helped wake pet
    checkHibernation();
    
    updatePetDisplay();
    saveData();
}

/**
 * Create Hearts Animation
 * 
 * Spawns 5 floating heart emojis from pet's position.
 * Staggered timing creates flowing effect.
 * 
 * @returns {void}
 */
function createHearts() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'heart-particle';
            heart.textContent = '💕';
            
            const petDisplay = document.getElementById('petDisplay');
            const rect = petDisplay.getBoundingClientRect();
            
            heart.style.left = rect.left + rect.width / 2 + (Math.random() - 0.5) * 50 + 'px';
            heart.style.top = rect.top + rect.height / 2 + 'px';
            
            document.body.appendChild(heart);
            setTimeout(() => heart.remove(), 2000);
        }, i * 100);
    }
}

/**
 * Feed Pet
 * 
 * Called when completing tasks.
 * Reduces hunger and boosts energy/happiness.
 * 
 * @returns {void}
 */
function feedPet() {
    gameData.petHunger = Math.max(0, gameData.petHunger - 20);
    gameData.petEnergy = Math.min(100, gameData.petEnergy + 10);
    gameData.petHappiness = Math.min(100, gameData.petHappiness + 5);
    updatePetDisplay();
}

/**
 * Boost Pet Energy
 * 
 * Called when completing tasks.
 * Increases energy and happiness.
 * 
 * @returns {void}
 */
function boostPetEnergy() {
    gameData.petEnergy = Math.min(100, gameData.petEnergy + 15);
    gameData.petHappiness = Math.min(100, gameData.petHappiness + 10);
    updatePetDisplay();
}

/**
 * Pet Evolution Check and Animation
 * 
 * Checks if pet should evolve and triggers evolution sequence.
 * 
 * @param {Object} newEvolution - Evolution stage object
 * @returns {void}
 */
function evolvePet(newEvolution) {
    const petDisplay = document.getElementById('petDisplay');
    petDisplay.classList.add('evolving');
    
    setTimeout(() => {
        petDisplay.classList.remove('evolving');
        updatePetDisplay();
    }, 1000);
    
    showCelebration(
        `🎊 Evolution! 🎊`,
        `Your pet evolved into ${newEvolution.name}!`,
        newEvolution.emoji
    );
    
    createConfetti();
    setTimeout(() => createConfetti(), 300);
    playSound('evolution');
}

/**
 * Check Pet Evolution
 * 
 * Determines if pet should evolve based on level.
 * 
 * @returns {void}
 */
function checkPetEvolution() {
    const currentEvolution = getPetEvolution();
    
    if (gameData.petStage < currentEvolution.stage) {
        gameData.petStage = currentEvolution.stage;
        evolvePet(currentEvolution);
    }
}

/**
 * Update Pet Needs (Stat Decay)
 * 
 * Simulates natural stat decay over time.
 * Different rates during hibernation vs. active mode.
 * Runs every 6 minutes.
 * 
 * @returns {void}
 * 
 * Normal Decay (per 6 minutes):
 * - Hunger: +2
 * - Energy: -1
 * - Happiness: -2 (if very hungry)
 * 
 * Hibernation Decay (per 6 minutes):
 * - Hunger: +2 (normal)
 * - Energy: -0.5 (slower)
 * - Happiness: -3 (faster, pet is sad)
 */
function updatePetNeeds() {
    const now = Date.now();
    const hoursSinceLastUpdate = (now - (gameData.petLastUpdate || now)) / (1000 * 60 * 60);
    
    if (hoursSinceLastUpdate > 0.1) {
        
        if (gameData.petHibernating) {
            // Hibernation decay
            gameData.petHunger = Math.min(100, gameData.petHunger + 2);
            gameData.petEnergy = Math.max(0, gameData.petEnergy - 0.5);
            
            if (gameData.petHappiness > 10) {
                gameData.petHappiness = Math.max(0, gameData.petHappiness - 3);
            }
            
        } else {
            // Normal decay
            gameData.petHunger = Math.min(100, gameData.petHunger + 2);
            gameData.petEnergy = Math.max(0, gameData.petEnergy - 1);
            
            if (gameData.petHunger > 70) {
                gameData.petHappiness = Math.max(0, gameData.petHappiness - 2);
            }
        }
        
        gameData.petLastUpdate = now;
        
        // Check if stats changed hibernation state
        checkHibernation();
        
        updatePetDisplay();
        saveData();
    }
}

// Schedule periodic updates (every 60 seconds)
setInterval(updatePetNeeds, 60000);

/* ==========================================
   ACHIEVEMENT SYSTEM
   ========================================== */

/**
 * Achievement Configuration
 * Defines all unlockable achievements
 */
const achievements = [
    { id: 'first_task', name: 'First Steps', desc: 'Complete 1 task', icon: '🌟', requirement: 1 },
    { id: 'task_5', name: 'Getting Started', desc: 'Complete 5 tasks', icon: '💪', requirement: 5 },
    { id: 'task_10', name: 'On Fire', desc: 'Complete 10 tasks', icon: '🔥', requirement: 10 },
    { id: 'task_25', name: 'Dedicated', desc: 'Complete 25 tasks', icon: '🎯', requirement: 25 },
    { id: 'task_50', name: 'Unstoppable', desc: 'Complete 50 tasks', icon: '⚡', requirement: 50 },
    { id: 'task_100', name: 'Legend', desc: 'Complete 100 tasks', icon: '👑', requirement: 100 },
    { id: 'streak_3', name: 'Habit Former', desc: '3 day streak', icon: '📅', requirement: 3, type: 'streak' },
    { id: 'streak_7', name: 'Week Warrior', desc: '7 day streak', icon: '🗓️', requirement: 7, type: 'streak' },
    { id: 'level_5', name: 'Rising Star', desc: 'Reach level 5', icon: '🌠', requirement: 5, type: 'level' },
    { id: 'level_10', name: 'Master', desc: 'Reach level 10', icon: '🏅', requirement: 10, type: 'level' },
    { id: 'level_15', name: 'Champion', desc: 'Reach level 15', icon: '🏆', requirement: 15, type: 'level' },
    { id: 'level_20', name: 'Legendary', desc: 'Reach level 20', icon: '✨', requirement: 20, type: 'level' },
    { id: 'pet_lover', name: 'Pet Lover', desc: 'Pet your buddy 10 times', icon: '💕', requirement: 10, type: 'pet' }
];

/**
 * Level Titles
 * Rank names for each level
 */
const levelTitles = [
    'Newbie Achiever',
    'Task Apprentice',
    'Quest Seeker',
    'Goal Crusher',
    'Productivity Ninja',
    'Focus Master',
    'Achievement Hunter',
    'Legendary Doer',
    'Grand Champion',
    'Productivity God'
];

/* ==========================================
   XP & LEVELING SYSTEM
   ========================================== */

/**
 * Get XP for Priority
 * Returns XP value based on task priority
 * 
 * @param {string} priority - 'low', 'medium', or 'high'
 * @returns {number} XP value
 */
function getXPForPriority(priority) {
    const xpValues = { low: 10, medium: 25, high: 50 };
    return xpValues[priority] || 25;
}

/**
 * Get XP Required for Level
 * Calculates XP needed to reach next level
 * 
 * @param {number} level - Current level
 * @returns {number} XP required
 */
function getXPForLevel(level) {
    return 100 + (level - 1) * 50;
}

/**
 * Add XP
 * Awards XP and checks for level up
 * 
 * @param {number} amount - XP to add
 * @param {HTMLElement} element - Element for animation
 * @returns {void}
 */
function addXP(amount, element) {
    gameData.xp += amount;
    gameData.totalXP += amount;
    
    showFloatingXP(amount, element);
    
    const xpNeeded = getXPForLevel(gameData.level);
    if (gameData.xp >= xpNeeded) {
        levelUp();
    }
    
    updatePlayerStats();
    playSound('xp');
}

/**
 * Level Up
 * Handles leveling up and celebrations
 * 
 * @returns {void}
 */
function levelUp() {
    gameData.xp -= getXPForLevel(gameData.level);
    gameData.level++;
    
    const is5LevelMilestone = gameData.level % 5 === 0;
    
    if (is5LevelMilestone) {
        showCelebration(
            '🎉 MEGA LEVEL UP! 🎉',
            `You reached level ${gameData.level}! Your pet is getting stronger!`,
            '⭐'
        );
        
        createConfetti();
        setTimeout(() => createConfetti(), 200);
        setTimeout(() => createConfetti(), 400);
        
        checkPetEvolution();
    } else {
        showCelebration(
            '🎉 Level Up!',
            `You reached level ${gameData.level}!`,
            '🎉'
        );
        createConfetti();
    }
    
    gameData.petHappiness = Math.min(100, gameData.petHappiness + 20);
    gameData.petEnergy = Math.min(100, gameData.petEnergy + 15);
    
    playSound('levelup');
    checkAchievements();
    updatePetDisplay();
}

/* ==========================================
   STREAK SYSTEM
   ========================================== */

/**
 * Update Streak
 * Tracks consecutive days with completed tasks
 * 
 * @returns {void}
 */
function updateStreak() {
    const today = new Date().toDateString();
    const lastDate = gameData.lastCompletedDate;
    
    if (lastDate) {
        const lastDay = new Date(lastDate).toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (lastDay === yesterday) {
            gameData.streak++;
        } else if (lastDay !== today) {
            gameData.streak = 1;
        }
    } else {
        gameData.streak = 1;
    }
    
    gameData.lastCompletedDate = today;
    checkAchievements();
}

/**
 * Check Achievements
 * Verifies if any achievements should be unlocked
 * 
 * @returns {void}
 */
function checkAchievements() {
    achievements.forEach(achievement => {
        if (!gameData.achievements[achievement.id]) {
            let unlocked = false;
            
            if (achievement.type === 'streak') {
                unlocked = gameData.streak >= achievement.requirement;
            } else if (achievement.type === 'level') {
                unlocked = gameData.level >= achievement.requirement;
            } else {
                unlocked = gameData.totalCompleted >= achievement.requirement;
            }
            
            if (unlocked) {
                unlockAchievement(achievement);
            }
        }
    });
}

/**
 * Unlock Achievement
 * Marks achievement as unlocked and celebrates
 * 
 * @param {Object} achievement - Achievement object
 * @returns {void}
 */
function unlockAchievement(achievement) {
    gameData.achievements[achievement.id] = true;
    
    showCelebration(
        `🏆 Achievement Unlocked!`,
        achievement.name,
        achievement.icon
    );
    
    createConfetti();
    playSound('achievement');
    renderAchievements();
    
    gameData.petHappiness = Math.min(100, gameData.petHappiness + 15);
    updatePetDisplay();
    
    saveData();
}

/**
 * Render Achievements
 * Generates HTML for achievement grid
 * 
 * @returns {void}
 */
function renderAchievements() {
    const grid = document.getElementById('achievementGrid');
    grid.innerHTML = achievements.map(a => {
        const unlocked = gameData.achievements[a.id];
        return `
            <div class="achievement ${unlocked ? 'unlocked' : 'locked'}" title="${a.desc}">
                <div class="achievement-icon">${a.icon}</div>
                <div class="achievement-name">${a.name}</div>
                <div class="achievement-desc">${a.desc}</div>
            </div>
        `;
    }).join('');
}

/* ==========================================
   TASK MANAGEMENT
   ========================================== */

/**
 * Add Task
 * Creates new task from user input
 * 
 * @returns {void}
 */
function addTask() {
    const input = document.getElementById('taskInput');
    const priority = document.getElementById('prioritySelect').value;
    const text = input.value.trim();

    if (text === '') {
        alert('Please enter a task!');
        return;
    }

    const task = {
        id: Date.now(),
        text: text,
        priority: priority,
        completed: false,
        xp: getXPForPriority(priority)
    };
    
    tasks.push(task);
    input.value = '';
    
    saveData();
    renderTasks();
}

/**
 * Toggle Task
 * Marks task as complete and awards rewards.
 * Blocked if pet is hibernating!
 * 
 * @param {number} id - Task ID
 * @param {HTMLElement} element - Task element
 * @returns {void}
 * 
 * Hibernation Check:
 * If pet is hibernating, shows warning and blocks completion.
 * This motivates player to help pet recover.
 */
function toggleTask(id, element) {
    const task = tasks.find(t => t.id === id);
    
    // Block tasks if pet is hibernating
    if (gameData.petHibernating) {
        showCelebration(
            '😴 Pet is Sleeping!',
            'Your pet is hibernating and too tired to help with tasks. Pet them to help restore energy!',
            '💤'
        );
        
        playSound('hibernate');
        return;
    }
    
    if (!task.completed) {
        task.completed = true;
        gameData.totalCompleted++;
        
        element.classList.add('completing');
        setTimeout(() => element.classList.remove('completing'), 500);
        
        addXP(task.xp, element);
        updateStreak();
        checkAchievements();
        
        feedPet();
        boostPetEnergy();
        
        // Check if energy changes affect hibernation
        checkHibernation();
        
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveData();
            renderTasks();
        }, 500);
    }
    
    saveData();
}

/**
 * Delete Task
 * Removes task without awarding XP
 * 
 * @param {number} id - Task ID
 * @returns {void}
 */
function deleteTask(id) {
    if (confirm('Delete this quest?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveData();
        renderTasks();
    }
}

/**
 * Render Tasks
 * Generates HTML for task list
 * 
 * @returns {void}
 */
function renderTasks() {
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const activeTasks = tasks.filter(t => !t.completed);

    if (activeTasks.length === 0) {
        taskList.innerHTML = '';
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        taskList.innerHTML = activeTasks.map(task => `
            <li class="task-item" id="task-${task.id}">
                <input 
                    type="checkbox" 
                    class="task-checkbox"
                    onchange="toggleTask(${task.id}, document.getElementById('task-${task.id}'))"
                >
                <span class="task-text">${task.text}</span>
                <span class="xp-badge">+${task.xp} XP</span>
                <span class="priority-badge priority-${task.priority}">
                    ${task.priority === 'high' ? '🔥' : task.priority === 'medium' ? '⚡' : '📌'} 
                </span>
                <button class="btn-small btn-delete" onclick="deleteTask(${task.id})">
                    🗑️
                </button>
            </li>
        `).join('');
    }
    
    updateStats();
}

/**
 * Update Stats
 * Updates stat card displays
 * 
 * @returns {void}
 */
function updateStats() {
    document.getElementById('totalTasks').textContent = tasks.filter(t => !t.completed).length;
    
    const today = new Date().toDateString();
    const todayCompleted = tasks.filter(t => 
        t.completed && new Date(t.completedDate).toDateString() === today
    ).length;
    
    document.getElementById('todayCompleted').textContent = todayCompleted;
}

/**
 * Update Player Stats
 * Refreshes level, XP, and streak displays
 * 
 * @returns {void}
 */
function updatePlayerStats() {
    const xpNeeded = getXPForLevel(gameData.level);
    const xpPercent = (gameData.xp / xpNeeded) * 100;
    
    document.getElementById('playerLevel').textContent = gameData.level;
    document.getElementById('levelTitle').textContent = 
        levelTitles[Math.min(gameData.level - 1, levelTitles.length - 1)];
    
    document.getElementById('xpBar').style.width = xpPercent + '%';
    document.getElementById('xpText').textContent = `${gameData.xp} / ${xpNeeded} XP`;
    
    document.getElementById('streakDays').textContent = gameData.streak;
    document.getElementById('totalCompleted').textContent = gameData.totalCompleted;
    document.getElementById('totalXP').textContent = gameData.totalXP;
    
    document.getElementById('soundToggle').textContent = gameData.soundEnabled ? '🔊' : '🔇';
}

/* ==========================================
   VISUAL EFFECTS
   ========================================== */

/**
 * Create Confetti
 * Spawns 50 falling colored particles
 * 
 * @returns {void}
 */
function createConfetti() {
    const colors = ['#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#ffeaa7', '#fdcb6e'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 5000);
        }, i * 30);
    }
}

/**
 * Show Floating XP
 * Creates rising "+XP" text
 * 
 * @param {number} amount - XP amount
 * @param {HTMLElement} element - Origin element
 * @returns {void}
 */
function showFloatingXP(amount, element) {
    const floatingXP = document.createElement('div');
    floatingXP.className = 'floating-xp';
    floatingXP.textContent = `+${amount} XP`;
    
    const rect = element.getBoundingClientRect();
    floatingXP.style.position = 'fixed';
    floatingXP.style.left = rect.left + rect.width / 2 + 'px';
    floatingXP.style.top = rect.top + 'px';
    
    document.body.appendChild(floatingXP);
    setTimeout(() => floatingXP.remove(), 1000);
}

/**
 * Show Celebration
 * Displays full-screen popup
 * 
 * @param {string} title - Popup title
 * @param {string} text - Popup text
 * @param {string} icon - Large emoji
 * @returns {void}
 */
function showCelebration(title, text, icon = '🎉') {
    document.getElementById('celebrationIcon').textContent = icon;
    document.getElementById('celebrationTitle').textContent = title;
    document.getElementById('celebrationText').textContent = text;
    document.getElementById('celebrationOverlay').style.display = 'flex';
}

/**
 * Close Celebration
 * Hides popup overlay
 * 
 * @returns {void}
 */
function closeCelebration() {
    document.getElementById('celebrationOverlay').style.display = 'none';
}

/* ==========================================
   SOUND SYSTEM
   ========================================== */

/**
 * Play Sound
 * Generates procedural audio using Web Audio API
 * 
 * @param {string} type - Sound type ('xp', 'levelup', 'achievement', 'pet', 'evolution', 'hibernate')
 * @returns {void}
 */
function playSound(type) {
    if (!gameData.soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'xp') {
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        
    } else if (type === 'levelup') {
        oscillator.frequency.value = 523.25;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        oscillator.start(audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioContext.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.stop(audioContext.currentTime + 0.3);
        
    } else if (type === 'achievement') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.2);
            osc.start(audioContext.currentTime + i * 0.1);
            osc.stop(audioContext.currentTime + i * 0.1 + 0.2);
        });
        
    } else if (type === 'pet') {
        oscillator.frequency.value = 1000;
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
        
    } else if (type === 'evolution') {
        [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.25);
            osc.start(audioContext.currentTime + i * 0.15);
            osc.stop(audioContext.currentTime + i * 0.15 + 0.25);
        });
        
    } else if (type === 'hibernate') {
        // Sad descending tone
        oscillator.frequency.value = 1046.50;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        oscillator.start(audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(523.25, audioContext.currentTime + 0.4);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.stop(audioContext.currentTime + 0.4);
    }
}

/**
 * Toggle Sound
 * Switches sound on/off
 * 
 * @returns {void}
 */
function toggleSound() {
    gameData.soundEnabled = !gameData.soundEnabled;
    document.getElementById('soundToggle').textContent = gameData.soundEnabled ? '🔊' : '🔇';
    saveData();
}

/* ==========================================
   DATA PERSISTENCE
   ========================================== */

/**
 * Save Data
 * Persists game state to localStorage
 * 
 * @returns {void}
 */
function saveData() {
    localStorage.setItem('taskQuestData', JSON.stringify(gameData));
    localStorage.setItem('taskQuestTasks', JSON.stringify(tasks));
}

/* ==========================================
   INITIALIZATION
   ========================================== */

// Initialize app on load
renderTasks();
updatePlayerStats();
renderAchievements();
updatePetDisplay();
updatePetNeeds();
checkPetEvolution();

/**
 * END OF APPLICATION
 * 
 * Hibernation System Summary:
 * 
 * When energy reaches 0:
 * - Pet enters hibernation (falls asleep)
 * - Visual changes (sleeping emoji, grayscale, breathing animation)
 * - Tasks are blocked (cannot complete until recovery)
 * - Pet becomes sad (happiness -30)
 * 
 * Recovery Methods:
 * - Pet them (+5 energy per pet, 10s cooldown)
 * - Wait for natural recovery (slow)
 * - Need 20 energy to wake up
 * 
 * Wake-up:
 * - Celebration popup and confetti
 * - Happiness boost (+20)
 * - Tasks enabled again
 * 
 * This creates gameplay consequence and motivates regular task completion!
 */