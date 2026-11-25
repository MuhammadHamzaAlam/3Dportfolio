"""Configuration and optional semantic retrieval for AION's public catalog."""
import hashlib
import json
import math
import os
import sqlite3
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SETTINGS = set("""GEMINI_API_KEY GEMINI_CHAT_MODEL GEMINI_CHAT_FALLBACK_MODELS GEMINI_EMBEDDING_MODEL
GEMINI_LIVE_MODEL RESEND_API_KEY CONTACT_FROM CONTACT_TO EMAIL_FROM_ADDRESS CONTACT_RECIPIENT_EMAIL AION_PORT""".split())

def load_settings():
    for path in (ROOT.parent / ".env", ROOT / ".env"):
        if path.is_file():
            for line in path.read_text(encoding="utf-8-sig").splitlines():
                name, sep, value = line.strip().partition("=")
                if sep and name.strip() in SETTINGS:
                    os.environ.setdefault(name.strip(), value.strip().strip("\"'"))
    for dest, alias in (("CONTACT_FROM","EMAIL_FROM_ADDRESS"),("CONTACT_TO","CONTACT_RECIPIENT_EMAIL")):
        if not os.getenv(dest) and os.getenv(alias):
            os.environ[dest] = os.environ[alias]

def models():
    names = [os.getenv("GEMINI_CHAT_MODEL") or "gemini-3.1-flash-lite"]
    names.extend(os.getenv("GEMINI_CHAT_FALLBACK_MODELS","gemini-3.6-flash").split(","))
    return list(dict.fromkeys(name.strip() for name in names if name.strip()))

class SemanticIndex:
    def __init__(self, client, rows):
        self.client = client
        self.model = os.getenv("GEMINI_EMBEDDING_MODEL","gemini-embedding-2")
        self.documents = [r["section"] + "\n" + r["text"] for r in rows]
        self.vectors = []
        self.state = "disabled"
        self.retry_at = 0
        self.lock = threading.Lock()
        if client and self.model:
            self.prepare()

    def embed(self, text):
        result = self.client.models.embed_content(model=self.model, contents=text)
        values = result.embeddings[0].values
        norm = math.sqrt(sum(x*x for x in values))
        if not math.isfinite(norm) or not norm:
            raise ValueError("Invalid embedding")
        return [x/norm for x in values]

    def prepare(self):
        with self.lock:
            if self.state in ("building","ready") or time.monotonic() < self.retry_at:
                return
            self.state = "building"
        threading.Thread(target=self.build, daemon=True).start()

    def build(self):
        try:
            vectors = []
            with sqlite3.connect(ROOT / "embeddings.sqlite") as db:
                db.execute("create table if not exists embeddings(key text primary key, value text)")
                for doc in self.documents:
                    key = hashlib.sha256((self.model+"\0"+doc).encode()).hexdigest()
                    row = db.execute("select value from embeddings where key=?", (key,)).fetchone()
                    if row:
                        vec = json.loads(row[0])
                    else:
                        vec = self.embed(doc)
                        db.execute("insert or replace into embeddings values (?,?)",(key,json.dumps(vec)))
                        db.commit()
                    vectors.append(vec)
            self.vectors = vectors
            self.state = "ready"
        except Exception:
            self.retry_at = time.monotonic()+120
            self.state = "unavailable"

    def scores(self, question):
        if self.state != "ready":
            if self.state == "unavailable":
                self.prepare()
            return {}
        try:
            q = self.embed(question)
            return {i: sum(x*y for x,y in zip(q,v)) for i,v in enumerate(self.vectors) if len(v)==len(q)}
        except Exception:
            self.retry_at = time.monotonic()+120
            self.state = "unavailable"
            return {}
