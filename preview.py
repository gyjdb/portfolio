"""Start the portfolio locally and open it in your default browser."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Timer
import webbrowser

if __name__ == "__main__":
    root = Path(__file__).resolve().parent
    handler = partial(SimpleHTTPRequestHandler, directory=str(root))
    with ThreadingHTTPServer(("127.0.0.1", 0), handler) as server:
        url = f"http://127.0.0.1:{server.server_port}/"
        print(f"Portfolio preview: {url}\nKeep this window open. Press Ctrl+C to stop.")
        opener = Timer(0.5, webbrowser.open, args=(url,))
        opener.daemon = True
        opener.start()
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nPreview stopped.")
