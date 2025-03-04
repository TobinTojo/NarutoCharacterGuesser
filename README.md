# Narutle - A Naruto Character Guessing Game

Narutle is a fun and interactive guessing game where players try to guess a random Naruto character within 8 attempts. The game provides hints based on the character's rank, village, height, age, clan, chakra nature, status, and gender. It also includes a typing effect for welcome messages, a stats section to track your progress, and a popup to display the character's details when the game ends.

## Features

- **Guess the Character**: Try to guess the correct Naruto character within 8 attempts.
- **Hints**: Get hints based on the character's rank, village, height, age, clan, chakra nature, status, and gender.
- **Typing Effect**: Enjoy a typing effect for welcome messages.
- **Stats**: Track your progress with stats like games played, current streak, longest streak, win percentage, and guess distribution.
- **Rank System**: Earn ranks based on your wins, starting from Genin and progressing to Jonin.
- **Popup**: View the character's details, including their image, rank, village, height, age, clan, chakra nature, status, and gender, when the game ends.
- **Character Images**: See images of the characters as you guess them.
- **Autocomplete**: Use the autocomplete feature to help you guess the character.

## How to Play

1. **Start the Game**: The game starts automatically when the page loads.
2. **Guess the Character**: Type the name of a Naruto character in the search bar and press Enter or click the "Guess" button.
3. **Get Hints**: After each guess, you'll see hints based on the character's rank, village, height, age, clan, chakra nature, status, and gender.
4. **Win or Lose**: If you guess the correct character within 8 attempts, you win! Otherwise, the game will reveal the correct character.
5. **Play Again**: Click the "Play Again" button to start a new game.

## Play Online

You can play Narutle directly in your browser by visiting:  
👉 **[https://narutle.netlify.app/](https://narutle.netlify.app/)** 👈

## Installation (For Local Development)

To run this project locally, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/narutle.git
   cd narutle
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Project**:
   ```bash
   npm start
   ```

4. **Open in Browser**:
   Open your browser and navigate to `http://localhost:3000` to play the game.

## Dependencies

- [Google Generative AI](https://www.npmjs.com/package/@google/generative-ai): Used to generate fun facts about the characters.
- [Naruto DB API](https://narutodb.xyz/): Used to fetch character details and images.

## Code Overview

### Main Script

The main script (`script.js`) handles the game logic, including:

- Fetching character data from the Naruto DB API.
- Handling user guesses and providing hints.
- Displaying character images and details.
- Managing the game state (e.g., guesses, wins, streaks).
- Updating the stats and rank system.

### Typing Effect

The typing effect is implemented using the `type()` and `deleteText()` functions, which simulate typing and deleting text for the welcome messages.

### Stats and Rank System

The stats and rank system tracks the player's progress and updates the rank based on the number of wins. The ranks are:

- **Genin**: 0-49 wins
- **Chunin**: 50-139 wins
- **Jonin**: 140+ wins

### Popup

The popup displays the character's details when the game ends, including their image, rank, village, height, age, clan, chakra nature, status, and gender.

## Acknowledgments

- [Naruto DB](https://narutodb.xyz/) for providing the character data and images.
- [Google Generative AI](https://www.npmjs.com/package/@google/generative-ai) for generating fun facts about the characters.

## Contact

If you have any questions or suggestions, feel free to open an issue or contact me directly.

Enjoy playing Narutle! 🎮
