#!/usr/bin/env python3
"""Serve the synthetic demo on localhost. No external dependencies."""
import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from functools import partial

class DemoHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?')[0] not in ('/', '/index.html'):
            self.send_error(404)
            return
        self.path = '/index.html'
        super().do_GET()
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=5173)
    args = parser.parse_args()
    handler = partial(DemoHandler, directory=str(Path(__file__).resolve().parent))
    server = ThreadingHTTPServer(('127.0.0.1', args.port), handler)
    print(f'Synthetic demo: http://localhost:{args.port}  |  Ctrl+C to stop')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
