# AION guide

## Run the city with its backend

Keep the AION directory next to Innovation City.html. From the AION directory, run:

```powershell
python service.py
```

Open http://127.0.0.1:8765 in Chrome or Edge. The server binds to loopback. Opening the HTML directly supports the 3D city, captions and available device narration. Chat, contact and Live token issuance use the same-origin backend.

## Configure providers

Set environment variables in the process that starts Python. The .env.example file lists their names. Copy it to AION/.env or create .env at the project root. Use uncommented NAME=value lines. Existing process variables take precedence. Do not put keys in the HTML.

For hosted Gemini, install the official SDK with `python -m pip install google-genai`. Set GEMINI_API_KEY and optionally override GEMINI_CHAT_MODEL. Set GEMINI_LIVE_MODEL for live audio to models enabled for the key in Google AI Studio. Restart the service. Ordinary chat sends a question, recent session history and ranked evidence to Gemini. Live voice issues a single-use, model-constrained short-lived token. The browser then streams microphone PCM to Google's Live API and plays returned audio. Starting Live requires an explicit microphone action. Sessions disconnect after less than five minutes or when leaving the scene. Live uses a bounded public reference catalog in its session instructions. Typed chat uses per-query retrieval.

The browser microphone option uses the browser's SpeechRecognition implementation where available. Some browsers process audio through their own recognition service. Automatic introductions use bundled speech segments. Ad hoc narration uses speechSynthesis, preferentially selecting an installed English voice. Quiet entry uses captions. Device voices, recognition quality and availability vary by browser. No visitor recordings are stored by this application.

For contact mail set RESEND_API_KEY, CONTACT_FROM (a sender authorized in your Resend account), and CONTACT_TO (the owner's receiving address). The visitor can provide a reply address and message. The server selects the recipient. The UI reports provider acceptance when Resend returns a receipt. The tests do not send mail.

Gemini Live consumes the quota of the configured Google project. Device synthesis has no Gemini usage charges. Check the provider console for model availability, billing and quota before public deployment.

## Evidence and verification

evidence.json contains approved public excerpts indexed from the newer AI/ML résumé, six original certificates and the department introductions. index_sources.py accepts an explicit résumé PDF, certificate directory and narration brief. It requires pypdf. Running the service rebuilds a small persisted SQLite term-vector index from that catalog. Each result carries source location and document version. With Gemini unavailable the UI identifies matching source excerpts separately from generated answers.

Run `python test_local.py` for the transport-independent HTTP handler and retrieval checks. Run `python test_service.py` for loopback HTTP integration tests where OS policy permits socket connections. Neither needs provider credentials.

The service is a single-process local distribution. Before public hosting, deploy behind HTTPS with trusted-origin configuration, durable abuse controls and a production application server. Session history is in process, expires after an hour and is bounded to eight turns. Browser-facing requests are same-origin, size limited and rate limited. No public deployment has been performed.

## Guide controls

Choose voice or quiet entry. Entering a department automatically starts its authored sequence. Pause and resume operate at a narration-segment boundary. Dragging the camera or walking interrupts presentation. Ask AION opens typed chat, device recognition, Gemini Live, tour and contact controls. The full tour follows the existing walking routes and enters each department. Original exhibits and certificates stay accessible.



## Retrieval and failover

The packaged public index includes resume passages with page numbers, certificate passages, and department descriptions. Refresh the resume with the project virtual environment by running python AION/index_sources.py "path/to/resume.pdf" from the project root and restarting. AION builds a local cache of Gemini document embeddings in the background when a key and embedding model are configured. Keyword search works while the cache builds and during service outages. The API health endpoint reports embedding status, SDK/key setup, and the ordered chat models. Model errors fall back to the next configured model. Authentication errors and exhausted models fall back to cited local excerpts. The chat API includes a reason field for those excerpts.
