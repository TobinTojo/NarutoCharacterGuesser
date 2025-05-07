import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Initialize Firebase
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};


const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

document.addEventListener('DOMContentLoaded', () => {
            // Fetch your API_KEY
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    
    // DOM element references
    const searchBar = document.getElementById('searchBar');
    const guessButton = document.getElementById('guessButton'); // Added guessButton
    const autocomplete = document.getElementById('autocomplete');
    const results = document.getElementById('results');
    const message = document.getElementById('message');
    const playAgainButton = document.getElementById('playAgain');
    const statsButton = document.getElementById('statsButton');
    const aboutButton = document.getElementById('aboutButton');
    const statsDiv = document.getElementById('stats');
    const closeStatsButton = document.getElementById('closeStats');
    const gamesPlayedSpan = document.getElementById('gamesPlayed');
    const currentStreakSpan = document.getElementById('currentStreak');
    const longestStreakSpan = document.getElementById('longestStreak');
    const winPercentageSpan = document.getElementById('winPercentage');
    const guessDistributionUl = document.getElementById('guessDistribution');
    const characterImageContainer = document.getElementById('characterImageContainer');
    const popup = document.getElementById('popup');
    const popupImageContainer = document.getElementById('popupImageContainer');
    const popupMessage = document.getElementById('popupMessage');
    const chatacterMessage = document.getElementById('characterMessage');
    const popupCharacterName = document.getElementById('popupCharacterName');
    const playAgainPopup = document.getElementById('playAgainPopup');
    const closePopup = document.getElementById('closePopup');
    const helpButton = document.getElementById('helpButton');
    const helpDiv = document.getElementById('help');
    const aboutDiv = document.getElementById('about-popup');
    const closeHelpButton = document.getElementById('closeHelp');
    const closeAboutButton = document.getElementById('closeAbout');
    const charactersButton = document.getElementById('characterButton');
    const charactersPopup = document.getElementById('charactersPopup');
    const closeCharactersButton = document.getElementById('closeCharacters');
    const charactersGrid = document.getElementById('charactersGrid');
    const phrases = [
        "Welcome to Narutle!",
        "Try to guess the correct character within 8 attempts!",
        "If there’s no arrow for age or height, the category is unknown.",
        "Stuck? Choose a random character to start!",
    ];
    
    const typingSpeed = 100; // Speed of typing effect in milliseconds
    const deletingSpeed = 50; // Speed of deleting effect in milliseconds
    const pauseDuration = 2000; // Duration to pause after typing a phrase
    // Get references to the elements by their IDs
const labelRank = document.getElementById('label-rank');
const labelVillage = document.getElementById('label-village');
const labelHeight = document.getElementById('label-height');
const labelAge = document.getElementById('label-age');
const labelClan = document.getElementById('label-clan');
const labelChakra = document.getElementById('label-chakra');
const labelStatus = document.getElementById('label-status');
const labelGender = document.getElementById('label-gender');

let targetInfo = null;

    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isTyping = true;
    const typingContainer = document.getElementById('typing-container');
    
    let characters = [];
    let targetCharacter = null;
    let guessedCharacters = new Set();
    let gameWon = false;
    let guesses = 0;

    const stats = {
        gamesPlayed: 0,
        currentStreak: 0,
        longestStreak: 0,
        wins: 0,
        guessDistribution: Array(8).fill(0)
    };
    
    type();
    loadStats();

    fetch('names.txt')
    .then(response => response.text())
    .then(data => {
        // Split the data by new lines and map each line to an object with name and empty properties
        characters = data.split('\n').map(line => {
            const name = line.trim(); // Remove any extra whitespace
            const normalizedName = normalizeString(name); // Normalize name
            return { 
                name,
                normalizedName, // Store normalized name
                rank: '',         // Placeholder for rank
                village: '',      // Placeholder for village
                height: '',       // Placeholder for height
                age: '',          // Placeholder for age
                clan: '',         // Placeholder for clan
                abilities: '',    // Placeholder for abilities
                status: '',       // Placeholder for status
                gender: '',        // Placeholder for gender
                imageUrl: '',
                debut: ''
            };
        }).filter(character => character.name); // Filter out any empty names

        // Load character data from Firebase
      loadCharacterData().then(() => {
        // Pick a random character from the list
        targetCharacter = characters[Math.floor(Math.random() * characters.length)];
        setTargetCharacter();
        console.log(targetCharacter.name);
        searchBar.disabled = false;
        showAllNames();
      });
    })
    .catch(error => console.error('Error fetching names:', error));

    
  // New Firebase data loading function
  async function loadCharacterData() {
    const promises = characters.map(async (character) => {
      try {
        const docRef = doc(db, "Naruto Characters", character.name);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          character.rank = data.Rank || 'Unknown';
          character.village = data.Village || 'Unknown';
          character.height = data.Height ? cmToFeetAndInches(data.Height) : 'Unknown';
          character.age = data.Age || 'Unknown';
          character.abilities = Array.isArray(data.Chakra) ? data.Chakra.join(', ') : 'None';
          character.clan = data.Clan || 'None';
          character.status = data.Status || 'Alive';
          character.gender = data.Gender || 'Unknown';
          character.imageUrl = data.Picture || '';
          character.debut = data.Debut || 'Unknown';
          console.log(data);
        }
      } catch (error) {
        console.error(`Error loading data for ${character.name}:`, error);
      }
    });

    await Promise.all(promises);
  }

  // Updated setTargetCharacter function for Firebase
  async function setTargetCharacter() {
    try {
      const docRef = doc(db, "Naruto Characters", targetCharacter.name);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        targetCharacter.rank = data.Rank || 'Unknown';
        targetCharacter.village = data.Village || 'Unknown';
        targetCharacter.height = data.Height ? cmToFeetAndInches(data.Height) : 'Unknown';
        targetCharacter.age = data.Age || 'Unknown';
        targetCharacter.abilities = Array.isArray(data.Chakra) ? data.Chakra.join(', ') : 'None';
        targetCharacter.clan = data.Clan || 'None';
        targetCharacter.status = data.Status || 'Alive';
        targetCharacter.gender = data.Gender || 'Unknown';
        targetCharacter.imageUrl = data.Picture || '';
        
        // Store the raw data for the fun fact generator
        targetInfo = JSON.stringify(data.Fact);
      }
    } catch (error) {
      console.error("Error getting target character:", error);
    }
  }

    searchBar.addEventListener('input', () => {
        const searchTerm = normalizeString(searchBar.value);
        autocomplete.innerHTML = '';
    
        if (searchTerm.trim() === '') {
            showAllNames(); // Show all names if search bar is empty
        } else {
            const filteredCharacters = characters.filter(character =>
                normalizeString(character.name).includes(searchTerm) && !guessedCharacters.has(character.name)
            );
            filteredCharacters.forEach(character => {
                const li = document.createElement('li');
                const img = document.createElement('img');
                img.src = character.imageUrl;
                img.alt = character.name;
                li.appendChild(img);

                const span = document.createElement('span');
                span.textContent = character.name;
                li.appendChild(span);
                li.addEventListener('click', () => {
                    searchBar.value = character.name;
                    autocomplete.innerHTML = '';
                });
                autocomplete.appendChild(li);
            });
        }
    });
    
    function type() {
        if (isTyping) {
            typingContainer.textContent += phrases[currentPhraseIndex][currentCharIndex];
            currentCharIndex++;
            if (currentCharIndex >= phrases[currentPhraseIndex].length) {
                isTyping = false;
                setTimeout(deleteText, pauseDuration);
            } else {
                setTimeout(type, typingSpeed);
            }
        }
    }
    
    async function run() {
        const result = await model.generateContent([
          `In 20 words, make a fun fact about ${targetCharacter.name} from Naruto. Use only information from this ${targetInfo}. ONLY talk about one of the following for the fun fact: height, family, jutsus, bloodtype, kekkeiGenkai, affiliation, titles, tools. unique traits, classification.`
        ]);
        characterMessage.innerHTML = result.response.text();
      }
    
    function deleteText() {
        if (!isTyping) {
            typingContainer.textContent = typingContainer.textContent.slice(0, -1);
            if (typingContainer.textContent.length === 0) {
                isTyping = true;
                currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                currentCharIndex = 0;
                setTimeout(type, typingSpeed);
            } else {
                setTimeout(deleteText, deletingSpeed);
            }
        }
    }

    function normalizeString(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }
    

    
    function cmToFeetAndInches(cm) {
        const totalInches = cm / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return `${feet}'${inches}"`;
    }
    
      // Updated handleGuess function for Firebase
  async function handleGuess() {
    if (gameWon || guesses >= 8) return;

    const searchTerm = normalizeString(searchBar.value);
    const filteredCharacters = characters.filter(character =>
      normalizeString(character.name) === searchTerm
    );

    if (filteredCharacters.length > 0) {
      const character = filteredCharacters[0];
      guessedCharacters.add(character.name);
      guesses++;

      const guessesCount = document.getElementById('guessesCount');
      guessesCount.textContent = `${8 - guesses}/8`;

      if (character.name === targetCharacter.name) {
        message.textContent = 'You guessed the right character!';
        gameWon = true;
        searchBar.disabled = true;
        playAgainButton.style.display = 'block';
        updateStats(true);
        showPopup();
      } else if (guesses >= 8) {
        message.textContent = `Game Over! The character was ${targetCharacter.name}.`;
        searchBar.disabled = true;
        playAgainButton.style.display = 'block';
        updateStats(false);
        showPopup();
      }

      // Create a new list item for the result
      const li = document.createElement('li');
      li.innerHTML = `
        <div><img src="${character.imageUrl}" alt="${character.name}"></div>
        <div class="${getClass(character.name, targetCharacter.name)}">${character.name}</div>
        <div class="${getClass(character.rank, targetCharacter.rank)}">${character.rank}</div>
        <div class="${getClass(character.village, targetCharacter.village)}">${convertVillageName(character.village)}</div>
        <div class="${getClass(character.height, targetCharacter.height, 'height')}">${character.height} ${getArrowHeight(character.height, targetCharacter.height)}</div>
        <div class="${getClass(character.age, targetCharacter.age, 'age')}">${character.age} ${getArrow(character.age, targetCharacter.age)}</div>
        <div class="${getClanClass(character.clan, targetCharacter.clan)}">${character.clan}</div>
        <div class="${getChakraClass(character.abilities, targetCharacter.abilities)}">${character.abilities}</div>
        <div class="${getClass(character.status, targetCharacter.status)}">${character.status}</div>
        <div class="${getClass(character.gender, targetCharacter.gender)}">${character.gender}</div>
      `;
      results.appendChild(li);

      searchBar.value = '';
      showAllNames();
    }
  }
    // Add event listener for the guess button
    guessButton.addEventListener('click', handleGuess);

    searchBar.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleGuess(); // Handle guess when Enter key is pressed
        }
    });

    playAgainButton.addEventListener('click', () => {
        location.reload();
    });

    statsButton.addEventListener('click', () => {
        statsDiv.style.display = 'block';
        displayStats();
    });

    document.getElementById("mobileStats").addEventListener("click", () => {
        document.getElementById("stats").style.display = "block";
        displayStats();
    });
    document.getElementById("mobileHelp").addEventListener("click", () => {
        helpDiv.style.display = 'block';
    });
    document.getElementById("mobileAbout").addEventListener("click", () => {
        document.getElementById("about-popup").style.display = "block";
    });
    document.getElementById("mobileCharacters").addEventListener("click", () => {
        charactersGrid.innerHTML = '';
        characters.forEach(character => {
            const div = document.createElement('div');
            div.innerHTML = `
                <img src="${character.imageUrl || 'placeholder.jpg'}" alt="${character.name}">
                <div>
                    ${character.name}
                    <span style="display:block;"><b class="debut-text">Debut Episode: </b>${character.debut}</span>
                </div>
            `;
            charactersGrid.appendChild(div);
        });
        document.getElementById("charactersPopup").style.display = "flex";
    });
    
    
    closeStatsButton.addEventListener('click', () => {
        statsDiv.style.display = 'none';
    });
    document.getElementById("closeStatsMobile").addEventListener("click", () => {
        statsDiv.style.display = 'none';
    });

    function showAllNames() {
        autocomplete.innerHTML = '';
        const placeholderImage = 'path/to/placeholder-image.png'; // Path to placeholder image
    
        const sortedCharacters = characters.filter(character => !guessedCharacters.has(character.name))
                                           .sort((a, b) => a.name.localeCompare(b.name));
    
        sortedCharacters.forEach(character => {
            const li = document.createElement('li');
            const img = document.createElement('img');
            img.src = character.imageUrl || placeholderImage; // Use placeholder if imageUrl is not available
            img.alt = character.name;
            li.appendChild(img);
    
            const span = document.createElement('span');
            span.textContent = character.name;
            li.appendChild(span);
            li.addEventListener('click', () => {
                searchBar.value = character.name;
                autocomplete.innerHTML = '';
            });
            autocomplete.appendChild(li);
        });
    }
    
    function showPopup() {
    console.log("Shown");
    popupCharacterName.innerHTML = `<h2>${targetCharacter.name}</h2>`;
    labelRank.textContent = targetCharacter.rank;
    labelVillage.textContent = convertVillageName(targetCharacter.village);
    labelHeight.textContent = targetCharacter.height;
    labelAge.textContent = targetCharacter.age;
    labelClan.textContent = targetCharacter.clan;
    labelChakra.textContent = targetCharacter.abilities;
    labelStatus.textContent = targetCharacter.status;
    labelGender.textContent = targetCharacter.gender;
    popupImageContainer.innerHTML = ''; // Clear previous image
    run();

    if (targetCharacter.imageUrl) {
        const img = document.createElement('img');
        img.src = targetCharacter.imageUrl;
        img.alt = 'Character Image';
        img.style.width = '500px'; // Set width to 500 pixels
        img.style.height = 'auto'; // Maintain aspect ratio
        popupImageContainer.appendChild(img);
    } else {
        popupImageContainer.textContent = 'Image not found.';
    }

    // Display the message and number of tries
    if (gameWon) {
        popupMessage.innerHTML = `You guessed the right character in <span class="number-of-tries">${guesses}</span> guesses!`;
    } else {
        popupMessage.innerHTML = `You did not guess the character correctly. The character was ${targetCharacter.name}.`;
    }

    // Calculate the current rank based on the number of wins
    const currentRank = getCurrentRank(stats.wins);
    const nextRank = getNextRank(currentRank);

    // Calculate wins needed for the next rank
    const winsNeeded = getWinsToNextRank(nextRank);

    // Update progress bar
    const progressBar = document.getElementById('progress');
    const progressText = document.getElementById('winsToNextRank');

    const temporaryRank = document.getElementById('currentRank');

    // Calculate progress percentage
    const progressPercentage = (stats.wins / (stats.wins + winsNeeded)) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    progressText.textContent = winsNeeded;
    temporaryRank.textContent = currentRank;

    // Show the popup
    popup.style.display = 'block';

    playAgainPopup.onclick = () => {
        location.reload();
    };

    closePopup.onclick = () => {
        popup.style.display = 'none';
    };
}

    
function getCurrentRank(wins) {
    // Define the rank thresholds
    const rankThresholds = [
        { rank: 'Genin 3', threshold: 0 },
        { rank: 'Genin 2', threshold: 10 },
        { rank: 'Genin 1', threshold: 30 },
        { rank: 'Chunin 3', threshold: 50 },
        { rank: 'Chunin 2', threshold: 80 },
        { rank: 'Chunin 1', threshold: 110 },
        { rank: 'Jonin 3', threshold: 140 },
        { rank: 'Jonin 2', threshold: 180 },
        { rank: 'Jonin 1', threshold: 220 },
        { rank: 'Kage 3', threshold: 250 }
    ];

    // Determine the current rank based on wins
    for (let i = rankThresholds.length - 1; i >= 0; i--) {
        if (wins >= rankThresholds[i].threshold) {
            return rankThresholds[i].rank;
        }
    }
    return 'Genin 3'; // Default rank
}

