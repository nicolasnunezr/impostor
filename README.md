# The Impostor Game

A mobile-first web application for a local multiplayer party game. Players take turns viewing a secret word, while one or more impostors see a different word. The goal is to identify who doesn't know the real word through discussion and deduction.

## Overview

The game supports multiple modes and flexible player configurations. It's designed to be played by passing a single device around a group, making it perfect for parties and social gatherings. The interface is minimalist and optimized for mobile devices, though it works on desktop as well.

## Features

- Three game modes: Casual (everyday words), Famous People, and Party (drinking game variant)
- Flexible player setup: 3-12 players with configurable impostor count
- Random impostor assignment option for added unpredictability
- Group session management: save player names across multiple rounds
- Mobile-first responsive design
- No accounts or registration required

## Installation

### Requirements

- Python 3.8 or higher
- pip package manager

### Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask server:
```bash
python app.py
```

3. Open your browser and navigate to:
```
http://localhost:5001
```

## How to Play

1. Select a game mode (Casual, Famous, or Party)
2. Choose the number of players (3-12)
3. Choose the number of impostors, or select Random for unpredictable gameplay
4. Enter player names (or use defaults)
5. Pass the device around - each player taps to reveal their word
6. Impostors will see "IMPOSTOR" instead of the real word
7. After all players have seen their word, discuss and identify the impostor

## Game Modes

**Casual**: Uses everyday words from a curated list. Good for general audiences.

**Famous**: Features well-known people from history, entertainment, and culture. Requires some cultural knowledge.

**Party**: Similar to Casual but includes drinking game mechanics. Players take sips based on accusations and outcomes.

## Deployment

This application requires a server to run the Flask backend. GitHub Pages only serves static files, so you'll need a hosting service that supports Python applications.

### Recommended: Railway.app

Railway offers a free tier and integrates directly with GitHub for automatic deployments.

1. Create an account at [railway.app](https://railway.app) (you can sign in with GitHub)
2. Click "New Project" and select "Deploy from GitHub repo"
3. Choose your repository
4. Railway will automatically detect Flask and configure the deployment
5. You'll receive a free subdomain (e.g., `your-app-production.up.railway.app`)
6. Every push to your main branch will trigger an automatic deployment

The free tier includes 500 hours per month, which is sufficient for personal projects and low-traffic applications.

**Note**: If you encounter build errors related to Python version detection, ensure that `runtime.txt` is not present in your repository. Railway automatically detects Python from `requirements.txt`.

## Technical Details

### Architecture

- **Backend**: Python with Flask framework
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **State Management**: In-memory game state (resets on server restart)
- **No Database**: All game data is ephemeral and session-based

### Project Structure

```
impostor/
├── app.py                 # Flask application and API endpoints
├── requirements.txt       # Python dependencies
├── Procfile              # Deployment configuration
├── runtime.txt           # Python version specification
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css     # Application styles
│   └── js/
│       └── game.js       # Client-side game logic
├── casuallist.txt        # Word list for Casual mode
└── famouslist.txt        # Name list for Famous mode
```

### API Endpoints

- `GET /` - Serves the main application page
- `POST /api/start-game` - Initializes a new game session
- `POST /api/get-word` - Retrieves the word for a specific player
- `POST /api/next-player` - Advances to the next player
- `POST /api/get-statistic` - Returns a random fake statistic
- `POST /api/get-party-card` - Returns a party mode card
- `POST /api/create-group` - Creates a persistent player group
- `POST /api/get-group` - Retrieves group information
- `POST /api/add-player` - Adds a player to a group
- `POST /api/remove-player` - Removes a player from a group
- `POST /api/exit-group` - Disbands a group session
- `POST /api/reset-game` - Clears game state

## Development

The application runs in debug mode by default when executed directly. For production, set the `FLASK_DEBUG` environment variable to `False`. The production server uses Gunicorn, which is included in the requirements.

Game state is stored in memory and does not persist across server restarts. This is intentional for a party game where sessions are meant to be temporary.

## License

This project is open source and available for personal and educational use.
