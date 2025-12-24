from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import random
import os

app = Flask(__name__)
CORS(app)

def load_casual_words():
    """Load and filter words from casuallist.txt"""
    words = []
    file_path = os.path.join(os.path.dirname(__file__), 'casuallist.txt')
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                word = line.strip()
                if word and len(word) >= 3 and word.replace('-', '').replace("'", '').isalnum():
                    words.append(word.lower())
        return words
    except FileNotFoundError:
        return ["elephant", "bicycle", "mountain", "ocean", "guitar", "coffee", "sunset", "book", "bridge", "forest"]

def load_famous_people():
    """Load names from famouslist.txt"""
    people = []
    file_path = os.path.join(os.path.dirname(__file__), 'famouslist.txt')
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                person = line.strip()
                if person:
                    people.append(person)
        return people
    except FileNotFoundError:
        return ["Albert Einstein", "Leonardo da Vinci", "William Shakespeare", "Marie Curie", "Nelson Mandela"]

CASUAL_WORDS = load_casual_words()
FAMOUS_PEOPLE = load_famous_people()

ONE_WORD_LIE_PAIRS = {
    "pizza": "pasta",
    "beach": "island",
    "mountain": "volcano",
    "ocean": "lake",
    "guitar": "piano",
    "coffee": "tea",
    "book": "magazine",
    "bridge": "tunnel",
    "forest": "jungle",
    "camera": "phone",
    "diamond": "crystal",
    "telescope": "microscope",
    "butterfly": "dragonfly",
    "rainbow": "cloud",
    "castle": "palace",
    "dragon": "dinosaur",
    "pirate": "sailor",
    "wizard": "witch",
    "robot": "android",
    "spaceship": "rocket",
    "apple": "orange",
    "banana": "pineapple",
    "strawberry": "cherry",
    "watermelon": "melon",
    "computer": "laptop",
    "keyboard": "typewriter",
    "mouse": "rat",
    "headphones": "earbuds",
    "car": "truck",
    "airplane": "helicopter",
    "train": "subway",
    "ship": "boat",
    "dog": "wolf",
    "cat": "tiger",
    "bird": "eagle",
    "fish": "shark",
    "horse": "pony",
    "lion": "tiger",
    "bear": "panda",
    "house": "apartment",
    "hotel": "motel",
    "restaurant": "cafe",
    "school": "university",
    "hospital": "clinic",
    "library": "bookstore",
    "museum": "gallery",
    "theater": "cinema",
    "sun": "star",
    "moon": "planet",
    "river": "stream",
    "waterfall": "fountain",
    "desert": "beach",
    "cave": "tunnel",
    "valley": "canyon",
    "Elon Musk": "Jeff Bezos",
    "Steve Jobs": "Bill Gates",
    "Albert Einstein": "Isaac Newton",
    "Leonardo da Vinci": "Michelangelo",
    "William Shakespeare": "Charles Dickens",
    "Marie Curie": "Rosalind Franklin",
    "Nelson Mandela": "Martin Luther King",
    "Barack Obama": "Joe Biden",
    "Michael Jackson": "Elvis Presley",
    "Pablo Picasso": "Vincent van Gogh",
    "Marilyn Monroe": "Margot Robbie",
    "Tom Hanks": "Brad Pitt",
    "Cristiano Ronaldo": "Lionel Messi",
    "Michael Jordan": "LeBron James",
    "soccer": "basketball",
    "hamburger": "hotdog",
    "pencil": "pen",
    "notebook": "diary",
    "train": "bus",
    "airplane": "helicopter",
    "camera": "binoculars",
    "cookie": "cake",
    "chocolate": "candy",
    "sunglasses": "hat",
    "shoe": "sandal",
    "bicycle": "scooter",
    "tree": "bush",
    "flower": "plant",
    "knife": "spoon",
    "plate": "bowl",
    "river": "stream",
    "mountain": "hill",
    "ocean": "sea",
    "cloud": "fog",
    "rain": "snow",
    "star": "moon",
    "sun": "planet",
    "laptop": "tablet",
    "keyboard": "mouse",
    "phone": "tablet",
    "chair": "sofa",
    "table": "desk",
    "door": "window",
    "key": "lock",
    "pen": "marker",
    "watch": "bracelet",
    "bag": "backpack",
    "shirt": "t-shirt",
    "pants": "shorts",
    "cat": "dog",
    "bird": "parrot",
    "fish": "shark",
    "horse": "donkey",
    "lion": "leopard",
    "bear": "panda"
}

