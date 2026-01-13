import sqlite3
import bcrypt

conn = sqlite3.connect('dating_app.db')
c = conn.cursor()

pw = bcrypt.hashpw(b'Test123!', bcrypt.gensalt())

c.execute('''INSERT OR REPLACE INTO user 
    (id, first_name, last_name, email, password_hash, gender, role, is_active) 
    VALUES (999, 'Test', 'User', 'test@test.com', ?, 'male', 'user', 1)''', (pw,))

conn.commit()
print('Test user created!')
print('Email: test@test.com')
print('Password: Test123!')
conn.close()
