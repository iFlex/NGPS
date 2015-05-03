import SimpleHTTPServer
import SocketServer
import os
import json
import signal

def getContainers(param):
    pass
def getContents(param):
    pass
def getApps(param):
    return os.listdir("../scripts/plugins/");
def load(param):
    return "";

def save(param,data):
    f = open('saved.html','w')
    f.write(data)
    f.close()
    return "Success!"

getCommands = {};
postCommands = {};

getCommands['list_apps'] = getApps;
getCommands['load'] = load;
postCommands['save'] = save;

postHost = 0
def hsignal(a,b):
    global postHost;
    print("ll:"+str(postHost.latestlen)+" nl:"+str(len(postHost.indata)));
    if( ( postHost.latestlen == len(postHost.indata) ) or ( postHost.latestlen == 0 and len(postHost.indata) > 1 ) ):
        #handle post data
        sections = postHost.path.split('/');
        cmd = sections[len(sections)-1];
        parts = cmd.split('?');
        cmd = parts[0];
        print("POST CMD:"+cmd);
        params = [];
        if( len(parts) > 1 ):
            params = parts[1].split("&");
            for i in range(0,len(params)):
                params[i] = params[i].split("=");

        print("Received:"+postHost.indata);
        response = json.dumps(postCommands[cmd](params,postHost.indata));
        #
        postHost.send_response(200);
        postHost.send_header("Content-type", "text/html")
        postHost.end_headers();
        postHost.wfile.write(response);
        #find a way to send the data without breaking the file descriptor...
        postHost.rfile.close();

    else:
        signal.setitimer(signal.ITIMER_REAL, 1)

class zeHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    latestlen = 0
    indata = ""
    def do_GET(self):
        global getCommands;
        response = "";
        print("Processing GET "+self.path);
        try:
            sections = self.path.split('/');
            cmd = sections[len(sections)-1];
            parts = cmd.split('?');
            cmd = parts[0];
            print("GET CMD:"+cmd);
            params = [];
            if( len(parts) > 1 ):
                params = parts[1].split("&");
                for i in range(0,len(params)):
                    params[i] = params[i].split("=");

            response = json.dumps(getCommands[cmd](params));
            print("Produced response:"+response);
        except Exception as e:
            print("Error while dealing with request:"+self.path+" Error:"+str(e));
            response = str(e);

        self.send_response(200);
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(response);

    def do_POST(self):
        global postHost;

        print("POST:"+self.path);
        self.lastlen = 0;
        self.indata = "";
        postHost = self

        signal.setitimer(signal.ITIMER_REAL, 1)
        while True:
            buf = self.rfile.read(1);
            print(buf);
            if not buf:
                break
            else:
                self.lastlen = len(self.indata);
                self.indata += buf

PORT = 8081
Handler = zeHandler;
httpd = SocketServer.TCPServer(("127.0.0.1", PORT), Handler)
print "serving at port", PORT
signal.signal(signal.SIGALRM, hsignal)
httpd.serve_forever()
