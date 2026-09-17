from werkzeug.security import generate_password_hash
import sqlite3

user_id = 2
new_password = "Giang123456"

connection = sqlite3.connect("instance/oceanflow.db")

cursor = connection.execute(
    "UPDATE users SET password_hash = ? WHERE id = ?",
    (generate_password_hash(new_password), user_id)
)

connection.commit()

if cursor.rowcount == 0:
    print("Không tìm thấy tài khoản có ID này")
else:
    print(f"Đã đổi mật khẩu cho user ID {user_id}")

connection.close()