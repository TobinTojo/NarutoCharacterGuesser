document.addEventListener('DOMContentLoaded', () => {
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
    const popupCharacterName = document.getElementById('popupCharacterName');
    const playAgainPopup = document.getElementById('playAgainPopup');
    const closePopup = document.getElementById('closePopup');
    const helpButton = document.getElementById('helpButton');
    const helpDiv = document.getElementById('help');
    const aboutDiv = document.getElementById('about-popup');
    const closeHelpButton = document.getElementById('closeHelp');
    const closeAboutButton = document.getElementById('closeAbout');
    
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

    loadStats();

    fetch('names.txt')
        .then(response => response.text())
        .then(data => {
            characters = data.split('\n').map(line => {
                const [name, rank, village, height, age, clan, abilities, status, gender] = line.split(' | ');
                return { name, rank, village, height, age, clan, abilities, status, gender };
            });
            targetCharacter = characters[Math.floor(Math.random() * characters.length)];
            searchBar.disabled = false;
            showAllNames(); // Show all names initially
        })
        .catch(error => console.error('Error fetching names:', error));

    searchBar.addEventListener('input', () => {
        const searchTerm = searchBar.value.toLowerCase();
        autocomplete.innerHTML = '';

        if (searchTerm.trim() === '') {
            showAllNames(); // Show all names if search bar is empty
        } else {
            const filteredCharacters = characters.filter(character => 
                character.name.toLowerCase().includes(searchTerm) && !guessedCharacters.has(character.name)
            );
            filteredCharacters.forEach(character => {
                const li = document.createElement('li');
                li.textContent = character.name;
                li.addEventListener('click', () => {
                    searchBar.value = character.name;
                    autocomplete.innerHTML = '';
                });
                autocomplete.appendChild(li);
            });
        }
    });

    function handleGuess() {
        if (gameWon || guesses >= 8) {
            return; // Do nothing if game is won or 8 guesses are already made
        }

        const searchTerm = searchBar.value.toLowerCase();
        const filteredCharacters = characters.filter(character => character.name.toLowerCase() === searchTerm);

        if (filteredCharacters.length > 0) {
            const character = filteredCharacters[0];
            guessedCharacters.add(character.name);
            guesses++;

            // Update the dotted box with the guessed character
            const box = document.getElementById(`box${guesses}`);
            if (box) {
                box.textContent = character.name;
                box.classList.add('guessed');

                // Check if the guessed character is correct
                if (character.name === targetCharacter.name) {
                    box.classList.add('correct-guess');
                    message.textContent = 'You guessed the right character!';
                    gameWon = true;
                    searchBar.disabled = true;
                    playAgainButton.style.display = 'block';
                    updateStats(true);
                    fetchCharacterImage(character.name); // Fetch and display image
                    showPopup(); // Show the popup
                } else if (guesses >= 8) {
                    message.textContent = `Game Over! The character was ${targetCharacter.name}.`;
                    searchBar.disabled = true;
                    playAgainButton.style.display = 'block';
                    updateStats(false);
                    fetchCharacterImage(targetCharacter.name); // Fetch and display image
                    showPopup(); // Show the popup
                }
            }

            const li = document.createElement('li');
            li.innerHTML = `
                <div>${character.name}</div>
                <div class="${getClass(character.rank, targetCharacter.rank)}">${character.rank}</div>
                <div class="${getClass(character.village, targetCharacter.village)}">${character.village}</div>
                <div class="${getClass(character.height, targetCharacter.height, 'height')}">${character.height} ${getArrow(character.height, targetCharacter.height)}</div>
                <div class="${getClass(character.age, targetCharacter.age, 'age')}">${character.age} ${getArrow(character.age, targetCharacter.age)}</div>
                <div class="${getClass(character.clan, targetCharacter.clan)}">${character.clan}</div>
                <div class="${getChakraClass(character.abilities, targetCharacter.abilities)}">${character.abilities}</div>
                <div class="${getClass(character.status, targetCharacter.status)}">${character.status}</div>
                <div class="${getClass(character.gender, targetCharacter.gender)}">${character.gender}</div>
            `;
            results.appendChild(li);

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
        const sortedCharacters = characters.filter(character => !guessedCharacters.has(character.name))
                                           .sort((a, b) => a.name.localeCompare(b.name));

        sortedCharacters.forEach(character => {
            const li = document.createElement('li');
            li.textContent = character.name;
            li.addEventListener('click', () => {
                searchBar.value = character.name;
                autocomplete.innerHTML = '';
            });
            autocomplete.appendChild(li);
        });
    }

    function showPopup() {
        popupCharacterName.innerHTML = `<h2>${targetCharacter.name}</h2>`;

        popupImageContainer.innerHTML = ''; // Clear previous image
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
                if (guesses >= 8 || gameWon) {
                    showPopup(); // Show popup when the game ends
                }
            })
            .catch(error => console.error('Error fetching character image:', error));
    }

    function getClass(value, targetValue, type) {
        if (value === targetValue) {
            return 'correct';
        } else if (type === 'height' && compareHeights(value, targetValue) <= 2) {
            return 'similar';
        } else if (type === 'age' && Math.abs(parseInt(value.replace(' years old', '')) - parseInt(targetValue.replace(' years old', ''))) <= 2) {
            return 'similar';
        } else {
            return '';
        }
    }

    function getChakraClass(abilities, targetAbilities) {
        const abilitiesSet = new Set(abilities.split(', ').map(a => a.trim()));
        const targetAbilitiesSet = new Set(targetAbilities.split(', ').map(a => a.trim()));

        if (abilitiesSet.size === targetAbilitiesSet.size && [...abilitiesSet].every(ability => targetAbilitiesSet.has(ability))) {
            return 'correct'; // Full match
        }

        for (let ability of targetAbilitiesSet) {
            if (abilitiesSet.has(ability)) {
                return 'similar'; // Partial match
            }
        }

        return ''; // No match
    }

    function compareHeights(height1, height2) {
        const [feet1, inches1] = height1.split("'").map(part => parseInt(part.replace('"', '')));
        const [feet2, inches2] = height2.split("'").map(part => parseInt(part.replace('"', '')));
        const totalInches1 = (feet1 * 12) + inches1;
        const totalInches2 = (feet2 * 12) + inches2;
        return Math.abs(totalInches1 - totalInches2);
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
        stats.guessDistribution[Math.min(guesses, 7)]++;
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