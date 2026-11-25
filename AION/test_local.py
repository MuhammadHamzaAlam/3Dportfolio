"""Exercise the HTTP handler and session cookies with in-memory transport."""
import http.client
import io
import json
import unittest
from unittest.mock import patch
import service

class Wire:
    def __init__(self,request):self.request=request;self.output=bytearray()
    def settimeout(self,_):pass
    def makefile(self,*_):return io.BytesIO(self.request)
    def sendall(self,data):self.output.extend(data)
class LocalTests(unittest.TestCase):
    def request(self,path,data=None,origin=None):
        base="127.0.0.1:"+str(service.PORT)
        payload=json.dumps(data).encode() if data is not None else b''
        head=f"{'POST' if data is not None else 'GET'} {path} HTTP/1.0\r\nHost: {base}\r\nOrigin: {origin or 'http://'+base}\r\nCookie: {getattr(self,'cookie','')}\r\nContent-Type: application/json\r\nContent-Length: {len(payload)}\r\n\r\n"
        wire=Wire(head.encode()+payload);service.Handler(wire,('127.0.0.1',42000),None)
        header,body=bytes(wire.output).split(b'\r\n\r\n',1)
        for line in header.decode().splitlines():
            if line.startswith('Set-Cookie: '):self.cookie=line[12:].split(';')[0]
        return int(header.split(b' ')[1]),body
    def setUp(self):self.request('/')
    def test_retrieval(self):
        for q,expected in [('CGPA','3.5'),('Siamese','0.857'),('Skyline','Skyline'),('TGC1K6KWLTRV','TGC1K6KWLTRV'),('Qwen3','Ollama')]:
            self.assertIn(expected,str(service.catalog.search(q,'central-plaza')))
    def test_catalog_turn(self):
        with patch.object(service,'client',None):
            code,body=self.request('/api/chat',{'question':'CGPA','department':'career-pavilion'})
            self.assertEqual(code,200);self.assertEqual(json.loads(body)['mode'],'catalog')
    def test_session(self):
        self.cookie='';self.assertEqual(self.request('/api/command',{'question':'pause'})[0],401)
    def test_origin(self):self.assertEqual(self.request('/api/command',{},'https://invalid.test')[0],403)
    def test_commands(self):
        for q,wanted in [('Take me to the library','rag-library'),('Take me to NexoRa','nexora')]:
            self.assertEqual(json.loads(self.request('/api/command',{'question':q})[1])['action']['destination'],wanted)
        self.assertIsNone(service.command('Go to a new domain'))
    def test_provider_unavailable(self):
        with patch.object(service,'client',None):
            self.assertEqual(self.request('/api/live-token',{'department':'terratrace'})[0],503)
        with patch.object(service,'mail_ready',return_value=False):
            self.assertEqual(self.request('/api/contact',{'message':'Test','replyTo':'tester@example.org','requestId':'b'*36})[0],503)
    def test_invalid_context(self):self.assertEqual(self.request('/api/chat',{'question':'x','department':'unknown'})[0],400)
if __name__=='__main__':unittest.main()

