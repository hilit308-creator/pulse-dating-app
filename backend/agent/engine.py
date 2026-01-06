import re
import random
import hashlib

EMOJI_RE = re.compile(r"[\U00010000-\U0010ffff]", flags=re.UNICODE)

# Track recent suggestions to avoid repetition
_recent_suggestions = {}

# Keywords for mode detection - expanded with intensity levels
THERAPIST_KEYWORDS_HE = [
    "קשה לי", "מרגיש", "מרגישה", "עצוב", "עצובה", "לחוץ", "לחוצה", 
    "חרדה", "פחד", "בודד", "בודדה", "כואב", "מתוסכל", "מתוסכלת",
    "לא יודע מה לעשות", "צריך לדבר", "צריכה לדבר", "עזרה", "תמיכה",
    "משבר", "דיכאון", "חושב על", "חושבת על", "לא בסדר", "רע לי",
    "מבולבל", "מבולבלת", "לא מבין", "נשבר", "נשברת", "איבדתי",
    "אין לי כוח", "לא טוב לי", "מפחד", "מפחדת", "נשברתי", "אני בחרדה",
    "אני בדיכאון", "מרגיש לבד", "מרגישה לבד", "הכל נופל", "לא מצליח",
    "לא מצליחה", "מותש", "מותשת", "שחוק", "שחוקה"
]
THERAPIST_KEYWORDS_EN = [
    "feel", "feeling", "sad", "anxious", "stressed", "lonely", "hurt",
    "depressed", "scared", "worried", "overwhelmed", "lost", "confused",
    "need to talk", "help me", "support", "struggling", "hard time",
    "breaking down", "can't cope", "don't know what to do", "exhausted",
    "burned out", "falling apart", "i'm scared", "i'm afraid", "hopeless",
    "no energy", "not okay", "not doing well"
]

# Crisis keywords - require immediate support response
CRISIS_KEYWORDS_HE = [
    "להתאבד", "לסיים", "לא רוצה לחיות", "אין טעם לחיות", "לפגוע בעצמי",
    "לגמור עם הכל", "רוצה למות", "מחשבות על מוות", "לא רוצה להיות פה",
    "הכל יהיה יותר טוב בלעדי"
]
CRISIS_KEYWORDS_EN = [
    "suicide", "kill myself", "end it all", "don't want to live", "hurt myself",
    "self harm", "want to die", "no point living", "better off without me",
    "end my life"
]

COACH_KEYWORDS_HE = [
    "איך לכתוב", "מה לכתוב", "עזור לי לנסח", "ניסוח", "הצעה", "הצעות",
    "טיפים", "איך להגיב", "מה להגיד", "איך לפתוח", "פתיחה", "שיחה עם"
]
COACH_KEYWORDS_EN = [
    "how to write", "what to say", "help me phrase", "tips", "suggestions",
    "how to respond", "opening line", "conversation with", "chatting with"
]


def detect_crisis(text):
    """
    Detect if text contains crisis indicators.
    Returns: True if crisis detected, False otherwise
    """
    if not text:
        return False
    
    text_lower = text.lower()
    
    for kw in CRISIS_KEYWORDS_HE:
        if kw in text:
            return True
    for kw in CRISIS_KEYWORDS_EN:
        if kw in text_lower:
            return True
    
    return False


def detect_mode(text, context=None, messages=None):
    """
    Detect whether the user needs therapist (emotional support) or coach (messaging help).
    Also checks for crisis situations.
    
    Returns: dict with 'mode', 'crisis_flag', 'confidence'
    """
    result = {
        "mode": "coach",
        "crisis_flag": False,
        "confidence": 0.5
    }
    
    if not text:
        return result
    
    text_lower = text.lower()
    
    # Check for explicit mode in context (override)
    if context and context.get("requested_mode"):
        requested = context.get("requested_mode")
        if requested in ["coach", "therapist"]:
            result["mode"] = requested
            result["confidence"] = 1.0
            return result
    
    # Check crisis first - highest priority
    if detect_crisis(text):
        result["mode"] = "therapist"
        result["crisis_flag"] = True
        result["confidence"] = 0.95
        return result
    
    # Also check recent messages for crisis patterns
    if messages:
        recent_text = " ".join([m.get("text", "") for m in messages[-5:] if m.get("from") == "me"])
        if detect_crisis(recent_text):
            result["mode"] = "therapist"
            result["crisis_flag"] = True
            result["confidence"] = 0.9
            return result
    
    # Score therapist keywords
    therapist_score = 0
    for kw in THERAPIST_KEYWORDS_HE:
        if kw in text:
            therapist_score += 1
    for kw in THERAPIST_KEYWORDS_EN:
        if kw in text_lower:
            therapist_score += 1
    
    # Score coach keywords
    coach_score = 0
    for kw in COACH_KEYWORDS_HE:
        if kw in text:
            coach_score += 1
    for kw in COACH_KEYWORDS_EN:
        if kw in text_lower:
            coach_score += 1
    
    # Determine mode based on scores
    if therapist_score > 0 and therapist_score >= coach_score:
        result["mode"] = "therapist"
        result["confidence"] = min(0.9, 0.6 + therapist_score * 0.1)
    elif coach_score > 0:
        result["mode"] = "coach"
        result["confidence"] = min(0.9, 0.6 + coach_score * 0.1)
    else:
        # Default to coach
        result["mode"] = "coach"
        result["confidence"] = 0.5
    
    return result


