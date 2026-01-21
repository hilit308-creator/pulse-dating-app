import sqlite3

conn = sqlite3.connect('instance/dating_app.db')
cursor = conn.cursor()

try:
    cursor.execute('ALTER TABLE user ADD COLUMN show_me VARCHAR(20) DEFAULT "Everyone"')
    conn.commit()
    print('Column show_me added successfully')
except Exception as e:
    print(f'Error or column already exists: {e}')

conn.close()