function getNextRank(currentRank) {
    console.log(currentRank);
    const rankThresholds = [
        'Genin 3', 'Genin 2', 'Genin 1', 'Chunin 3', 'Chunin 2', 'Chunin 1', 'Jonin 3', 'Jonin 2', 'Jonin 1'
    ];
    
    const index = rankThresholds.indexOf(currentRank);
    return index >= 0 ? rankThresholds[index + 1] : null; // Get the next rank
}

function getWinsToNextRank(nextRank) {
    if (!nextRank) return 0;

    // Define the rank thresholds
    const rankThresholds = {
        'Jonin 1': 220,
        'Jonin 2': 180,
        'Jonin 3': 140,
        'Chunin 1': 110,
        'Chunin 2': 80,
        'Chunin 3': 50,
        'Genin 1': 30,
        'Genin 2': 10,
        'Genin 3': 0
    };
    console.log(nextRank);
    // Get the threshold for the next rank
    const nextRankThreshold = rankThresholds[nextRank] || 0;
    
    // Calculate how many more wins are needed to reach the next rank
    return Math.max(0, nextRankThreshold - stats.wins);
}

    function getClass(value, targetValue, type) {
        // Convert both values to strings for comparison
        const strValue = String(value);
        const strTargetValue = String(targetValue);
        
        if (strValue === strTargetValue) {
            return 'correct';
        } 
        else if (type === 'height') {
            const heightDiff = compareHeights(strValue, strTargetValue);
            if (heightDiff <= 2 && heightDiff >= -2) {
                return 'similar';
            }
        } 
        else if (type === 'age') {
            // Convert to numbers for age comparison
            const numValue = parseInt(strValue.replace(' years old', '')) || 0;
            const numTargetValue = parseInt(strTargetValue.replace(' years old', '')) || 0;
            if (Math.abs(numValue - numTargetValue) <= 2) {
                return 'similar';
            }
        }
        return '';
    }

    function getClanClass(personalClan, targetClan) {
        // Helper function to clean clan names by removing certain terms
        const cleanClanName = name => name.replace(/\bClan\b/i, '').trim();
    
        // Helper function to convert to arrays and clean names
        const convertAndClean = value => {
            if (Array.isArray(value)) {
                return value.map(cleanClanName);
            }
            return [cleanClanName(value)];
        };
    
        // Convert and clean clans, then create sets
        const personalClanSet = new Set(convertAndClean(personalClan));
        const targetClanSet = new Set(convertAndClean(targetClan));
    
        console.log(personalClanSet);
        console.log(targetClanSet);
    
        // Check for a full match
        if (personalClanSet.size === targetClanSet.size && [...personalClanSet].every(clan => targetClanSet.has(clan))) {
            return 'correct'; // Full match
        }
    
        // Check for a partial match
        for (let clan of targetClanSet) {
            if (personalClanSet.has(clan)) {
                return 'similar'; // Partial match
            }
        }
    
        return 'no'; // No match
    }

    function convertVillageName(romanizedName) {
        const villageMap = {
            'Konohagakure': 'Hidden Leaf Village',
            'Sunagakure': 'Hidden Sand Village',
            'Kirigakure': 'Hidden Mist Village',
            'Kumogakure': 'Hidden Cloud Village',
            'Iwagakure': 'Hidden Stone Village',
            'Amegakure': 'Hidden Rain Village',
            'Otogakure': 'Hidden Sound Village',
            'Takigakure': 'Hidden Waterfall Village',
            'Kusagakure': 'Hidden Grass Village',
            'Tetsu no Kuni': 'Land of Iron',
            'Yu no Kuni': 'Land of Hot Water',
            'Nami no Kuni': 'Land of Waves',
            'Ta no Kuni': 'Land of Rice Fields',
            'Hoshigakure': 'Hidden Star Village',
            'Kuma no Kuni': 'Land of Bears',
            'Tori no Kuni': 'Land of Birds'
        };
    
        return villageMap[romanizedName] || romanizedName; // Return English name if found, otherwise return original
    }
    
    function getChakraClass(abilities, targetAbilities) {
        // Convert string inputs to arrays, split by comma if needed
        const processAbilities = input => {
            if (Array.isArray(input)) return input.map(a => a.trim().toLowerCase());
            if (typeof input === 'string') return input.split(/,|and/).map(a => a.trim().toLowerCase());
            return [];
        };
    
        const processedAbilities = processAbilities(abilities);
        const processedTarget = processAbilities(targetAbilities);
    
        const abilitiesSet = new Set(processedAbilities);
        const targetAbilitiesSet = new Set(processedTarget);
    
        console.log("Abilities:", processedAbilities);
        console.log("Target:", processedTarget);
    
        if (abilitiesSet.size === targetAbilitiesSet.size && 
            [...abilitiesSet].every(ability => targetAbilitiesSet.has(ability))) {
            return 'correct';
        }
    
        // Check for any intersection between the two sets
        const intersection = [...abilitiesSet].filter(ability => targetAbilitiesSet.has(ability));
        if (intersection.length > 0) return 'similar';
    
        return 'no';
    }

    function compareHeights(height1, height2) {
        const parseHeight = (height) => {
            if (typeof height === 'number') return height; // Already in cm
            if (!height || height === 'Unknown') return 0;
            const [feet, inches] = height.split("'").map(part => part.replace('"', '').trim());
            return (parseInt(feet) || 0) * 12 + (parseInt(inches) || 0);
        };
    
        return parseHeight(height1) - parseHeight(height2);
    }

    function getArrow(value, targetValue) {
        if (!value || !targetValue || value === 'Unknown' || targetValue === 'Unknown') return '';
        
        // Handle both string and number inputs
        const numValue = typeof value === 'number' ? value : parseInt(String(value).replace(/[^0-9]/g, '')) || 0;
        const numTargetValue = typeof targetValue === 'number' ? targetValue : parseInt(String(targetValue).replace(/[^0-9]/g, '')) || 0;
        
        if (numValue < numTargetValue) return '↑';
        if (numValue > numTargetValue) return '↓';
        return '';
    }

    function getArrowHeight(value, targetValue) {
        // Helper function to convert height string to total inches
        const parseHeight = (height) => {
            // Handle case where height may be undefined or invalid
            if (!height) return 0;
    
            // Split the height string by feet and inches
            const [feet, inches] = height.split("'").map(part => part.replace('"', '').trim());
            return (parseInt(feet) || 0) * 12 + (parseInt(inches) || 0); // Convert to total inches
        };
    
        const valueInInches = parseHeight(value);
        const targetValueInInches = parseHeight(targetValue);
    
        // Determine which height is larger and return the appropriate arrow
        if (valueInInches < targetValueInInches) {
            return '↑'; // Indicates that the current value is less than the target
        } else if (valueInInches > targetValueInInches) {
            return '↓'; // Indicates that the current value is greater than the target
        } else {
            return ''; // Indicates that the current value is equal to the target
        }
    }
    

    charactersButton.addEventListener('click', () => {
        charactersGrid.innerHTML = '';
        characters.forEach(character => {
            const div = document.createElement('div');
            div.innerHTML = `
                <img src="${character.imageUrl || 'placeholder.jpg'}" alt="${character.name}">
                <div>
                    ${character.name}
                    <span style="display:block;"><b class="debut-text">Debut Episode: </b>${character.debut}</span>
                </div>
            `;
            charactersGrid.appendChild(div);
        });
        charactersPopup.style.display = 'flex';
    });

    // Close Characters Popup
    closeCharactersButton.addEventListener('click', () => {
        charactersPopup.style.display = 'none';
    });
    document.getElementById("closeCharactersMobile").addEventListener("click", () => {
        charactersPopup.style.display = 'none';
    });

    function loadStats() {
        const savedStats = JSON.parse(localStorage.getItem('narutoCharacterGuessStats'));
        if (savedStats) {
            Object.assign(stats, savedStats);
        }
        updateRankSection(); // Update rank section when stats are loaded
    }

    function saveStats() {
        localStorage.setItem('narutoCharacterGuessStats', JSON.stringify(stats));
    }

    function updateStats(won) {
        stats.gamesPlayed++;
        if (won) {
            stats.wins++;
            stats.currentStreak++;
            if (stats.currentStreak > stats.longestStreak) {
                stats.longestStreak = stats.currentStreak;
            }
        } else {
            stats.currentStreak = 0;
        }
        const adjustedGuesses = Math.max(0, guesses - 1); // Ensure guesses don't go below 0

        stats.guessDistribution[Math.min(adjustedGuesses, 7)]++;
        stats.rank = calculateRank(); // Update rank based on current stats
        saveStats();
    }

    function displayStats() {
        gamesPlayedSpan.textContent = stats.gamesPlayed;
        currentStreakSpan.textContent = stats.currentStreak;
        longestStreakSpan.textContent = stats.longestStreak;
        winPercentageSpan.textContent = ((stats.wins / stats.gamesPlayed) * 100).toFixed(2) + '%';
    
        // Update the histogram
        const maxGuesses = Math.max(...stats.guessDistribution);
        stats.guessDistribution.forEach((count, index) => {
            const bar = document.getElementById(`guess${index + 1}`);
            if (bar) {
                const height = (count / maxGuesses) * 100 || 0; // Calculate height as a percentage
                bar.style.height = `${height}%`;
            }
        });
    
        updateRankSection(); // Update rank section when stats are displayed
    }
    
    function calculateRank() {
        if (stats.wins >= 220) return 'Jonin 1';
        if (stats.wins >= 180) return 'Jonin 2';
        if (stats.wins >= 140) return 'Jonin 3';
        if (stats.wins >= 110) return 'Chunin 1';
        if (stats.wins >= 80) return 'Chunin 2';
        if (stats.wins >= 50) return 'Chunin 3';
        if (stats.wins >= 30) return 'Genin 1';
        if (stats.wins >= 10) return 'Genin 2';
        return 'Genin 3'; // Default rank
    }

    // Update rank section with the current rank
    function updateRankSection() {
        const rankImage = document.getElementById('rankImage');
        const rankHeader = document.getElementById('rankHeader');
        
        let imageUrl = '';
        let rankName = stats.rank || 'Genin 3'; // Default rank if not defined

        if (rankName.startsWith('Genin')) {
            imageUrl = 'images/genin.png'; // Update with your image path
        } else if (rankName.startsWith('Chunin')) {
            imageUrl = 'images/chunin.png'; // Update with your image path
        } else if (rankName.startsWith('Jonin')) {
            imageUrl = 'images/jonin.png'; // Update with your image path
        } else {
            imageUrl = 'images/default.png'; // Fallback image
        }

        if (rankImage) rankImage.src = imageUrl;
        if (rankHeader) rankHeader.textContent = `Rank: ${rankName}`;
    }


    // Help button functionality
    helpButton.addEventListener('click', () => {
        helpDiv.style.display = 'block';
    });

    closeHelpButton.addEventListener('click', () => {
        helpDiv.style.display = 'none';
    });

    document.getElementById("closeHelpMobile").addEventListener("click", () => {
        helpDiv.style.display = 'none';
    });

    aboutButton.addEventListener('click', () => {
        aboutDiv.style.display = 'block';
    });

    closeAboutButton.addEventListener('click', () => {
        aboutDiv.style.display = 'none';
    });
    document.getElementById("closeAboutMobile").addEventListener("click", () => {
        aboutDiv.style.display = 'none';
    });
    
});