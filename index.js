import { GoogleGenerativeAI } from "@google/generative-ai";

document.addEventListener('DOMContentLoaded', () => {
            // Fetch your API_KEY
            const API_KEY = "AIzaSyANHT-WT6qXLhpaHBHdt1J9YaCv72St48c";
  
            // Access your API key (see "Set up your API key" above)
            const genAI = new GoogleGenerativeAI(API_KEY);
      
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

        // Load character images
        loadCharacterImages();

        // Pick a random character from the list
        targetCharacter = characters[Math.floor(Math.random() * characters.length)];

        // Update the target character and perform necessary operations
        setTargetCharacter();
        console.log(targetCharacter.name);
        searchBar.disabled = false;
        showAllNames(); // Show all names initially
    })
    .catch(error => console.error('Error fetching names:', error));


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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
    
    function extractLastTwoCharactersOfAge(age) {
        if (age) {
            // Return the last two characters of the age string
            return age.slice(-2).trim();
        }
        return 'Unknown'; // Return 'Unknown' if age is not available
    } 
    
    function formatDataToText(data) {
        return `
            ID: ${data.id ?? 'Unknown'}
            Name: ${data.name ?? 'Unknown'}
            Images: ${Array.isArray(data.images) && data.images.length > 0 ? data.images.join(', ') : 'Unknown'}
            Debut:
                Manga: ${data.debut?.manga ?? 'Unknown'}
                Anime: ${data.debut?.anime ?? 'Unknown'}
                Novel: ${data.debut?.novel ?? 'Unknown'}
                Movie: ${data.debut?.movie ?? 'Unknown'}
                Game: ${data.debut?.game ?? 'Unknown'}
                OVA: ${data.debut?.ova ?? 'Unknown'}
                Appears In: ${data.debut?.appearsIn ?? 'Unknown'}
            Family:
                Father: ${data.family?.father ?? 'Unknown'}
                Brother: ${data.family?.brother ?? 'Unknown'}
            Jutsu: ${Array.isArray(data.jutsu) && data.jutsu.length > 0 ? data.jutsu.join(', ') : 'Unknown'}
            Nature Types: ${Array.isArray(data.natureType) && data.natureType.length > 0 ? data.natureType.join(', ') : 'Unknown'}
            Personal:
                Birthdate: ${data.personal?.birthdate ?? 'Unknown'}
                Sex: ${data.personal?.sex ?? 'Unknown'}
                Status: ${data.personal?.status ?? 'Unknown'}
                Height: ${data.personal?.height?.['Part II'] ?? 'Unknown'}
                Weight: ${data.personal?.weight?.['Part II'] ?? 'Unknown'}
                Blood Type: ${data.personal?.bloodType ?? 'Unknown'}
                Kekkei Genkai: ${Array.isArray(data.personal?.kekkeiGenkai) && data.personal.kekkeiGenkai.length > 0 ? data.personal.kekkeiGenkai.join(', ') : 'Unknown'}
                Kekkei Mōra: ${data.personal?.kekkeiMōra ?? 'Unknown'}
                Classification: ${Array.isArray(data.personal?.classification) && data.personal.classification.length > 0 ? data.personal.classification.join(', ') : 'Unknown'}
                Tailed Beast: ${data.personal?.tailedBeast ?? 'Unknown'}
                Occupation: ${Array.isArray(data.personal?.occupation) && data.personal.occupation.length > 0 ? data.personal.occupation.join(', ') : 'Unknown'}
                Affiliation: ${Array.isArray(data.personal?.affiliation) && data.personal.affiliation.length > 0 ? data.personal.affiliation.join(', ') : 'Unknown'}
                Partner: ${Array.isArray(data.personal?.partner) && data.personal.partner.length > 0 ? data.personal.partner.join(', ') : 'Unknown'}
                Clan: ${data.personal?.clan ?? 'Unknown'}
                Titles: ${Array.isArray(data.personal?.titles) && data.personal.titles.length > 0 ? data.personal.titles.join(', ') : 'Unknown'}
            Tools: ${Array.isArray(data.tools) && data.tools.length > 0 ? data.tools.join(', ') : 'Unknown'}
            Unique Traits: ${Array.isArray(data.uniqueTraits) && data.uniqueTraits.length > 0 ? data.uniqueTraits.join(', ') : 'Unknown'}
            Voice Actors:
                Japanese: ${Array.isArray(data.voiceActors?.japanese) && data.voiceActors.japanese.length > 0 ? data.voiceActors.japanese.join(', ') : 'Unknown'}
                English: ${Array.isArray(data.voiceActors?.english) && data.voiceActors.english.length > 0 ? data.voiceActors.english.join(', ') : 'Unknown'}
        `;
    }
    
    
    
    async function setTargetCharacter() {
            const url = `https://narutodb.xyz/api/character/search?name=${encodeURIComponent(targetCharacter.name)}`;

            const response = await fetch(url);
            const data = await response.json();
            targetInfo = formatDataToText(data);
            // Extract Part I and Part II ranks
            const partIiRank = data.rank?.ninjaRank?.['Part II'];
            const partIRank = data.rank?.ninjaRank?.['Part I'];

            // Use Part II rank if available, otherwise fall back to Part I rank
            const displayRank = partIiRank || partIRank || 'Unknown';

            // Convert heights to feet and inches
            const partIiHeightCm = data.personal?.height?.['Part II'];
            const partIHeightCm = data.personal?.height?.['Part I'];
            const partIiHeight = partIiHeightCm ? 
                cmToFeetAndInches(parseFloat(partIiHeightCm)) : 
                (partIHeightCm ? cmToFeetAndInches(parseFloat(partIHeightCm)) : 'Unknown');

            // Extract and clean age information
            const partIiAge = extractLastTwoCharactersOfAge(data.personal?.age?.['Part II']) || 'Unknown';

            // Clean chakra natures
            const cleanedNatureTypes = cleanChakraNature(data.natureType || ['None']);

            // Get clan or default to 'Unknown'
            const clan = data.personal?.clan || 'None';

            targetCharacter.rank = displayRank;
            targetCharacter.debut = data.debut?.anime;
            console.log(targetCharacter.debut);
            targetCharacter.age = partIiAge;
            
            const villageMap = {
                'Konohagakure': 'Hidden Leaf Village',
                'Land of Iron': 'Land of Iron',
                'Sunagakure': 'Hidden Sand Village',
                'Kirigakure': 'Hidden Mist Village',
                'Kumogakure': 'Hidden Cloud Village',
                'Iwagakure': 'Hidden Stone Village',
                'Amegakure': 'Hidden Rain Village',
                'Takigakure': 'Hidden Waterfall Village',
                'Otogakure': 'Hidden Sound Village',
                'Hoshigakure': 'Hidden Star Village',
                'Kusagakure': 'Hidden Grass Village',
                'Yugakure': 'Hidden Hot Water Village',
                'Uzushiogakure': 'Hidden Eddy Village' // Added Uzushiogakure
            };
            
            // Get the Japanese (romaji) village name(s)
            let japaneseVillageName = data.personal?.affiliation;
            
            // Handle cases where affiliation is an array or a single string
            if (Array.isArray(japaneseVillageName)) {
                // If it's an array, use the first element or default to 'Unknown'
                japaneseVillageName = japaneseVillageName[0] || 'Unknown';
            } else {
                // If it's a string, use it directly or default to 'Unknown'
                japaneseVillageName = japaneseVillageName || 'Unknown';
            }
            
            // Convert Japanese (romaji) name to English name
            const englishVillageName = villageMap[japaneseVillageName] || 'Unknown';
            
            // Capitalize the first letter of the English name
            const capitalizedVillageName = englishVillageName === 'Unknown'
                ? 'Unknown'
                : englishVillageName.charAt(0).toUpperCase() + englishVillageName.slice(1);
            
            // Assign to targetCharacter.village
            targetCharacter.village = capitalizedVillageName;
            
            console.log(targetCharacter.village); // Outputs the capitalized village name or 'Unknown'
            
            

            targetCharacter.height = partIiHeight;
            targetCharacter.abilities = cleanedNatureTypes;
            targetCharacter.clan = clan;
            targetCharacter.status = data.personal?.status || 'Alive';
            targetCharacter.gender = data.personal?.sex || 'Unknown';
            console.log(targetCharacter);
    }
    function cleanChakraNature(nature) {
        // Define the valid words and their capitalized versions
        const validNatures = {
            'earth': 'Earth',
            'fire': 'Fire',
            'water': 'Water',
            'wind': 'Wind',
            'lightning': 'Lightning'
        };
        
        // Process the input array
        const processedNatures = nature
            .map(type => 
                type
                    .replace(/\s*release\s*/gi, '')             // Remove the word "release" (case-insensitive)
                    .replace(/\s*\(.*?\)/g, '')                 // Remove any text within parentheses (including the parentheses)
                    .replace(/[\[\]{}]/g, '')                   // Remove square and curly brackets
                    .trim()                                      // Trim any leading or trailing whitespace
                    .toLowerCase()                              // Convert to lowercase for consistent comparison
            )
            .map(type => validNatures[type] || '')         // Map to the proper capitalization or empty if not valid
            .filter(type => type);                        // Filter out empty strings
        
        // Check if the array is empty and set it to ['None'] if it is
        return processedNatures.length > 0 ? processedNatures : ['None'];
    }
    
    function cleanClan(clan) {
        // Function to clean individual clan strings
        const cleanString = (str) => str
            .replace(/\s*\(Anime only\)/gi, '') // Remove "(Anime only)" (case-insensitive)
            .replace(/\s*\(Novel only\)/gi, '')  
            .trim(); // Trim any leading or trailing whitespace
    
        if (Array.isArray(clan)) {
            // If clan is an array, clean each item and filter out empty strings
            const cleanedArray = clan.map(cleanString).filter(item => item !== '');
            return cleanedArray.length > 0 ? cleanedArray : ['None'];
        } else if (typeof clan === 'string') {
            // If clan is a string, clean it and return it in an array, default to ['None'] if empty
            const cleanedClan = cleanString(clan);
            return cleanedClan ? [cleanedClan] : ['None'];
        } else {
            // If clan is neither a string nor an array (e.g., undefined or null), return ['None']
            return ['None'];
        }
    }
    
    
    
    
    
    
    

    async function handleGuess() {
        if (gameWon || guesses >= 8) {
            return; // Do nothing if game is won or 8 guesses are already made
        }

        const searchTerm = normalizeString(searchBar.value);
    const filteredCharacters = characters.filter(character =>
        normalizeString(character.name) === searchTerm
    );

    if (filteredCharacters.length > 0) {
        const character = filteredCharacters[0];
        guessedCharacters.add(character.name);
        guesses++;
    
        // Update the dotted box with the guessed character's image
        const box = document.getElementById(`box${guesses}`);
        if (box) {
            box.textContent = ''; // Clear existing text
            const img = document.createElement('img');
            img.src = character.imageUrl;
            img.alt = character.name;
            box.appendChild(img);
            box.classList.add('guessed');
    
            // Check if the guessed character is correct
            if (character.name === targetCharacter.name) {
                box.classList.add('correct-guess');
                message.textContent = 'You guessed the right character!';
                gameWon = true;
                searchBar.disabled = true;
                playAgainButton.style.display = 'block';
                updateStats(true);
                fetchCharacterImage(character.name);
                showPopup();
            } else if (guesses >= 8) {
                message.textContent = `Game Over! The character was ${targetCharacter.name}.`;
                searchBar.disabled = true;
                playAgainButton.style.display = 'block';
                updateStats(false);
                fetchCharacterImage(targetCharacter.name);
                showPopup();
            }
        }
    
            const url = `https://narutodb.xyz/api/character/search?name=${encodeURIComponent(character.name)}`;

            const response = await fetch(url);
            const data = await response.json();
            // Extract Part I and Part II ranks
            const partIiRank = data.rank?.ninjaRank?.['Part II'];
            const partIRank = data.rank?.ninjaRank?.['Part I'];

            // Use Part II rank if available, otherwise fall back to Part I rank
            const displayRank = partIiRank || partIRank || 'Unknown';

            // Convert heights to feet and inches
            const partIiHeightCm = data.personal?.height?.['Part II'];
            const partIHeightCm = data.personal?.height?.['Part I'];
            const partIiHeight = partIiHeightCm ? 
                cmToFeetAndInches(parseFloat(partIiHeightCm)) : 
                (partIHeightCm ? cmToFeetAndInches(parseFloat(partIHeightCm)) : 'Unknown');

            // Extract and clean age information
            const partIiAge = extractLastTwoCharactersOfAge(data.personal?.age?.['Part II']) || 'Unknown';

            // Clean chakra natures
            const cleanedNatureTypes = cleanChakraNature(data.natureType || ['None']);

            // Get clan or default to 'Unknown'
            const clanData = data.personal?.clan;
            const clan = cleanClan(clanData);
            const villageMap = {
                'Konohagakure': 'Hidden Leaf Village',
                'Sunagakure': 'Hidden Sand Village',
                'Kirigakure': 'Hidden Mist Village',
                'Kumogakure': 'Hidden Cloud Village',
                'Iwagakure': 'Hidden Stone Village',
                'Amegakure': 'Hidden Rain Village',
                'Takigakure': 'Hidden Waterfall Village',
                'Otogakure': 'Hidden Sound Village',
                'Hoshigakure': 'Hidden Star Village',
                'Kusagakure': 'Hidden Grass Village',
                'Yugakure': 'Hidden Hot Water Village',
                'Uzushiogakure': 'Hidden Eddy Village' // Added Uzushiogakure
            };
            
            // Get the Japanese (romaji) village name(s)
            let japaneseVillageName = data.personal?.affiliation;
            
            // Handle cases where affiliation is an array or a single string
            if (Array.isArray(japaneseVillageName)) {
                // If it's an array, use the first element or default to 'Unknown'
                japaneseVillageName = japaneseVillageName[0] || 'Unknown';
            } else {
                // If it's a string, use it directly or default to 'Unknown'
                japaneseVillageName = japaneseVillageName || 'Unknown';
            }
            
            // Convert Japanese (romaji) name to English name
            const englishVillageName = villageMap[japaneseVillageName] || 'Unknown';
            
            // Capitalize the first letter of the English name
            const capitalizedVillageName = englishVillageName === 'Unknown'
                ? 'Unknown'
                : englishVillageName.charAt(0).toUpperCase() + englishVillageName.slice(1);
            
            // Assign to targetCharacter.village
            character.village = capitalizedVillageName;
            
            console.log(character.village); // Outputs the capitalized village name or 'Unknown'
            
            

            character.rank = displayRank;
            character.debut = data.debut?.anime;
            console.log(character.debut);
            character.age = partIiAge;
            character.height = partIiHeight;
            character.abilities = cleanedNatureTypes;
            character.clan = clan;
            character.status = data.personal?.status || 'Alive';
            character.gender = data.personal?.sex || 'Unknown';
            console.log(character);
            if (getClass(character.name, targetCharacter.name) == "correct") {
                const li = document.createElement('li-correct');
                li.innerHTML = `
                    <div class="${getClass(character.name, targetCharacter.name)}">${character.name}</div>
                    <div class="${getClass(character.rank, targetCharacter.rank)}">${character.rank}</div>
                    <div class="${getClass(character.village, targetCharacter.village)}">${character.village}</div>
                    <div class="${getClass(character.height, targetCharacter.height, 'height')}">${character.height} ${getArrowHeight(character.height, targetCharacter.height)}</div>
                    <div class="${getClass(character.age, targetCharacter.age, 'age')}">${character.age} ${getArrow(character.age, targetCharacter.age)}</div>
                    <div class="${getClanClass(character.clan, targetCharacter.clan)}">${character.clan}</div>
                    <div class="${getChakraClass(character.abilities, targetCharacter.abilities)}">${character.abilities}</div>
                    <div class="${getClass(character.status, targetCharacter.status)}">${character.status}</div>
                    <div class="${getClass(character.gender, targetCharacter.gender)}">${character.gender}</div>
                `;
                results.appendChild(li);
            }
            else {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="${getClass(character.name, targetCharacter.name)}">${character.name}</div>
                    <div class="${getClass(character.rank, targetCharacter.rank)}">${character.rank}</div>
                    <div class="${getClass(character.village, targetCharacter.village)}">${character.village}</div>
                    <div class="${getClass(character.height, targetCharacter.height, 'height')}">${character.height} ${getArrowHeight(character.height, targetCharacter.height)}</div>
                    <div class="${getClass(character.age, targetCharacter.age, 'age')}">${character.age} ${getArrow(character.age, targetCharacter.age)}</div>
                    <div class="${getClanClass(character.clan, targetCharacter.clan)}">${character.clan}</div>
                    <div class="${getChakraClass(character.abilities, targetCharacter.abilities)}">${character.abilities}</div>
                    <div class="${getClass(character.status, targetCharacter.status)}">${character.status}</div>
                    <div class="${getClass(character.gender, targetCharacter.gender)}">${character.gender}</div>
                `;
                results.appendChild(li);
            }
           

            searchBar.value = '';
            showAllNames(); // Show all names after a guess
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
    
    closeStatsButton.addEventListener('click', () => {
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
        popupCharacterName.innerHTML = `<h2>${targetCharacter.name}</h2>`;
        labelRank.textContent = targetCharacter.rank;
        labelVillage.textContent = targetCharacter.village;
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
            popupMessage.innerHTML = `You guessed the right character!<br>It took you <span class="number-of-tries">${guesses}</span> tries.`;
        } else {
            popupMessage.innerHTML = `Game Over! The character was ${targetCharacter.name}.`;
        }

        popup.style.display = 'block';

        playAgainPopup.onclick = () => {
            location.reload();
        };

        closePopup.onclick = () => {
            popup.style.display = 'none';
        };
    }

    function fetchCharacterImage(characterName) {
        console.log(`Fetching image for: ${characterName}`);
        fetch(`https://narutodb.xyz/api/character/search?name=${encodeURIComponent(characterName)}`)
            .then(response => response.json())
            .then(data => {
                const images = data.images;
                const lastImage = images[images.length - 1]; // Get the last image
                targetCharacter.imageUrl = lastImage; // Store image URL in targetCharacter
                if (images.length > 1 && !["Naruto Uzumaki", "Moegi Kazamatsuri", "Udon Ise", "Sasuke Uchiha", "Sakura Haruno", "Shikamaru Nara", "Ino Yamanaka", "Chōji Akimichi", "Rock Lee", "Tenten", "Neji Hyūga", "Hinata Hyūga", "Kiba Inuzuka", "Shino Aburame", "Gaara", "Konohamaru Sarutobi"].includes(character.name)) {
                    targetCharacter.imageUrl = images[0];
                }
                
                if (targetCharacter.name == "Jiraiya")
                    targetCharacter.imageUrl = "images/jiraiya.png";
                if (guesses >= 8 || gameWon) {
                    showPopup(); // Show popup when the game ends
                }
            })
            .catch(error => console.error('Error fetching character image:', error));
    }

    function getClass(value, targetValue, type) {
        if (value === targetValue) {
            return 'correct';
        } else if (type === 'height' && compareHeights(value, targetValue) <= 2 && compareHeights(value, targetValue) >= -2) {
            return 'similar';
        } else if (type === 'age' && Math.abs(parseInt(value.replace(' years old', '')) - parseInt(targetValue.replace(' years old', ''))) <= 2) {
            return 'similar';
        } else {
            return '';
        }
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
    
    function getChakraClass(abilities, targetAbilities) {
        const abilitiesSet = new Set(abilities);
        const targetAbilitiesSet = new Set(targetAbilities);

        if (abilitiesSet.size === targetAbilitiesSet.size && [...abilitiesSet].every(ability => targetAbilitiesSet.has(ability))) {
            return 'correct'; // Full match
        }

        for (let ability of targetAbilitiesSet) {
            if (abilitiesSet.has(ability)) {
                return 'similar'; // Partial match
            }
        }

        return 'no'; // No match
    }

    function compareHeights(height1, height2) {
        const parseHeight = (height) => {
            // Split the height string by feet and inches
            const [feet, inches] = height.split("'").map(part => part.replace('"', '').trim());
            return (parseInt(feet) || 0) * 12 + (parseInt(inches) || 0); // Convert to total inches
        };
    
        const heightInInches1 = parseHeight(height1);
        const heightInInches2 = parseHeight(height2);
    
        return heightInInches1 - heightInInches2; // Return the difference
    }

    function getArrow(value, targetValue) {
        if (!value || !targetValue) return '';
        const val = parseInt(value.replace("'", '').replace('"', '').replace(' years old', ''));
        const targetVal = parseInt(targetValue.replace("'", '').replace('"', '').replace(' years old', ''));
        if (val < targetVal) {
            return '↑';
        } else if (val > targetVal) {
            return '↓';
        } else {
            return '';
        }
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
    

    function loadCharacterImages() {
        // Array to hold promises for fetching images
        const imagePromises = characters.map(character => {
            return fetch(`https://narutodb.xyz/api/character/search?name=${encodeURIComponent(character.name)}`)
                .then(response => response.json())
                .then(data => {
                    const images = data.images;
                    if (images && images.length > 0) {
                        character.imageUrl = images[images.length - 1];
                        if (images.length > 1 && !["Naruto Uzumaki", "Moegi Kazamatsuri", "Udon Ise", "Sasuke Uchiha", "Sakura Haruno", "Shikamaru Nara", "Ino Yamanaka", "Chōji Akimichi", "Rock Lee", "Tenten", "Neji Hyūga", "Hinata Hyūga", "Kiba Inuzuka", "Shino Aburame", "Gaara", "Temari", "Kankurō", "Konohamaru Sarutobi"].includes(character.name)) {
                            character.imageUrl = images[0];
                        }
                        if (character.name == "Jiraiya") {
                            character.imageUrl = "images/jiraiya.png";
                        }
                    }
                    character.debut = data.debut?.anime;
                })
                .catch(error => console.error(`Error fetching image for ${character.name}:`, error));
        });
    
        // Wait for all promises to complete
        Promise.all(imagePromises)
            .then(() => {
                // Update autocomplete list after all images are loaded
                searchBar.disabled = false;
                showAllNames();
            });
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

        guessDistributionUl.innerHTML = '';
        stats.guessDistribution.forEach((count, index) => {
            const li = document.createElement('li');
            li.textContent = `Guesses ${index + 1}: ${count}`;
            guessDistributionUl.appendChild(li);
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

    aboutButton.addEventListener('click', () => {
        aboutDiv.style.display = 'block';
    });

    closeAboutButton.addEventListener('click', () => {
        aboutDiv.style.display = 'none';
    });
});