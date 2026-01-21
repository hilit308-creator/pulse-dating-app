import sqlite3
import bcrypt

conn = sqlite3.connect('instance/dating_app.db')
cursor = conn.cursor()

# Check if todays_picks table exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='todays_picks'")
if cursor.fetchone():
    cursor.execute('DELETE FROM todays_picks')
    conn.commit()
    print('Today\'s Picks cleared')
else:
    print('todays_picks table does not exist yet')

# Check total users
cursor.execute('SELECT COUNT(*) FROM user')
total_users = cursor.fetchone()[0]
print(f'Total users: {total_users}')

# If no users, create demo users
if total_users == 0:
    print('Creating demo users...')
    
    demo_users = [
        ('Maya', 'Cohen', 'maya@demo.com', 'Woman', 'Men'),
        ('Noa', 'Levi', 'noa@demo.com', 'Woman', 'Men'),
        ('Shira', 'Mizrahi', 'shira@demo.com', 'Woman', 'Men'),
        ('Yael', 'Goldberg', 'yael@demo.com', 'Woman', 'Everyone'),
        ('Tamar', 'Shapiro', 'tamar@demo.com', 'Woman', 'Men'),
        ('Daniel', 'Cohen', 'daniel@demo.com', 'Man', 'Women'),
        ('Omer', 'Levi', 'omer@demo.com', 'Man', 'Women'),
        ('Yonatan', 'Mizrahi', 'yonatan@demo.com', 'Man', 'Women'),
        ('Amit', 'Goldberg', 'amit@demo.com', 'Man', 'Everyone'),
        ('Eyal', 'Shapiro', 'eyal@demo.com', 'Man', 'Women'),
    ]
    
    password_hash = bcrypt.hashpw('demo123'.encode('utf-8'), bcrypt.gensalt())
    
    for first, last, email, gender, show_me in demo_users:
        cursor.execute('''
            INSERT INTO user (first_name, last_name, email, password_hash, gender, show_me, is_active, interests, hobbies)
            VALUES (?, ?, ?, ?, ?, ?, 1, 'Art,Music,Coffee,Travel', 'Reading,Hiking')
        ''', (first, last, email, password_hash, gender, show_me))
    
    conn.commit()
    print(f'Created {len(demo_users)} demo users')

# Make all users active
cursor.execute('UPDATE user SET is_active = 1')
conn.commit()

cursor.execute('SELECT COUNT(*) FROM user WHERE is_active = 1')
active_count = cursor.fetchone()[0]
print(f'Active users: {active_count}')

conn.close()
print('Done! Refresh the browser.')
