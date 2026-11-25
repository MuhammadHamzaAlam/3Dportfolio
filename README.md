# HRZ Innovation City

## Preview

Extract the ZIP before running. Open **Innovation City.html** in Chrome or Edge for the self-contained 3D experience. Choose **Enter with AION voice guide** to hear the locally bundled narration. **Explore quietly** runs the same project reveals with captions. The ZIP includes the supplied robot, six original certificates, editable frontend, local backend, and recordings under **evidence/**.

## Windows PowerShell

Run the first commands in the directory containing the downloaded ZIP:

```powershell
Expand-Archive -LiteralPath '.\HRZ Cinematic City.zip' -DestinationPath '.\HRZ-Cinematic'
Set-Location '.\HRZ-Cinematic'
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
npm install
npm run build
```

The distributed HTML is already built. A Python installation is sufficient to serve it with local catalog retrieval. Install the dependencies above for rebuilding, Gemini access and PDF reindexing. Configure only the provider integrations you intend to use. In the same PowerShell session:

```powershell
$env:GEMINI_API_KEY = Read-Host 'Gemini API key' -MaskInput
$env:GEMINI_CHAT_MODEL = Read-Host 'Gemini chat model enabled for your account'
$env:GEMINI_LIVE_MODEL = Read-Host 'Gemini Live model enabled for your account'
$env:RESEND_API_KEY = Read-Host 'Resend API key' -MaskInput
$env:CONTACT_FROM = Read-Host 'Resend authorized sender'
$env:CONTACT_TO = Read-Host 'Portfolio contact recipient'
.\.venv\Scripts\python.exe AION\preview.py
```

The masked prompts require PowerShell 7.1 or newer. On Windows PowerShell 5.1 set the named variables using your usual environment/secret manager. **Run HRZ.cmd** also starts the standard-library preview with a system Python. The launcher opens the browser. Keep the server terminal open, and use Ctrl+C to stop. Browser URL **http://127.0.0.1:8765/**. This one process serves both the frontend and API. AION_PORT overrides the default port.

## macOS and Linux

```sh
unzip 'HRZ Cinematic City.zip' -d HRZ-Cinematic
cd HRZ-Cinematic
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
npm install
npm run build
python AION/preview.py
```

For provider features, set the variables listed in **AION/.env.example** in the shell environment before starting Python. The example is a reference and is never published by the HTTP server. No credentials ship in this project.

## Controls and architecture

Walk with WASD. Drag to turn, or use arrow keys. E operates the nearby entrance or exhibit. **Districts** offers a guided walk or direct arrival. **Ask AION → Full city tour** begins in the plaza before AION walks to the first project. Pause/resume operates at narration checkpoints. The original survey, document retrieval, waveform, EOQ, batch processing and PDF inspection controls remain available after skipping or finishing each introduction.

- **src/city.js** owns the Three.js scene, input, director, media playback, tours, local exhibits and existing Gemini Live browser connection.
- **src/story.js** holds the ordered narration segments. Each segment starts its corresponding world cue when its audio starts playing. Quiet mode uses caption dwell time.
- **src/installations.js** builds the five plaza previews, satellite instrument, retrieval and signal paths, warehouse displays, ETL readouts and credential-ring signals.
- **src/robot.js** fits the supplied 20-joint asset and solves two-link arms and legs against actual joint positions. Its single authored clip is preserved inside the GLB. Locomotion and presentation are driven procedurally. The rig has zero facial morph targets.
- **src/shell.html**, **build.mjs** and **package.json** build the standalone HTML with Three.js and esbuild. **assets/** contains the unmodified avatar, certificate originals and fixed speech segments.
- **AION/** contains the loopback Python service, evidence catalog and ingestion scripts. **AION/README.md** covers provider configuration and operating limits. Resend sends contact mail, Gemini handles grounded chat and Live conversation, and device/browser speech is available for visitor interaction. The approved department narration is pre-rendered for playback consistency.
- **ASSET-CREDITS.txt** gives the robot's author, source and license.

The geospatial, RAG, voice and forecasting installations use labeled local examples. EOQ, validation, deduplication and the batch summary are calculated in the browser. Cameras and IK are authored for this campus and the supplied robot. Reduced-motion mode shows the same stages with simplified motion.

## Testing

```sh
python AION/test_local.py
python AION/test_service.py
npm run test:browser
```

The local test suite uses an in-memory HTTP transport; the service suite uses loopback TCP. The browser test uses Chrome DevTools over a pipe and writes screenshots and recordings under **evidence/**. On non-default Chrome installations set CHROME_BIN to the browser executable. It uses a separate browser profile under tests/. Rebuild the HTML after editing source. Provider tests involving real Gemini or Resend accounts require your own credentials. No public deployment or live email send is part of this delivery.