# Ridiculous Statistics
RIDICULOUS_STATS = [
    "92% of groups accuse the wrong person.",
    "Impostors survive 63% of the time.",
    "The quietest player is blamed 71% more often.",
    "Friends trust each other way too much.",
    "Most impostors are exposed by overexplaining.",
    "People who speak first are accused last.",
    "Confidence is more suspicious than silence.",
    "Nobody remembers what they said two rounds ago.",
    "Lying feels easier after the second drink.",
    "Eye contact increases suspicion by 34%.",
    "Everyone thinks they are better at this than they are.",
    "Groups over 6 people never agree.",
    "The impostor usually laughs at the wrong moment.",
    "Friendships survive 98% of Impostor games.",
    "Statistics shown here are 100% unreliable.",
    "The first person to speak is never the impostor. Usually.",
    "Silence is 47% more suspicious than talking too much.",
    "People who look at their phone are 83% innocent.",
    "The person who suggests playing is the impostor 12% of the time.",
    "Overthinking this game reduces fun by 91%.",
    "Players who sip while lying increase their odds of survival by 57%.",
    "98% of impostors forget their own word halfway through.",
    "80% of groups argue about nothing for at least 3 minutes.",
    "The person holding the phone is 46% more likely to be blamed.",
    "Laughing loudly confuses everyone 92% of the time.",
    "Sharing snacks during the game increases trust by 63%.",
    "90% of impostors accidentally reveal their word with hand gestures.",
    "Blinking rapidly is considered suspicious in 76% of games.",
    "The person with the loudest laugh is guilty… sometimes.",
    "Groups that play this in a car report 100% more laughter per mile.",
    "If someone says 'I’m totally not the impostor'… they probably are.",
    "Accusing someone immediately after sipping increases suspicion by 84%.",
    "Singing your word reduces your chance of being blamed by 21%.",
    "Impostors who drink water instead of alcohol are 67% sneakier.",
    "Making a dramatic pause increases credibility by 44%.",
    "Randomly pointing at someone increases chaos by 92%.",
    "Players who whisper are accused 33% more than talkers.",
    "The player with the weirdest outfit is guilty 51% of the time."
]


# Party Mode Cards
PARTY_CARDS = [
    "Everyone drinks once.",
    "The impostor drinks 3 sips.",
    "The person to the impostor's left drinks.",
    "The last person who spoke drinks.",
    "Nobody drinks. You all tried too hard.",
    "If you were accused and you were not the impostor, drink once.",
    "If you accused someone who was not the impostor, drink once.",
    "The person who guessed correctly drinks.",
    "Everyone except the impostor drinks.",
    "The impostor drinks 2 sips.",
    "The first person to speak drinks.",
    "The least sober player drinks once.",
    "The most drunk player drinks twice.",
    "Nobody drinks. Good game.",
    "The last person to finish their drink drinks again.",
    "The person who made the funniest comment drinks once.",
    "Everyone with the most gestures drinks once.",
    "The person who changed their mind first drinks once."
]


# Game state (in-memory, no persistence)
game_state = {}

# Group sessions (in-memory, no persistence)
group_sessions = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/create-group', methods=['POST'])
def create_group():
    """Create a new group session"""
    data = request.json
    player_names = data.get('playerNames', [])
    
    if not player_names or len(player_names) < 3:
        return jsonify({'error': 'At least 3 players required'}), 400
    
    # Create group session
    group_id = random.randint(10000, 99999)
    group_sessions[group_id] = {
        'players': [name.strip() for name in player_names if name.strip()],
        'created_at': None
    }
    
    return jsonify({
        'groupId': group_id,
        'players': group_sessions[group_id]['players']
    })

@app.route('/api/get-group', methods=['POST'])
def get_group():
    """Get group session info"""
    data = request.json
    group_id = int(data.get('groupId'))
    
    if group_id not in group_sessions:
        return jsonify({'error': 'Group not found'}), 404
    
    return jsonify({
        'groupId': group_id,
        'players': group_sessions[group_id]['players']
    })

