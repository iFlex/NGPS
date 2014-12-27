import SimpleHTTPServer
import SocketServer
import cgi
from BaseHTTPServer import BaseHTTPRequestHandler

PORT = 8000

class HTTPRequestHandler(BaseHTTPRequestHandler):
 
	def do_POST(self):
		print("Request:"+str(self.path))
		ctype, pdict = cgi.parse_header(self.headers.getheader('content-type'))
		print "type:"+str(ctype)
		print pdict
		self.send_response(200)
		self.send_header('Content-Type', 'application/json')
		self.end_headers()

	def do_GET(self):
		print("Request:"+str(self.path))
		'''if None != re.search('/api/v1/getrecord/*', self.path):
			recordID = self.path.split('/')[-1]
			if LocalData.records.has_key(recordID):
				self.send_response(200)
				self.send_header('Content-Type', 'application/json')
				self.end_headers()
				self.wfile.write(LocalData.records[recordID])
			else:
				self.send_response(400, 'Bad Request: record does not exist')
				self.send_header('Content-Type', 'application/json')
				self.end_headers()
		else:
			self.send_response(403)
			self.send_header('Content-Type', 'application/json')
			self.end_headers()'''
		self.send_response(200)
		self.send_header('Content-Type', 'application/json')
		self.end_headers()
		
		return

#Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

httpd = SocketServer.TCPServer(("", PORT), HTTPRequestHandler)
print "serving at port", PORT
httpd.serve_forever()