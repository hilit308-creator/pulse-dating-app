import sqlite3
import bcrypt

conn = sqlite3.connect('dating_app.db')
c = conn.cursor()

# Check current password hash
c.execute('SELECT email, password_hash FROM user WHERE email = "maya@demo.com"')
row = c.fetchone()
print('Email:', row[0])
print('Hash type:', type(row[1]))
print('Hash value:', row[1][:60] if row[1] else 'None')

# Reset password
pw = bcrypt.hashpw(b'demo123', bcrypt.gensalt())
print('\nNew hash:', pw)
print('New hash type:', type(pw))

c.execute('UPDATE user SET password_hash = ? WHERE email = "maya@demo.com"', (pw,))
conn.commit()
print('\nPassword updated!')

# Verify
c.execute('SELECT password_hash FROM user WHERE email = "maya@demo.com"')
stored = c.fetchone()[0]
print('Stored hash type:', type(stored))

# Test login
test_result = bcrypt.checkpw(b'demo123', stored if isinstance(stored, bytes) else stored.encode('utf-8') if stored else b'')
print('Login test result:', test_result)

conn.close()
