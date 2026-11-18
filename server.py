#!/usr/bin/env python3
"""Local-only static server. No dependencies, no credentials, no source writes."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import webbrowser
import argparse
if __name__ == '__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--port',type=int,default=5173);ap.add_argument('--no-browser',action='store_true');a=ap.parse_args()
    root=Path(__file__).resolve().parent
    class Handler(SimpleHTTPRequestHandler):
        def do_GET(self):
            from urllib.parse import urlparse,unquote
            p=unquote(urlparse(self.path).path)
            if p=='/':
                self.send_response(302);self.send_header('Location','/web/' if (root/'web').is_dir() else '/index.html');self.end_headers();return
            if not (p.startswith('/web/') or p in ('/index.html','/data/snapshot.json')):
                self.send_error(404);return
            super().do_GET()
        def end_headers(self):
            self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');super().end_headers()
    server=ThreadingHTTPServer(('127.0.0.1',a.port),partial(Handler,directory=str(root)))
    url=f'http://localhost:{a.port}/'+('web/' if (root/'web').is_dir() else 'index.html')
    print('prod_db:',url,'\nLocal only. Ctrl+C stops the server. Live data: click Connect Google.')
    if not a.no_browser:webbrowser.open(url)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
