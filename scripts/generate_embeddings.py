#!/usr/bin/env python3

import os
import sys
from sentence_transformers import SentenceTransformer
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Use DATABASE_URL if available (for Supabase), otherwise fall back to individual vars
DATABASE_URL = os.getenv("DATABASE_URL")


def main():
    model = SentenceTransformer("BAAI/bge-small-en-v1.5")

    try:
        if DATABASE_URL:
            conn = psycopg2.connect(DATABASE_URL)
        else:
            DB_HOST = os.getenv("DB_HOST", "localhost")
            DB_PORT = os.getenv("DB_PORT", "5432")
            DB_NAME = os.getenv("DB_NAME", "realestate_db")
            DB_USER = os.getenv("DB_USER", "realestate_user")
            DB_PASSWORD = os.getenv("DB_PASSWORD", "realestate_password")

            conn = psycopg2.connect(
                host=DB_HOST,
                port=DB_PORT,
                database=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD,
            )
        cursor = conn.cursor()
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

    cursor.execute("""
        SELECT id, name, city, locality, bhk, summary, amenities, embedding
        FROM properties
    """)
    properties = cursor.fetchall()

    total = len(properties)
    properties_with_embeddings = sum(1 for p in properties if p[7] is not None)
    properties_without_embeddings = total - properties_with_embeddings

    if properties_without_embeddings == 0:
        cursor.close()
        conn.close()
        return

    updated = 0

    for idx, (
        id,
        name,
        city,
        locality,
        bhk,
        summary,
        amenities,
        existing_embedding,
    ) in enumerate(properties):
        if existing_embedding is not None:
            continue

        amenities_str = ", ".join(amenities) if amenities else ""
        text = f"{name} {city or ''} {locality or ''} {bhk or ''} {summary or ''} {amenities_str}"
        text = text.strip()

        embedding = model.encode(text)

        cursor.execute(
            "UPDATE properties SET embedding = %s, updated_at = NOW() WHERE id = %s",
            (embedding.tolist(), id),
        )

        updated += 1

        if updated % 10 == 0:
            conn.commit()

    conn.commit()

    cursor.close()
    conn.close()


if __name__ == "__main__":
    main()
