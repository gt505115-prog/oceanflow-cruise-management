import sqlite3

connection = sqlite3.connect("instance/oceanflow.db")

connection.execute(
    """
    INSERT INTO passengers
    (user_id, first_name, last_name, cabin, status)
    VALUES (?, ?, ?, ?, ?)
    """,
    (2, "Võ Lý", "Trường Giang", None, "booked")
)

connection.commit()

print("Đã tạo Passenger cho gt505115@gmail.com")

rows = connection.execute(
    "SELECT id, user_id, first_name, last_name FROM passengers"
).fetchall()

print(rows)

connection.close()