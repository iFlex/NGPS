var r = new container({cssText:"width: 1440px; height: 810px; position: absolute; overflow: hidden; left: 0px; top: 0px; border-width: 1px; border-style: solid; background: white;"});
r.load();
var d = new container({cssText:"width: 1440px; height: 810px; position: absolute; left: -250.87755158190302px; top: -44.45435024977416px; border-width: 0px; border-style: solid; background: transparent;"})
d.load(r);
var c = new container({cssText:"width: 100px; height: 100px; position: absolute; overflow: hidden; left: 670px; top: 355px; border-width: 5px; border-style: dashed; background: rgb(170, 132, 172);"})
c.load(d)
var l = new container({cssText:"width: 100px; height: 100px; position: absolute; overflow: hidden; left: 0px; top: 0px; border-width: 5px; border-style: dashed; background: rgb(161, 2, 168);"})
l.load(c)