def make_therapist_response(messages, context=None):
    """
    Generate an empathetic therapist-style response.
    No suggestions to copy - just supportive text.
    """
    last_user_msg = ""
    for m in reversed(messages):
        if m.get("from") == "me" and m.get("text"):
            last_user_msg = m.get("text", "")
            break
    
    # Check for crisis
    crisis_patterns = [
        r"לסיים|להתאבד|לא רוצה לחיות|אין טעם|suicide|kill myself|end it"
    ]
    is_crisis = any(re.search(p, last_user_msg, re.I) for p in crisis_patterns)
    
    if is_crisis:
        return (
            "מצטער/ת לשמוע שזה כל כך קשה עכשיו. "
            "אם יש סכנה מיידית או תחושת משבר, חשוב לפנות לעזרה דחופה: "
            "ער\"ן (1201) או נט\"ל (1-800-363-363). "
            "אני כאן לשיחה תומכת, אבל לא במקום טיפול מקצועי או סיוע חירום. "
            "את/ה לא לבד בזה. 💙"
        )
    
    # Empathetic responses
    responses = [
        "תודה ששיתפת אותי. מה שאת/ה מרגיש/ה חשוב ומובן. "
        "אפשר לנסות צעד קטן: לנשום עמוק, ולשאול את עצמך מה צריך הגוף או הנפש עכשיו?",
        
        "אני שומע/ת אותך. לפעמים רק לדבר על זה כבר עוזר. "
        "מה הדבר הכי קטן שיכול להרגיש קצת יותר טוב עכשיו?",
        
        "זה נשמע מאתגר. את/ה לא צריך/ה להתמודד עם הכל בבת אחת. "
        "בוא/י נתמקד ברגע הזה - מה הכי מעיק עליך עכשיו?",
        
        "מרגיש שיש פה משהו חשוב. אני כאן להקשיב. "
        "ספר/י לי עוד - מה קורה?",
        
        "תודה על האמון. לפעמים הדברים הכי קשים הם אלה שצריך להגיד בקול. "
        "אני כאן. מה עוד תרצה/י לשתף?"
    ]
    
    return random.choice(responses)

def _style_profile(messages):
    """Analyze user's writing style from their messages"""
    mine = [m.get("text", "") for m in messages if m.get("from") == "me" and m.get("text")]
    if not mine:
        return {"avg_len": 18, "emoji_rate": 0.15, "lang": "he"}

    avg_len = sum(len(t) for t in mine) / max(1, len(mine))
    emoji_rate = sum(1 for t in mine if EMOJI_RE.search(t)) / max(1, len(mine))
    he = sum(1 for t in mine if re.search(r"[\u0590-\u05FF]", t))
    lang = "he" if he >= len(mine) / 2 else "en"
    return {"avg_len": avg_len, "emoji_rate": emoji_rate, "lang": lang}


def _last_them(messages):
    """Get the last message from the other person"""
    for m in reversed(messages):
        if m.get("from") == "them" and (m.get("text") or "").strip():
            return m.get("text", "")
    return ""


