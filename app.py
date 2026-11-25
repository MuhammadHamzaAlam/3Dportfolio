"""Same-origin HTTP API for the hosted HRZ city."""
import hashlib
import os
import secrets
import sys
import time
from datetime import timedelta
from pathlib import Path
from urllib.parse import urlsplit

from flask import Flask, jsonify, redirect, request, session
from werkzeug.exceptions import HTTPException

sys.path.insert(0, str(Path(__file__).resolve().parent / "AION"))
import service

app = Flask(__name__, static_folder=None)
secret = os.getenv("AION_SESSION_SECRET") or os.getenv("GEMINI_API_KEY") or os.getenv("RESEND_API_KEY") or secrets.token_hex(32)
app.config.update(
    SECRET_KEY=hashlib.sha256(("HRZ session v1:" + secret).encode()).digest(),
    MAX_CONTENT_LENGTH=12000,
    SESSION_COOKIE_NAME="aion_hosted",
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_SAMESITE="Strict",
    PERMANENT_SESSION_LIFETIME=timedelta(hours=1),
)

@app.get("/")
def home():
    return redirect("/index.html")

@app.get("/api/health")
def health():
    return jsonify(records=len(service.catalog.rows), chatSetup=service.setup_status,
                   embeddingStatus=service.semantic.state, resendConfigured=service.mail_ready(),
                   liveConfigured=bool(service.client and os.getenv("GEMINI_LIVE_MODEL")))

@app.after_request
def no_cache(response):
    if request.path.startswith("/api/"):
        response.headers["Cache-Control"]="no-store"
    return response

@app.errorhandler(HTTPException)
def http_error(exc):
    return jsonify(error=exc.description), exc.code

@app.post("/api/<operation>")
def api(operation):
    if operation not in {"chat","contact","command","live-token"}:
        return jsonify(error="Unknown API route."), 404
    origin=urlsplit(request.headers.get("Origin",""))
    if origin.scheme!="https" or origin.netloc!=request.host:
        return jsonify(error="Origin rejected."), 403
    now=time.time()
    with service.lock:
        while service.requests and service.requests[0]<now-60:
            service.requests.popleft()
        if len(service.requests)>=40:
            return jsonify(error="Please wait before retrying."),429
        service.requests.append(now)
    data=request.get_json()
    if not isinstance(data,dict):
        return jsonify(error="Expected a JSON object."),400
    session.permanent=True
    state=dict(history=session.get("history",[]),lastMail=session.get("lastMail",0),lastLive=session.get("lastLive",0))
    try:
        status, result=service.dispatch(request.path,data,state,now)
    except (ValueError,TypeError):
        return jsonify(error="Invalid request."),400
    except Exception:
        return jsonify(error="The requested provider could not complete the request."),503
    finally:
        session["history"]=[[q[:160],a[:220]] for q,a in state["history"][-2:]]
        for key in ("lastMail","lastLive"):
            session[key]=state[key]
    return jsonify(result),status