@app.route('/api/add-player', methods=['POST'])
def add_player():
    """Add a player to the group"""
    data = request.json
    group_id = int(data.get('groupId'))
    player_name = data.get('playerName', '').strip()
    
    if group_id not in group_sessions:
        return jsonify({'error': 'Group not found'}), 404
    
    if not player_name:
        return jsonify({'error': 'Player name required'}), 400
    
    if len(group_sessions[group_id]['players']) >= 12:
        return jsonify({'error': 'Maximum 12 players'}), 400
    
    group_sessions[group_id]['players'].append(player_name)
    
    return jsonify({
        'groupId': group_id,
        'players': group_sessions[group_id]['players']
    })

@app.route('/api/remove-player', methods=['POST'])
def remove_player():
    """Remove a player from the group"""
    data = request.json
    group_id = int(data.get('groupId'))
    player_name = data.get('playerName', '').strip()
    
    if group_id not in group_sessions:
        return jsonify({'error': 'Group not found'}), 404
    
    if player_name in group_sessions[group_id]['players']:
        group_sessions[group_id]['players'].remove(player_name)
    
    # Don't disband group, just return current players
    # Frontend will handle showing warning if less than 3
    return jsonify({
        'groupId': group_id,
        'players': group_sessions[group_id]['players'],
        'canPlay': len(group_sessions[group_id]['players']) >= 3
    })

@app.route('/api/exit-group', methods=['POST'])
def exit_group():
    """Exit/disband the group"""
    data = request.json
    group_id = int(data.get('groupId'))
    
    if group_id in group_sessions:
        del group_sessions[group_id]
    
    return jsonify({'success': True})

@app.route('/api/start-game', methods=['POST'])
def start_game():
    data = request.json
    mode = data.get('mode', 'casual')
    num_players = int(data.get('numPlayers', 4))
    num_impostors_raw = data.get('numImpostors', 1)
    player_names = data.get('playerNames', [])
    group_id = data.get('groupId', None)  # Optional: if starting from existing group
    
    # Validate inputs
    if num_players < 3 or num_players > 12:
        return jsonify({'error': 'Number of players must be between 3 and 12'}), 400
    
    if num_impostors_raw == 'random':
        num_impostors = random.randint(0, num_players)
    else:
        num_impostors = int(num_impostors_raw)
    
    if num_impostors_raw != 'random' and (num_impostors < 1 or num_impostors >= num_players):
        return jsonify({'error': 'Number of impostors must be at least 1 and less than number of players'}), 400
    
    if mode == 'onewordlie' and num_impostors != 1:
        return jsonify({'error': 'One Word Lie mode requires exactly 1 impostor'}), 400
    
    if player_names and len(player_names) == num_players:
        players = [name.strip() or f"Player {i+1}" for i, name in enumerate(player_names)]
    else:
        players = [f"Player {i+1}" for i in range(num_players)]
    
    if mode == 'casual' or mode == 'famous':
        word_list = CASUAL_WORDS if mode == 'casual' else FAMOUS_PEOPLE
        secret_word = random.choice(word_list)
        impostor_word = None
        if num_impostors == 0:
            impostor_indices = []
        else:
            impostor_indices = random.sample(range(num_players), num_impostors)
    elif mode == 'onewordlie':
        available_pairs = {}
        for k, v in ONE_WORD_LIE_PAIRS.items():
            k_lower = k.lower()
            v_lower = v.lower()
            if (k_lower in CASUAL_WORDS or 
                any(k.lower() == p.lower() for p in FAMOUS_PEOPLE)):
                if (v_lower in CASUAL_WORDS or 
                    any(v.lower() == p.lower() for p in FAMOUS_PEOPLE)):
                    available_pairs[k_lower] = v_lower
        
        if not available_pairs:
            word_list = CASUAL_WORDS
            secret_word = random.choice(word_list)
            impostor_word = None
        else:
            secret_word = random.choice(list(available_pairs.keys()))
            impostor_word = available_pairs[secret_word]
        impostor_indices = random.sample(range(num_players), 1)
    elif mode == 'party':
        word_list = CASUAL_WORDS
        secret_word = random.choice(word_list)
        impostor_word = None
        # Randomly assign impostors (0 to num_players allowed when random)
        if num_impostors == 0:
            impostor_indices = []
        else:
            impostor_indices = random.sample(range(num_players), num_impostors)
    else:
        word_list = CASUAL_WORDS
        secret_word = random.choice(word_list)
        impostor_word = None
        impostor_indices = random.sample(range(num_players), num_impostors)
    
    player_words = {}
    
    game_id = random.randint(1000, 9999)
    game_state[game_id] = {
        'mode': mode,
        'secret_word': secret_word,
        'impostor_word': impostor_word,
        'player_words': player_words,  # For everyone_different mode
        'players': players,
        'impostor_indices': impostor_indices,
        'current_player_index': 0,
        'players_seen_word': [],
        'stat_shown': False,
        'party_card_shown': False
    }
    
    if group_id and group_id in group_sessions:
        group_sessions[group_id]['players'] = players
    
    return jsonify({
        'gameId': game_id,
        'currentPlayer': players[0],
        'currentPlayerIndex': 0,
        'totalPlayers': num_players,
        'groupId': group_id
    })

