import webbrowser
from service import Handler, ThreadingHTTPServer, PORT

if __name__ == '__main__':
    try:
        server = ThreadingHTTPServer(('127.0.0.1', PORT), Handler)
    except OSError as exc:
        raise SystemExit(f'Could not start HRZ on port {PORT}: {exc}')
    with server:
        url = f'http://127.0.0.1:{PORT}/'
        print(f'HRZ is running at {url}. Keep this window open. Press Ctrl+C to stop.', flush=True)
        webbrowser.open(url)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
