import json, threading, unittest, urllib.request, urllib.error, http.cookiejar
from unittest.mock import patch
import service
class ServerTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=service.ThreadingHTTPServer(("127.0.0.1",0),service.Handler)
        service.PORT=cls.server.server_port;cls.base=f"http://127.0.0.1:{service.PORT}"
        threading.Thread(target=cls.server.serve_forever,daemon=True).start()
        cls.web=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
        with cls.web.open(cls.base) as page:assert b'voiceEnter' in page.read()
    @classmethod
    def tearDownClass(cls):cls.server.shutdown();cls.server.server_close()
    def post(self,path,data,origin=None):
        r=urllib.request.Request(self.base+"/api/"+path,data=json.dumps(data).encode(),headers={"Content-Type":"application/json","Origin":origin or self.base})
        with self.web.open(r) as res:return json.load(res)
    def test_lookup(self):
        for q,expected in [('CGPA','3.5'),('Qwen3','Ollama'),('Skyline','Skyline'),('TGC1K6KWLTRV','TGC1K6KWLTRV'),('F1 precision','0.857')]:
            self.assertIn(expected,str(service.catalog.search(q,'central-plaza')))
    def test_navigation(self):
        self.assertEqual(self.post('command',{'question':'Take me to TerraTrace'})['action']['destination'],'terratrace')
        self.assertIsNone(self.post('command',{'question':'Take me to the beach'})['action'])
    def test_grounded_fallback(self):
        with patch.object(service,'client',None):
            res=self.post('chat',dict(question='CGPA',department='career-pavilion'))
            self.assertEqual(res['mode'],'catalog');self.assertTrue(res['sources'])
    def test_origin(self):
        with self.assertRaises(urllib.error.HTTPError) as err:self.post('command',{},'https://other.invalid')
        self.assertEqual(err.exception.code,403)
    def test_keyless_live(self):
        with patch.object(service,'client',None), self.assertRaises(urllib.error.HTTPError) as err:self.post('live-token',dict(department='central-plaza'))
        self.assertEqual(err.exception.code,503)
    def test_contact(self):
        with patch.object(service,'mail_ready',return_value=False):
            self.assertEqual(service.contact(dict(replyTo='reader@example.org',message='Hello',requestId='a'*36))[0],503)
if __name__=='__main__':unittest.main()