def should_abstain(messages, context):
    """
    Decide if the agent should abstain from making suggestions.
    Returns (should_abstain: bool, reason_code: str or None)
    """
    # Social Context Awareness (V1 basic)
    social = (context or {}).get("social_load", {}) or {}
    active_chats = int(social.get("active_chats", 1))
    is_primary = bool(social.get("is_primary", True))

    last_them = _last_them(messages)
    turns = len([m for m in messages if (m.get("text") or "").strip()])

    # No signal at all
    if turns <= 1 and not last_them:
        return True, "no_signal"

    # Prevent over-investment in secondary chat when user is busy
    if active_chats >= 5 and not is_primary:
        return True, "over_investment_risk"

    # Detect flowing conversation - if user has been responding well, don't interrupt
    my_msgs = [m for m in messages if m.get("from") == "me" and (m.get("text") or "").strip()]
    their_msgs = [m for m in messages if m.get("from") == "them" and (m.get("text") or "").strip()]
    
    if len(my_msgs) >= 3 and len(their_msgs) >= 3:
        # Check if recent messages are balanced (good flow)
        recent = messages[-6:] if len(messages) >= 6 else messages
        my_recent = sum(1 for m in recent if m.get("from") == "me")
        their_recent = sum(1 for m in recent if m.get("from") == "them")
        
        # If conversation is balanced and flowing, abstain sometimes (30% chance)
        if 2 <= my_recent <= 4 and 2 <= their_recent <= 4:
            if random.random() < 0.3:
                return True, "flowing_conversation"

    # Don't suggest if user just sent multiple messages in a row
    if len(messages) >= 2:
        last_two = messages[-2:]
        if all(m.get("from") == "me" for m in last_two):
            return True, "user_momentum"

    return False, None


def _detect_question(text):
    """Check if message contains a question"""
    question_words_he = ["מה", "איך", "למה", "מתי", "איפה", "מי", "האם", "כמה"]
    question_words_en = ["what", "how", "why", "when", "where", "who", "do you", "are you", "have you", "would you"]
    text_lower = text.lower()
    return "?" in text or any(w in text_lower for w in question_words_en) or any(w in text for w in question_words_he)

def _detect_topic(text):
    """Extract simple topic hints from message"""
    topics = {
        "travel": ["travel", "trip", "vacation", "flight", "טיול", "נסיעה", "חופשה"],
        "food": ["food", "eat", "restaurant", "coffee", "אוכל", "מסעדה", "קפה", "brunch"],
        "music": ["music", "song", "concert", "מוזיקה", "שיר", "הופעה"],
        "art": ["art", "gallery", "museum", "אמנות", "גלריה", "מוזיאון"],
        "sports": ["gym", "workout", "run", "sport", "ספורט", "כושר"],
        "photo": ["photo", "picture", "shoot", "צילום", "תמונה"],
        "work": ["work", "job", "office", "עבודה", "משרד"],
    }
    text_lower = text.lower()
    for topic, keywords in topics.items():
        if any(k in text_lower for k in keywords):
            return topic
    return None