@app.route('/api/get-word', methods=['POST'])
def get_word():
    data = request.json
    game_id = int(data.get('gameId'))
    player_index = int(data.get('playerIndex'))
    
    if game_id not in game_state:
        return jsonify({'error': 'Game not found'}), 404
    
    game = game_state[game_id]
    
    if player_index < 0 or player_index >= len(game['players']):
        return jsonify({'error': 'Invalid player index'}), 400
    
    # Check if player is impostor
    is_impostor = player_index in game['impostor_indices']
    
    if player_index not in game['players_seen_word']:
        game['players_seen_word'].append(player_index)
    
    mode = game['mode']
    
    if mode == 'onewordlie':
        if is_impostor and game['impostor_word']:
            word_to_show = game['impostor_word']
            is_impostor_label = False
        else:
            word_to_show = game['secret_word']
            is_impostor_label = False
    else:
        if is_impostor:
            word_to_show = 'IMPOSTOR'
            is_impostor_label = True
        else:
            word_to_show = game['secret_word']
            is_impostor_label = False
    
    return jsonify({
        'word': word_to_show,
        'isImpostor': is_impostor_label,
        'actualImpostor': is_impostor,
    })

@app.route('/api/next-player', methods=['POST'])
def next_player():
    data = request.json
    game_id = int(data.get('gameId'))
    
    if game_id not in game_state:
        return jsonify({'error': 'Game not found'}), 404
    
    game = game_state[game_id]
    game['current_player_index'] += 1
    
    if game['current_player_index'] >= len(game['players']):
        return jsonify({
            'allPlayersDone': True,
            'gameId': game_id
        })
    
    return jsonify({
        'allPlayersDone': False,
        'currentPlayer': game['players'][game['current_player_index']],
        'currentPlayerIndex': game['current_player_index'],
        'totalPlayers': len(game['players'])
    })

@app.route('/api/get-statistic', methods=['POST'])
def get_statistic():
    data = request.json
    game_id = int(data.get('gameId'))
    
    if game_id not in game_state:
        return jsonify({'error': 'Game not found'}), 404
    
    game = game_state[game_id]
    
    if game['stat_shown']:
        return jsonify({'stat': None, 'allShown': True})
    
    stat = random.choice(RIDICULOUS_STATS)
    game['stat_shown'] = True
    
    return jsonify({
        'stat': stat,
        'allShown': False
    })

@app.route('/api/get-party-card', methods=['POST'])
def get_party_card():
    data = request.json
    game_id = int(data.get('gameId'))
    
    if game_id not in game_state:
        return jsonify({'error': 'Game not found'}), 404
    
    game = game_state[game_id]
    
    if game['mode'] != 'party':
        return jsonify({'error': 'Not a party mode game'}), 400
    
    if game['party_card_shown']:
        return jsonify({'card': None, 'allShown': True})
    
    # Select a random party card
    card = random.choice(PARTY_CARDS)
    game['party_card_shown'] = True
    
    return jsonify({
        'card': card,
        'allShown': False
    })

@app.route('/api/reset-game', methods=['POST'])
def reset_game():
    data = request.json
    game_id = int(data.get('gameId'))
    
    if game_id in game_state:
        del game_state[game_id]
    
    return jsonify({'success': True})

if __name__ == '__main__':
    # Production: use environment variables or defaults
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=debug_mode, host='0.0.0.0', port=port)

