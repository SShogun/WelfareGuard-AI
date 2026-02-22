import sqlite3
import random
from faker import Faker

def generate_data():
    fake = Faker('en_IN')

    # Setup SQLite Database
    conn = sqlite3.connect("welfare_db.sqlite")
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aadhaar_id TEXT UNIQUE,
        name TEXT,
        stated_income REAL,
        bank_account TEXT,
        rto_vehicle_reg_number TEXT,
        fraud_probability_score INTEGER DEFAULT 0,
        flag_reason TEXT DEFAULT NULL
    )
    ''')

    conn.commit()

    # Constants
    TOTAL_RECORDS = 5000
    SYNDICATE_COUNT = 50
    LUXURY_VEHICLE_COUNT = 20

    # We need a shared bank account for the syndicate
    shared_bank_account = fake.bban()
    luxury_vehicle_codes = ["MH-01-BMW-0001", "DL-1C-MERC-9999", "KA-01-AUDI-5555", "GJ-01-POR-7777"]

    def generate_aadhaar():
        return f"{random.randint(1000, 9999)}-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"

    applications = []

    # Generate Syndicate Ring (50 users, same bank account)
    for _ in range(SYNDICATE_COUNT):
        aadhaar = generate_aadhaar()
        # Handle duplicates just in case
        while any(a[0] == aadhaar for a in applications):
            aadhaar = generate_aadhaar()
        name = fake.name()
        income = round(random.uniform(20000, 150000), 2)
        bank_acc = shared_bank_account
        rto = fake.license_plate()
        applications.append((aadhaar, name, income, bank_acc, rto))

    # Generate Luxury Vehicle pattern (20 users, low income but luxury vehicle)
    for _ in range(LUXURY_VEHICLE_COUNT):
        aadhaar = generate_aadhaar()
        while any(a[0] == aadhaar for a in applications):
            aadhaar = generate_aadhaar()
        name = fake.name()
        income = round(random.uniform(10000, 49000), 2)  # Under 50,000
        bank_acc = fake.bban()
        rto = random.choice(luxury_vehicle_codes)
        applications.append((aadhaar, name, income, bank_acc, rto))

    # Generate the remaining regular users
    remaining = TOTAL_RECORDS - SYNDICATE_COUNT - LUXURY_VEHICLE_COUNT
    for _ in range(remaining):
        aadhaar = generate_aadhaar()
        while any(a[0] == aadhaar for a in applications):
            aadhaar = generate_aadhaar()
        name = fake.name()
        income = round(random.uniform(20000, 300000), 2)
        bank_acc = fake.bban()
        rto = fake.license_plate() if random.random() > 0.5 else "None"
        applications.append((aadhaar, name, income, bank_acc, rto))

    # Insert all records
    cursor.executemany('''
    INSERT OR IGNORE INTO applications 
    (aadhaar_id, name, stated_income, bank_account, rto_vehicle_reg_number) 
    VALUES (?, ?, ?, ?, ?)
    ''', applications)

    conn.commit()
    conn.close()

    print(f"Generated {len(applications)} applications and saved to welfare_db.sqlite")
    print(f"Injected Syndicate Ring (Shared Bank Account): {shared_bank_account}")
    print(f"Injected Luxury Vehicle Profiles: {LUXURY_VEHICLE_COUNT} profiles.")

if __name__ == "__main__":
    generate_data()