def make_suggestions(user_id, chat_id, counterparty_id, messages, context, preferences):
    """
    Generate message suggestions based on conversation context and user style.
    Returns dict with 'goal' and 'suggestions' list.
    """
    global _recent_suggestions
    
    style = _style_profile(messages)
    last = _last_them(messages)
    trigger = (context or {}).get("trigger_type", "unknown")
    
    # Analyze last message
    is_question = _detect_question(last) if last else False
    topic = _detect_topic(last) if last else None

    # Dynamic goal
    goal = preferences.get("intent") or ("open" if not last else "maintain_flow")

    add_emoji = style["emoji_rate"] >= 0.2
    short = style["avg_len"] <= 28

    def e(s):
        return s + " 😊" if add_emoji and "😊" not in s else s

    # Extended pools for more variety on Regenerate
    pools = {
        "he": {
            "question": [
                e("כן, בהחלט! ספר/י לי עוד"),
                e("תלוי... מה את/ה חושב/ת?"),
                e("דווקא כן, למה את/ה שואל/ת?"),
                e("בטח! מה עוד תרצה/י לדעת?"),
                e("אשמח לענות—שאל/י עוד"),
                e("כן, ואת/ה?"),
            ],
            "travel": [
                e("איפה הכי אהבת לטייל?"),
                e("נשמע מדהים! איזה מקום הכי הפתיע אותך?"),
                e("אני גם מת/ה על טיולים—לאן הייתי צריך/ה לנסוע?"),
                e("מה הטיול הכי מטורף שעשית?"),
                e("יש לך מקום חלומי שעוד לא היית בו?"),
                e("טיסה ספונטנית או תכנון מראש?"),
            ],
            "food": [
                e("אוו איזה כיף! איזה אוכל הכי אוהב/ת?"),
                e("בוא/י נלך לאכול משהו ביחד?"),
                e("מה המקום הכי טוב שאת/ה מכיר/ה?"),
                e("בישול בבית או מסעדות?"),
                e("מה המנה שהכי קשה לך לעמוד בפניה?"),
                e("יש לך מתכון סודי?"),
            ],
            "photo": [
                e("וואו מגניב! תראה/י לי תמונות?"),
                e("איזה סוג צילום הכי אוהב/ת?"),
                e("נשמע מעניין—איך התחלת עם זה?"),
                e("מה הציוד שאת/ה משתמש/ת בו?"),
                e("יש לך תמונה שאת/ה הכי גאה בה?"),
            ],
            "open": [
                e("היי! איך עבר היום?"),
                e("מה שלומך עכשיו?"),
                e("מה קורה? בא לי לשמוע משהו טוב"),
                e("היי! מה חדש אצלך?"),
                e("מה עשית היום?"),
                e("איך השבוע שלך?"),
            ],
            "flow": [
                e("מסקרן אותי—ספר/י לי עוד"),
                e("נשמע כיף! איך הגעת לזה?"),
                e("אהבתי—תמשיך/י"),
                e("רגע, זה נשמע מעניין!"),
                e("ואז מה קרה?"),
                e("תספר/י עוד!"),
            ],
        },
        "en": {
            "question": [
                e("Yeah, definitely! Tell me more"),
                e("Hmm, depends... what do you think?"),
                e("Actually yes—why do you ask?"),
                e("For sure! What else would you like to know?"),
                e("Yes! And you?"),
                e("Good question—let me think..."),
            ],
            "travel": [
                e("Where's your favorite place to travel?"),
                e("Sounds amazing! What surprised you the most?"),
                e("I love traveling too—where should I go next?"),
                e("What's the craziest trip you've taken?"),
                e("Spontaneous trips or planned adventures?"),
                e("Any bucket list destinations?"),
            ],
            "food": [
                e("Ooh nice! What's your favorite cuisine?"),
                e("Want to grab something to eat together?"),
                e("What's the best spot you know?"),
                e("Cooking at home or eating out?"),
                e("What dish can you never resist?"),
                e("Got any secret recipes?"),
            ],
            "art": [
                e("Love that! What kind of art are you into?"),
                e("Let's check it out together sometime?"),
                e("What's the best exhibit you've seen?"),
                e("Do you create art yourself?"),
                e("What inspires you most?"),
            ],
            "open": [
                e("Hey! How was your day?"),
                e("What's up? How are you doing?"),
                e("Hi there! Tell me something good"),
                e("Hey! What's new with you?"),
                e("How's your week going?"),
                e("What have you been up to?"),
            ],
            "flow": [
                e("That's interesting—tell me more!"),
                e("Sounds fun! How'd you get into that?"),
                e("Love that—keep going"),
                e("Wait, that sounds cool!"),
                e("And then what happened?"),
                e("Tell me more!"),
            ],
        }
    }

    # Select the right pool
    lang = style["lang"]
    if is_question:
        pool_key = "question"
    elif topic in ["travel", "food", "photo", "art"]:
        pool_key = topic
    elif goal == "open":
        pool_key = "open"
    else:
        pool_key = "flow"
    
    all_cands = pools.get(lang, pools["en"]).get(pool_key, pools[lang]["flow"])
    
    # Avoid recent suggestions for this chat
    cache_key = f"{chat_id}:{pool_key}"
    recent = _recent_suggestions.get(cache_key, [])
    
    # Filter out recently used suggestions
    available = [c for c in all_cands if c not in recent]
    if len(available) < 3:
        available = all_cands  # Reset if pool exhausted
        _recent_suggestions[cache_key] = []
    
    # Shuffle for variety (especially on Regenerate)
    random.shuffle(available)
    cands = available[:3]
    
    # Track what we suggested
    _recent_suggestions[cache_key] = (_recent_suggestions.get(cache_key, []) + cands)[-6:]

    if short:
        cands = [c[:80] for c in cands]

    # Vary confidence slightly for naturalness
    conf_base = [0.82, 0.74, 0.65]
    suggestions = []
    for i, c in enumerate(cands):
        conf = conf_base[i] + random.uniform(-0.05, 0.05)
        suggestions.append({"text": c, "confidence": round(conf, 2), "tags": ["v1", "context-aware"]})

    return {"goal": goal, "suggestions": suggestions}
