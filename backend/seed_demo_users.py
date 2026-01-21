"""
Seed Demo Users Script (DEV ONLY)
Creates 40 diverse demo users with unique profiles for development/testing.

Usage: python seed_demo_users.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db, User
import bcrypt
from datetime import datetime, timedelta
import random

# ============================================================================
# DIVERSE DEMO USER DATA - Each user has unique bio, music, lifestyle fields
# ============================================================================

# Unique bios for each user
BIOS = [
    "Product designer by day, amateur chef by night. Looking for someone to taste-test my experiments.",
    "Software engineer who believes the best code is written after midnight. Coffee addict.",
    "Yoga instructor seeking balance in life and love. Let's flow together.",
    "Startup founder building the next big thing. Need a co-pilot for this crazy ride.",
    "Marine biologist fascinated by the ocean's mysteries. Scuba diving is my therapy.",
    "Jazz pianist playing at local bars. Music is my love language.",
    "Architect designing sustainable homes. Building a better future, one blueprint at a time.",
    "Travel photographer chasing sunsets around the world. 47 countries and counting.",
    "ER nurse with a dark sense of humor. I've seen it all, nothing shocks me anymore.",
    "Stand-up comedian testing new material. Warning: I might make you laugh at inappropriate times.",
    "Vegan chef proving plant-based food can be delicious. Let me cook for you.",
    "Cryptocurrency trader riding the waves. High risk, high reward - in life and love.",
    "Elementary school teacher shaping young minds. Patience is my superpower.",
    "Personal trainer helping people become their best selves. Let's crush goals together.",
    "Documentary filmmaker telling untold stories. Every person has a story worth sharing.",
    "Sommelier with a passion for natural wines. I can pair wine with any mood.",
    "Tattoo artist turning skin into canvas. Every tattoo tells a story.",
    "Environmental lawyer fighting for the planet. Justice is my middle name.",
    "Food blogger eating my way through Tel Aviv. My stomach is my compass.",
    "DJ spinning electronic beats at underground parties. The night is young.",
    "Veterinarian who talks to animals (they don't talk back, but I try). Dog mom x3.",
    "Data scientist finding patterns in chaos. Numbers tell the best stories.",
    "Ceramic artist creating functional art. My hands are always covered in clay.",
    "Surf instructor riding waves since age 5. The ocean is my office.",
    "Psychologist helping people find themselves. I'm a great listener.",
    "Vintage clothing dealer with an eye for rare finds. Fashion is time travel.",
    "Podcast host interviewing fascinating people. Got a story? Let's record it.",
    "Pastry chef making dreams come true, one croissant at a time.",
    "Urban farmer growing vegetables on rooftops. The future of food is vertical.",
    "Meditation teacher finding peace in chaos. Breathe in, breathe out.",
    "Graffiti artist beautifying the city one wall at a time. Art belongs to everyone.",
    "Wine importer bringing the world's best bottles to Israel. Cheers to that.",
    "Pilates instructor helping people find their core. Strong body, strong mind.",
    "Tech recruiter connecting talent with opportunity. I know everyone.",
    "Florist creating botanical magic. Say it with flowers.",
    "Mixologist crafting cocktails that tell stories. What's your poison?",
    "Yoga retreat organizer taking people on journeys. Namaste.",
    "Street food vendor serving the best shawarma in town. Come hungry.",
    "Interior designer transforming spaces. Your home should tell your story.",
    "Music producer creating beats in my bedroom studio. Next hit loading...",
]

# Unique music preferences
MUSIC_PREFERENCES = [
    "Indie folk, Bon Iver, Fleet Foxes",
    "90s hip-hop, Nas, Wu-Tang Clan",
    "Classical piano, Chopin, Debussy",
    "Electronic, Moderat, Bonobo",
    "Israeli rock, Shalom Hanoch, Kaveret",
    "Jazz standards, Chet Baker, Miles Davis",
    "Reggae vibes, Bob Marley, Steel Pulse",
    "K-pop, BTS, BLACKPINK",
    "Latin beats, Bad Bunny, J Balvin",
    "Punk rock, Green Day, Blink-182",
    "R&B soul, Frank Ocean, SZA",
    "Techno, Charlotte de Witte, Amelie Lens",
    "Country, Johnny Cash, Dolly Parton",
    "Afrobeats, Burna Boy, Wizkid",
    "Shoegaze, My Bloody Valentine, Slowdive",
    "Mediterranean, Idan Raichel, Yasmin Levy",
    "Disco funk, Daft Punk, Nile Rodgers",
    "Acoustic singer-songwriter, Damien Rice",
    "Heavy metal, Metallica, Iron Maiden",
    "Bossa nova, João Gilberto, Astrud Gilberto",
    "Trip-hop, Massive Attack, Portishead",
    "Synthwave, The Midnight, FM-84",
    "World music, Tinariwen, Bombino",
    "Blues, B.B. King, Stevie Ray Vaughan",
    "House music, Disclosure, Kaytranada",
    "Alternative rock, Radiohead, The National",
    "Mizrahi, Omer Adam, Eyal Golan",
    "Ambient, Brian Eno, Tycho",
    "Garage rock, The Strokes, Arctic Monkeys",
    "Neo-soul, Erykah Badu, D'Angelo",
    "Psytrance, Infected Mushroom, Astrix",
    "Folk rock, Mumford & Sons, The Lumineers",
    "Drum and bass, Noisia, Pendulum",
    "Opera, Pavarotti, Maria Callas",
    "Grunge, Nirvana, Pearl Jam",
    "Trap, Travis Scott, Future",
    "Flamenco, Paco de Lucía, Rosalía",
    "Post-rock, Explosions in the Sky, Sigur Rós",
    "Motown classics, Marvin Gaye, Stevie Wonder",
    "Experimental, Björk, Aphex Twin",
]

# Lifestyle choices
DRINKING_CHOICES = ["Never", "Socially", "Regularly", "Only wine", "Craft beer enthusiast", "Cocktail lover"]
SMOKING_CHOICES = ["Never", "Socially", "Trying to quit", "Occasionally"]
EXERCISE_CHOICES = ["Daily", "3-4 times a week", "Weekly", "Sometimes", "Rarely", "Does walking count?"]
DIET_CHOICES = ["Everything", "Vegetarian", "Vegan", "Pescatarian", "Keto", "Gluten-free", "No restrictions"]
PETS = ["Dog lover", "Cat person", "Both cats and dogs", "No pets yet", "Fish tank", "Allergic sadly"]
KIDS_CHOICES = ["Want someday", "Don't want", "Have kids", "Open to it", "Not sure yet"]
STAR_SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]

# Heights (in cm)
HEIGHTS = list(range(155, 195, 3))  # 155, 158, 161, ..., 192

# Ages
AGES = list(range(22, 42))  # 22-41

# Demo user data with truly diverse values
DEMO_USERS = [
    {"first_name": "Maya", "last_name": "Cohen", "gender": "Woman", "residence": "Tel Aviv - Rothschild", "place_of_origin": "Haifa", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Photography, Wine tasting, Rooftop yoga", "interests": "Design, Architecture, Jazz", "latitude": 32.0653, "longitude": 34.7758},
    {"first_name": "Daniel", "last_name": "Levi", "gender": "Man", "residence": "Ramat Gan - Diamond Exchange", "place_of_origin": "Jerusalem", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Rock climbing, Board games, Podcasts", "interests": "AI, Philosophy, Whiskey", "latitude": 32.0800, "longitude": 34.8100},
    {"first_name": "Noa", "last_name": "Shapira", "gender": "Woman", "residence": "Herzliya Marina", "place_of_origin": "Eilat", "looking_for": "Something casual", "relationship_type": "Casual", "hobbies": "Kitesurfing, Freediving, Beach volleyball", "interests": "Marine life, Sunsets, Cocktails", "latitude": 32.1663, "longitude": 34.7936},
    {"first_name": "Yoav", "last_name": "Mizrahi", "gender": "Man", "residence": "Givatayim", "place_of_origin": "Beer Sheva", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Esports, Anime, Craft beer brewing", "interests": "Gaming culture, Japanese food, Sci-fi", "latitude": 32.0680, "longitude": 34.8148},
    {"first_name": "Shira", "last_name": "Goldberg", "gender": "Woman", "residence": "Tel Aviv - Neve Tzedek", "place_of_origin": "Netanya", "looking_for": "New friends", "relationship_type": "Friendship", "hobbies": "Salsa dancing, Pottery, Vintage shopping", "interests": "Theater, Art galleries, Natural wine", "latitude": 32.0600, "longitude": 34.7650},
    {"first_name": "Omer", "last_name": "Katz", "gender": "Man", "residence": "Tel Aviv - Florentin", "place_of_origin": "Haifa", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Street photography, Vinyl collecting, Cooking", "interests": "Urban art, Coffee culture, Documentaries", "latitude": 32.0580, "longitude": 34.7700},
    {"first_name": "Tamar", "last_name": "Avraham", "gender": "Woman", "residence": "Jaffa - Flea Market area", "place_of_origin": "Tiberias", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Meditation retreats, Herbalism, Journaling", "interests": "Spirituality, Astrology, Organic food", "latitude": 32.0515, "longitude": 34.7510},
    {"first_name": "Itay", "last_name": "Ben David", "gender": "Man", "residence": "Tel Aviv - Port area", "place_of_origin": "Ashdod", "looking_for": "Something casual", "relationship_type": "Casual", "hobbies": "DJing, Surfing, Skateboarding", "interests": "Electronic music, Beach culture, Festivals", "latitude": 32.0970, "longitude": 34.7730},
    {"first_name": "Yael", "last_name": "Peretz", "gender": "Woman", "residence": "Ramat HaSharon", "place_of_origin": "Petah Tikva", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Pilates, Interior design, Brunch hopping", "interests": "Home decor, Fashion, Wellness", "latitude": 32.1456, "longitude": 34.8389},
    {"first_name": "Eyal", "last_name": "Rosen", "gender": "Man", "residence": "Tel Aviv - Sarona", "place_of_origin": "Rishon LeZion", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "CrossFit, Meal prepping, Mountain biking", "interests": "Fitness, Nutrition, Entrepreneurship", "latitude": 32.0720, "longitude": 34.7850},
    {"first_name": "Michal", "last_name": "Stern", "gender": "Woman", "residence": "Tel Aviv - Old North", "place_of_origin": "Jerusalem", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Book clubs, Museum visits, Ceramics", "interests": "History, Literature, Classical music", "latitude": 32.0920, "longitude": 34.7810},
    {"first_name": "Alon", "last_name": "Friedman", "gender": "Man", "residence": "Herzliya Pituach", "place_of_origin": "Tel Aviv", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Sailing, Wine collecting, Golf", "interests": "Investing, Fine dining, Travel", "latitude": 32.1700, "longitude": 34.8200},
    {"first_name": "Roni", "last_name": "Azulay", "gender": "Woman", "residence": "Tel Aviv - Kerem HaTeimanim", "place_of_origin": "Rehovot", "looking_for": "Something casual", "relationship_type": "Casual", "hobbies": "Festival hopping, Acro yoga, Backpacking", "interests": "World music, Adventure travel, Spirituality", "latitude": 32.0630, "longitude": 34.7680},
    {"first_name": "Noam", "last_name": "Levy", "gender": "Non-binary", "residence": "Tel Aviv - Shapira", "place_of_origin": "Haifa", "looking_for": "New friends", "relationship_type": "Friendship", "hobbies": "Zine making, Poetry slams, Community organizing", "interests": "LGBTQ+ activism, Indie music, Social justice", "latitude": 32.0530, "longitude": 34.7780},
    {"first_name": "Gal", "last_name": "Mor", "gender": "Woman", "residence": "Tel Aviv - Lev Hair", "place_of_origin": "Kfar Saba", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Vinyasa yoga, Plant-based cooking, Farmers markets", "interests": "Sustainability, Wellness, Mindfulness", "latitude": 32.0750, "longitude": 34.7750},
    {"first_name": "Amit", "last_name": "Haim", "gender": "Man", "residence": "Tel Aviv - Montefiore", "place_of_origin": "Modiin", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Road cycling, Tech meetups, Specialty coffee", "interests": "Startups, Innovation, Gadgets", "latitude": 32.0680, "longitude": 34.7720},
    {"first_name": "Lior", "last_name": "Dahan", "gender": "Woman", "residence": "Tel Aviv - Florentin", "place_of_origin": "Bat Yam", "looking_for": "Something casual", "relationship_type": "Casual", "hobbies": "Graffiti tours, Underground parties, Thrift shopping", "interests": "Street art, Electronic music, Urban culture", "latitude": 32.0560, "longitude": 34.7690},
    {"first_name": "Ido", "last_name": "Shalom", "gender": "Man", "residence": "Tel Aviv - Basel area", "place_of_origin": "Nahariya", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Scuba diving, Underwater photography, Sailing", "interests": "Marine conservation, Travel, Nature", "latitude": 32.0830, "longitude": 34.7750},
    {"first_name": "Hila", "last_name": "Biton", "gender": "Woman", "residence": "Ramat Aviv", "place_of_origin": "Dimona", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Marathon training, Dog walking, Brunch spots", "interests": "Fitness, Animals, Food blogging", "latitude": 32.1130, "longitude": 34.8040},
    {"first_name": "Rotem", "last_name": "Golan", "gender": "Woman", "residence": "Tel Aviv - Dizengoff", "place_of_origin": "Tiberias", "looking_for": "New friends", "relationship_type": "Friendship", "hobbies": "Landscape photography, Camping, Birdwatching", "interests": "Nature, Wildlife, Hiking trails", "latitude": 32.0800, "longitude": 34.7740},
    {"first_name": "Ori", "last_name": "Naor", "gender": "Man", "residence": "Givatayim - Borochov", "place_of_origin": "Holon", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Retro gaming, Comic conventions, Home cooking", "interests": "Sci-fi, Fantasy, Board games", "latitude": 32.0700, "longitude": 34.8120},
    {"first_name": "Sapir", "last_name": "Amar", "gender": "Woman", "residence": "Tel Aviv - Habima", "place_of_origin": "Ashkelon", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Fashion styling, Content creation, Skincare", "interests": "Beauty trends, Social media, Shopping", "latitude": 32.0730, "longitude": 34.7780},
    {"first_name": "Tom", "last_name": "Carmel", "gender": "Man", "residence": "Tel Aviv - Gordon Beach", "place_of_origin": "Hadera", "looking_for": "Something casual", "relationship_type": "Casual", "hobbies": "Surfing, Beach volleyball, Sunset sessions", "interests": "Beach life, Reggae, Chill vibes", "latitude": 32.0850, "longitude": 34.7680},
    {"first_name": "Dana", "last_name": "Yosef", "gender": "Woman", "residence": "Tel Aviv - Bavli", "place_of_origin": "Raanana", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Tennis, Wine tasting, Theater", "interests": "Performing arts, Fine wine, Culture", "latitude": 32.1050, "longitude": 34.7920},
    {"first_name": "Matan", "last_name": "Eliyahu", "gender": "Man", "residence": "Tel Aviv - Yemenite Quarter", "place_of_origin": "Carmiel", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Guitar playing, Songwriting, Open mics", "interests": "Live music, Folk, Acoustic sessions", "latitude": 32.0640, "longitude": 34.7670},
    {"first_name": "Inbar", "last_name": "Segal", "gender": "Woman", "residence": "Tel Aviv - Nachalat Binyamin", "place_of_origin": "Safed", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Jewelry making, Art markets, Tarot reading", "interests": "Handcrafts, Mysticism, Bohemian style", "latitude": 32.0660, "longitude": 34.7710},
    {"first_name": "Guy", "last_name": "Ashkenazi", "gender": "Man", "residence": "Ramat Gan - City Center", "place_of_origin": "Netanya", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Stand-up comedy, Improv, Trivia nights", "interests": "Comedy, Humor, Social gatherings", "latitude": 32.0830, "longitude": 34.8180},
    {"first_name": "Neta", "last_name": "Barak", "gender": "Woman", "residence": "Tel Aviv - Ramat HaYarkon", "place_of_origin": "Herzliya", "looking_for": "Something casual", "relationship_type": "Casual", "hobbies": "Paddleboarding, Outdoor yoga, Smoothie making", "interests": "Healthy living, Nature, Morning routines", "latitude": 32.1000, "longitude": 34.7900},
    {"first_name": "Nadav", "last_name": "Zohar", "gender": "Man", "residence": "Tel Aviv - Kikar Hamedina", "place_of_origin": "Ramat Hasharon", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Architecture tours, Design exhibitions, Espresso", "interests": "Modern design, Art, Urban planning", "latitude": 32.0950, "longitude": 34.7850},
    {"first_name": "Keren", "last_name": "Tal", "gender": "Woman", "residence": "Jaffa - Ajami", "place_of_origin": "Acre", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Arabic cooking, Oud music, Calligraphy", "interests": "Middle Eastern culture, History, Coexistence", "latitude": 32.0480, "longitude": 34.7490},
    {"first_name": "Tomer", "last_name": "Gabay", "gender": "Man", "residence": "Tel Aviv - Neve Sha'anan", "place_of_origin": "Sderot", "looking_for": "New friends", "relationship_type": "Friendship", "hobbies": "Street food tours, Language exchange, Volunteering", "interests": "Multiculturalism, Social impact, Community", "latitude": 32.0550, "longitude": 34.7750},
    {"first_name": "Lihi", "last_name": "Oren", "gender": "Woman", "residence": "Tel Aviv - Gan HaHashmal", "place_of_origin": "Kiryat Shmona", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Cocktail making, Jazz clubs, Late night talks", "interests": "Mixology, Live music, Deep conversations", "latitude": 32.0690, "longitude": 34.7760},
    {"first_name": "Yuval", "last_name": "Dror", "gender": "Man", "residence": "Herzliya - West", "place_of_origin": "Kfar Saba", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Tennis, Sailing, Wine collecting", "interests": "Sports, Luxury travel, Fine dining", "latitude": 32.1620, "longitude": 34.8000},
    {"first_name": "Shani", "last_name": "Lev", "gender": "Woman", "residence": "Tel Aviv - Kiryat HaMelacha", "place_of_origin": "Bnei Brak", "looking_for": "Something casual", "relationship_type": "Casual", "hobbies": "Tattoo culture, Punk shows, Zine collecting", "interests": "Alternative culture, DIY, Counterculture", "latitude": 32.0610, "longitude": 34.7820},
    {"first_name": "Ran", "last_name": "Avivi", "gender": "Man", "residence": "Tel Aviv - Neve Ofer", "place_of_origin": "Yokneam", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Meditation, Breathwork, Cold plunges", "interests": "Biohacking, Wellness, Personal growth", "latitude": 32.0570, "longitude": 34.7640},
    {"first_name": "Mor", "last_name": "Hadad", "gender": "Woman", "residence": "Ramat Gan - Nahalat Ganim", "place_of_origin": "Ofakim", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Baking, Gardening, Knitting", "interests": "Homemade everything, Slow living, Cottagecore", "latitude": 32.0750, "longitude": 34.8200},
    {"first_name": "Elad", "last_name": "Shemer", "gender": "Man", "residence": "Tel Aviv - Shapira", "place_of_origin": "Lod", "looking_for": "Something casual", "relationship_type": "Casual", "hobbies": "Vinyl DJing, Record digging, Warehouse parties", "interests": "House music, Club culture, Sound systems", "latitude": 32.0520, "longitude": 34.7770},
    {"first_name": "Ayelet", "last_name": "Weiss", "gender": "Woman", "residence": "Tel Aviv - Tzahala", "place_of_origin": "Savyon", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Horse riding, Country clubs, Charity events", "interests": "Philanthropy, Equestrian, High society", "latitude": 32.1150, "longitude": 34.8100},
    {"first_name": "Shai", "last_name": "Malka", "gender": "Man", "residence": "Tel Aviv - HaTikva", "place_of_origin": "Yeruham", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Mizrahi music, Backgammon, Family gatherings", "interests": "Traditional culture, Community, Good food", "latitude": 32.0500, "longitude": 34.8050},
    {"first_name": "Efrat", "last_name": "Nimrod", "gender": "Woman", "residence": "Tel Aviv - Neve Avivim", "place_of_origin": "Ramat Gan", "looking_for": "Relationship", "relationship_type": "Long-term", "hobbies": "Art collecting, Gallery openings, Writing", "interests": "Contemporary art, Literature, Intellectual discourse", "latitude": 32.1100, "longitude": 34.7980},
]

# Placeholder photo URLs (Unsplash)
PHOTO_URLS = {
    "Woman": [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
    ],
    "Man": [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=800&q=80",
    ],
    "Non-binary": [
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    ],
}


def seed_demo_users():
    """Create demo users in the database with diverse profiles."""
    with app.app_context():
        # Check if demo users already exist
        existing_count = User.query.filter(User.email.like('%@demo.pulse.app')).count()
        if existing_count > 0:
            print(f"Found {existing_count} existing demo users. Skipping seed.")
            print("To re-seed, first delete existing demo users:")
            print("  DELETE FROM user WHERE email LIKE '%@demo.pulse.app';")
            return
        
        created_count = 0
        photo_index = {"Woman": 0, "Man": 0, "Non-binary": 0}
        
        for i, user_data in enumerate(DEMO_USERS):
            # Generate unique email
            email = f"demo{i+1}@demo.pulse.app"
            
            # Check if email already exists
            if User.query.filter_by(email=email).first():
                print(f"Skipping {user_data['first_name']} - email exists")
                continue
            
            # Generate password hash
            password_hash = bcrypt.hashpw("demo123".encode('utf-8'), bcrypt.gensalt())
            
            # Get photo URL based on gender
            gender = user_data.get("gender", "Woman")
            photos = PHOTO_URLS.get(gender, PHOTO_URLS["Woman"])
            photo_url = photos[photo_index[gender] % len(photos)]
            photo_index[gender] += 1
            
            # Assign unique bio and music from arrays (cycling if needed)
            bio = BIOS[i % len(BIOS)]
            music = MUSIC_PREFERENCES[i % len(MUSIC_PREFERENCES)]
            
            # Assign diverse lifestyle values
            age = AGES[i % len(AGES)]
            height = HEIGHTS[i % len(HEIGHTS)]
            drinking = DRINKING_CHOICES[i % len(DRINKING_CHOICES)]
            smoking = SMOKING_CHOICES[i % len(SMOKING_CHOICES)]
            exercise = EXERCISE_CHOICES[i % len(EXERCISE_CHOICES)]
            diet = DIET_CHOICES[i % len(DIET_CHOICES)]
            pets = PETS[i % len(PETS)]
            kids = KIDS_CHOICES[i % len(KIDS_CHOICES)]
            star_sign = STAR_SIGNS[i % len(STAR_SIGNS)]
            
            # Build approach_preferences with lifestyle data (JSON-like string for storage)
            lifestyle_data = f"age:{age}|height:{height}|drinking:{drinking}|smoking:{smoking}|exercise:{exercise}|diet:{diet}|pets:{pets}|kids:{kids}|starSign:{star_sign}"
            
            # Create user with diverse data
            user = User(
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                email=email,
                password_hash=password_hash,
                gender=user_data.get("gender"),
                residence=user_data.get("residence"),
                place_of_origin=user_data.get("place_of_origin"),
                looking_for=user_data.get("looking_for"),
                relationship_type=user_data.get("relationship_type"),
                hobbies=bio,  # Use unique bio as hobbies field
                interests=user_data.get("interests"),
                favorite_songs=music,  # Store music preferences
                approach_preferences=lifestyle_data,  # Store lifestyle data
                latitude=user_data.get("latitude"),
                longitude=user_data.get("longitude"),
                is_active=True,
                last_active=datetime.utcnow() - timedelta(minutes=random.randint(5, 120)),
            )
            
            db.session.add(user)
            created_count += 1
            print(f"Created: {user.first_name} {user.last_name} ({email}) - {bio[:40]}...")
        
        db.session.commit()
        print(f"\n✅ Successfully created {created_count} demo users!")
        print("Demo users can login with password: demo123")


def validate_diversity():
    """Dev-only: Sample 5 random users and print key fields to verify diversity."""
    with app.app_context():
        users = User.query.filter(User.email.like('%@demo.pulse.app')).order_by(db.func.random()).limit(5).all()
        
        print("\n" + "=" * 60)
        print("DIVERSITY VALIDATION - 5 Random Users")
        print("=" * 60)
        
        for user in users:
            print(f"\n👤 {user.first_name} {user.last_name} (ID: {user.id})")
            print(f"   Gender: {user.gender}")
            print(f"   Location: {user.residence}")
            print(f"   From: {user.place_of_origin}")
            print(f"   Looking for: {user.looking_for}")
            print(f"   Bio: {user.hobbies[:60]}..." if user.hobbies and len(user.hobbies) > 60 else f"   Bio: {user.hobbies}")
            print(f"   Music: {user.favorite_songs}")
            print(f"   Interests: {user.interests}")
            if user.approach_preferences:
                # Parse lifestyle data
                lifestyle = dict(item.split(':') for item in user.approach_preferences.split('|') if ':' in item)
                print(f"   Age: {lifestyle.get('age', 'N/A')}, Height: {lifestyle.get('height', 'N/A')}cm")
                print(f"   Drinking: {lifestyle.get('drinking', 'N/A')}, Smoking: {lifestyle.get('smoking', 'N/A')}")
                print(f"   Exercise: {lifestyle.get('exercise', 'N/A')}, Diet: {lifestyle.get('diet', 'N/A')}")
        
        print("\n" + "=" * 60)


if __name__ == "__main__":
    print("=" * 50)
    print("Pulse Dating App - Demo User Seeder (DEV ONLY)")
    print("=" * 50)
    seed_demo_users()
