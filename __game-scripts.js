var ResumeGameFromMainMenu=pc.createScript("resumeGameFromMainMenu");ResumeGameFromMainMenu.attributes.add("Cockpit_Scene",{type:"string",default:"",title:"Cockpit Scene Name to Load"}),ResumeGameFromMainMenu.prototype.initialize=function(){void 0===localStorage.collector&&(this.entity.enabled=!1),this.entity.element.on("click",function(i){this.app.systems.rigidbody.setGravity(0,-9.8,0),this.app.root.findByName("RootBridge").enabled=!1,this.app.root.findByName("RootFlight").enabled=!1,this.app.root.findByName("RootMainMenu").enabled=!1,this.app.root.findByName("MMSound").sound.stop("Sound"),this.app.root.findByName("CockpitSound").sound.play("Sound"),this.app.root.findByName("RootCockpit").findByName("cockpit").script.caution.initialize(),this.app.root.findByName("RootCockpit").findByName("Rating_Parent").script.rating.initialize(),this.app.root.findByName("RootCockpit").findByName("3").script.setMiniGame.initialize(),this.app.root.findByName("FUEL_TEXT").script.fuelInit.initialize(),this.app.root.findByName("WATER_TEXT").script.waterInit.initialize(),this.app.root.findByName("FOOD_TEXT").script.foodInit.initialize(),this.app.root.findByName("BATTERY_TEXT").script.batteryInit.initialize(),this.app.root.findByName("COLLECTOR_TEXT").script.collectorInit.initialize(),this.app.root.findByName("Cycler").script.cycle.initialize(),this.app.root.findByName("RootCockpit").enabled=!0},this)},ResumeGameFromMainMenu.prototype.update=function(i){},ResumeGameFromMainMenu.prototype.loadScene=function(i){var t=this.app.root.findByName("Root"),e=this.app.scenes.find(i);this.app.scenes.loadSceneHierarchy(e.url,function(i,e){i?console.error(i):t.destroy()})};var Fire=pc.createScript("fires"),glow=!1,rev=!1;Fire.prototype.initialize=function(){this.app.keyboard.on(pc.EVENT_KEYDOWN,this.onKeyDown,this)},Fire.prototype.onKeyDown=function(e){e.key===pc.KEY_E&&(this.entity.children[0].particlesystem.play(),glow=!0)},Fire.prototype.update=function(e){this.entity.model.meshInstances[0].material.emissiveIntensity>9&&(rev=!0),this.entity.model.meshInstances[0].material.emissiveIntensity<.4&&(rev=!1),!0===glow&&(!1===rev&&(this.entity.model.meshInstances[0].material.emissiveIntensity+=.04,this.entity.model.meshInstances[0].material.update()),!0===rev&&(this.entity.model.meshInstances[0].material.emissiveIntensity-=.04,this.entity.model.meshInstances[0].material.update()))};var Lensflare=pc.createScript("lensflare"),lightsOn=!1;Lensflare.prototype.initialize=function(){this.app.keyboard.on(pc.EVENT_KEYDOWN,this.onKeyDown,this),this.app.on("lens:flare",this.onLensFlare,this)},Lensflare.prototype.onLensFlare=function(t){lightsOn=!0},Lensflare.prototype.update=function(t){!0===lightsOn&&(this.entity.light.intensity+=2),this.entity.light.intensity>=31&&(this.entity.children[0].children[0].element.opacity+=.05)};var activeSaver,Screen=pc.createScript("screen"),active=!1;Screen.prototype.initialize=function(){this.app.keyboard.on(pc.EVENT_KEYDOWN,this.onKeyDown,this),activeSaver=this.app.assets.get(35548323).resource},Screen.prototype.onKeyDown=function(e){e.key===pc.KEY_E&&(this.entity.findByName("Text").enabled=!1,active=!0)},Screen.prototype.update=function(e){!0===active&&(this.entity.model.meshInstances[26].material.diffuseMap=activeSaver,this.entity.model.meshInstances[26].material.update())};// Asteroid.js
/*jshint esversion: 6*/

let Asteroid = pc.createScript('asteroid');

Asteroid.attributes.add('me', {
    type: 'entity',
});

// initialize code called once per entity
Asteroid.prototype.initialize = function() {
    this.counter = 0;
};

Asteroid.prototype.getRandom = function(){
    let radius = 200;
    let ran = Math.random() * radius * 2 - radius;
    
    return ran;
};

// update code called every frame
Asteroid.prototype.update = function(dt) {
    // Every so often, check distance with player 
    this.counter += dt;
    if(this.counter > 0){
        this.counter = 0; 
        let playerPos = this.me.getPosition();
        let asteroidPos = this.entity.getPosition();
        let dx = playerPos.x - asteroidPos.x; 
        let dy = playerPos.y - asteroidPos.y;
        let dz = playerPos.z - asteroidPos.z; 
        let dist = Math.cbrt(dx * dx + dy * dy + dz * dz);
        
        if(dist > 40 && this.entity.wraparound){ //wraparound is set when it spawns in AsteroidSpawner
            let newPos = new pc.Vec3(this.getRandom(), this.getRandom(), this.getRandom());
            newPos.add(playerPos);
            this.entity.rigidbody.teleport(newPos);
        }
        
        if(dist > 600 && this.entity.wraparound !== true) {
            this.entity.destroy();
        }
    }
};

// swap method called for script hot-reloading
// inherit your script state here
// Asteroid.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// BulletCollision.js
/*jshint esversion: 6*/

let BulletCollision = pc.createScript('bulletCollision');

// initialize code called once per entity
BulletCollision.prototype.initialize = function() {
    this.entity.collision.on('collisionend', this.onCollisionEnd, this);
    this.counter = 0;
    this.distance_to_delete = 100;
};

BulletCollision.prototype.update = function(dt){
    this.counter += dt; 
    if(this.counter > 1){
        this.counter = 0;
        // Check every second, if it's too far away from the ship, destroy it 
        let playerPos = this.app.root.findByName("Ship").getPosition();
        let bulletPos = this.entity.getPosition();
        let dx = playerPos.x - bulletPos.x; 
        let dy = playerPos.y - bulletPos.y;
        let dz = playerPos.z - bulletPos.z; 
        let dist = Math.cbrt(dx * dx + dy * dy + dz * dz);
        if(dist > this.distance_to_delete){
            this.entity.destroy();
        }
    }
};

// update code called every frame
BulletCollision.prototype.onCollisionEnd = function(result) {
    // Destroy the bullet if it hits an asteroid 
    if(result.name == "Asteroid") {
        result.particlesystem.play();
        result.model.enabled = false;
        result.rigidbody.enabled = false;
        this.entity.children[0].destroy();
    }
};

// swap method called for script hot-reloading
// inherit your script state here
// BulletCollision.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// fpsmeter.min.js
/*! FPSMeter 0.3.1 - 9th May 2013 | https://github.com/Darsain/fpsmeter */
(function(m,j){function s(a,e){for(var g in e)try{a.style[g]=e[g]}catch(j){}return a}function H(a){return null==a?String(a):"object"===typeof a||"function"===typeof a?Object.prototype.toString.call(a).match(/\s([a-z]+)/i)[1].toLowerCase()||"object":typeof a}function R(a,e){if("array"!==H(e))return-1;if(e.indexOf)return e.indexOf(a);for(var g=0,j=e.length;g<j;g++)if(e[g]===a)return g;return-1}function I(){var a=arguments,e;for(e in a[1])if(a[1].hasOwnProperty(e))switch(H(a[1][e])){case "object":a[0][e]=
I({},a[0][e],a[1][e]);break;case "array":a[0][e]=a[1][e].slice(0);break;default:a[0][e]=a[1][e]}return 2<a.length?I.apply(null,[a[0]].concat(Array.prototype.slice.call(a,2))):a[0]}function N(a){a=Math.round(255*a).toString(16);return 1===a.length?"0"+a:a}function S(a,e,g,j){if(a.addEventListener)a[j?"removeEventListener":"addEventListener"](e,g,!1);else if(a.attachEvent)a[j?"detachEvent":"attachEvent"]("on"+e,g)}function D(a,e){function g(a,b,d,c){return y[0|a][Math.round(Math.min((b-d)/(c-d)*J,J))]}
function r(){f.legend.fps!==q&&(f.legend.fps=q,f.legend[T]=q?"FPS":"ms");K=q?b.fps:b.duration;f.count[T]=999<K?"999+":K.toFixed(99<K?0:d.decimals)}function m(){z=A();L<z-d.threshold&&(b.fps-=b.fps/Math.max(1,60*d.smoothing/d.interval),b.duration=1E3/b.fps);for(c=d.history;c--;)E[c]=0===c?b.fps:E[c-1],F[c]=0===c?b.duration:F[c-1];r();if(d.heat){if(w.length)for(c=w.length;c--;)w[c].el.style[h[w[c].name].heatOn]=q?g(h[w[c].name].heatmap,b.fps,0,d.maxFps):g(h[w[c].name].heatmap,b.duration,d.threshold,
0);if(f.graph&&h.column.heatOn)for(c=u.length;c--;)u[c].style[h.column.heatOn]=q?g(h.column.heatmap,E[c],0,d.maxFps):g(h.column.heatmap,F[c],d.threshold,0)}if(f.graph)for(p=0;p<d.history;p++)u[p].style.height=(q?E[p]?Math.round(O/d.maxFps*Math.min(E[p],d.maxFps)):0:F[p]?Math.round(O/d.threshold*Math.min(F[p],d.threshold)):0)+"px"}function k(){20>d.interval?(x=M(k),m()):(x=setTimeout(k,d.interval),P=M(m))}function G(a){a=a||window.event;a.preventDefault?(a.preventDefault(),a.stopPropagation()):(a.returnValue=
!1,a.cancelBubble=!0);b.toggle()}function U(){d.toggleOn&&S(f.container,d.toggleOn,G,1);a.removeChild(f.container)}function V(){f.container&&U();h=D.theme[d.theme];y=h.compiledHeatmaps||[];if(!y.length&&h.heatmaps.length){for(p=0;p<h.heatmaps.length;p++){y[p]=[];for(c=0;c<=J;c++){var b=y[p],e=c,g;g=0.33/J*c;var j=h.heatmaps[p].saturation,m=h.heatmaps[p].lightness,n=void 0,k=void 0,l=void 0,t=l=void 0,v=n=k=void 0,v=void 0,l=0.5>=m?m*(1+j):m+j-m*j;0===l?g="#000":(t=2*m-l,k=(l-t)/l,g*=6,n=Math.floor(g),
v=g-n,v*=l*k,0===n||6===n?(n=l,k=t+v,l=t):1===n?(n=l-v,k=l,l=t):2===n?(n=t,k=l,l=t+v):3===n?(n=t,k=l-v):4===n?(n=t+v,k=t):(n=l,k=t,l-=v),g="#"+N(n)+N(k)+N(l));b[e]=g}}h.compiledHeatmaps=y}f.container=s(document.createElement("div"),h.container);f.count=f.container.appendChild(s(document.createElement("div"),h.count));f.legend=f.container.appendChild(s(document.createElement("div"),h.legend));f.graph=d.graph?f.container.appendChild(s(document.createElement("div"),h.graph)):0;w.length=0;for(var q in f)f[q]&&
h[q].heatOn&&w.push({name:q,el:f[q]});u.length=0;if(f.graph){f.graph.style.width=d.history*h.column.width+(d.history-1)*h.column.spacing+"px";for(c=0;c<d.history;c++)u[c]=f.graph.appendChild(s(document.createElement("div"),h.column)),u[c].style.position="absolute",u[c].style.bottom=0,u[c].style.right=c*h.column.width+c*h.column.spacing+"px",u[c].style.width=h.column.width+"px",u[c].style.height="0px"}s(f.container,d);r();a.appendChild(f.container);f.graph&&(O=f.graph.clientHeight);d.toggleOn&&("click"===
d.toggleOn&&(f.container.style.cursor="pointer"),S(f.container,d.toggleOn,G))}"object"===H(a)&&a.nodeType===j&&(e=a,a=document.body);a||(a=document.body);var b=this,d=I({},D.defaults,e||{}),f={},u=[],h,y,J=100,w=[],W=0,B=d.threshold,Q=0,L=A()-B,z,E=[],F=[],x,P,q="fps"===d.show,O,K,c,p;b.options=d;b.fps=0;b.duration=0;b.isPaused=0;b.tickStart=function(){Q=A()};b.tick=function(){z=A();W=z-L;B+=(W-B)/d.smoothing;b.fps=1E3/B;b.duration=Q<L?B:z-Q;L=z};b.pause=function(){x&&(b.isPaused=1,clearTimeout(x),
C(x),C(P),x=P=0);return b};b.resume=function(){x||(b.isPaused=0,k());return b};b.set=function(a,c){d[a]=c;q="fps"===d.show;-1!==R(a,X)&&V();-1!==R(a,Y)&&s(f.container,d);return b};b.showDuration=function(){b.set("show","ms");return b};b.showFps=function(){b.set("show","fps");return b};b.toggle=function(){b.set("show",q?"ms":"fps");return b};b.hide=function(){b.pause();f.container.style.display="none";return b};b.show=function(){b.resume();f.container.style.display="block";return b};b.destroy=function(){b.pause();
U();b.tick=b.tickStart=function(){}};V();k()}var A,r=m.performance;A=r&&(r.now||r.webkitNow)?r[r.now?"now":"webkitNow"].bind(r):function(){return+new Date};for(var C=m.cancelAnimationFrame||m.cancelRequestAnimationFrame,M=m.requestAnimationFrame,r=["moz","webkit","o"],G=0,k=0,Z=r.length;k<Z&&!C;++k)M=(C=m[r[k]+"CancelAnimationFrame"]||m[r[k]+"CancelRequestAnimationFrame"])&&m[r[k]+"RequestAnimationFrame"];C||(M=function(a){var e=A(),g=Math.max(0,16-(e-G));G=e+g;return m.setTimeout(function(){a(e+
g)},g)},C=function(a){clearTimeout(a)});var T="string"===H(document.createElement("div").textContent)?"textContent":"innerText";D.extend=I;window.FPSMeter=D;D.defaults={interval:100,smoothing:10,show:"fps",toggleOn:"click",decimals:1,maxFps:60,threshold:100,position:"absolute",zIndex:10,left:"5px",top:"5px",right:"auto",bottom:"auto",margin:"0 0 0 0",theme:"dark",heat:0,graph:0,history:20};var X=["toggleOn","theme","heat","graph","history"],Y="position zIndex left top right bottom margin".split(" ")})(window);(function(m,j){j.theme={};var s=j.theme.base={heatmaps:[],container:{heatOn:null,heatmap:null,padding:"5px",minWidth:"95px",height:"30px",lineHeight:"30px",textAlign:"right",textShadow:"none"},count:{heatOn:null,heatmap:null,position:"absolute",top:0,right:0,padding:"5px 10px",height:"30px",fontSize:"24px",fontFamily:"Consolas, Andale Mono, monospace",zIndex:2},legend:{heatOn:null,heatmap:null,position:"absolute",top:0,left:0,padding:"5px 10px",height:"30px",fontSize:"12px",lineHeight:"32px",fontFamily:"sans-serif",
textAlign:"left",zIndex:2},graph:{heatOn:null,heatmap:null,position:"relative",boxSizing:"padding-box",MozBoxSizing:"padding-box",height:"100%",zIndex:1},column:{width:4,spacing:1,heatOn:null,heatmap:null}};j.theme.dark=j.extend({},s,{heatmaps:[{saturation:0.8,lightness:0.8}],container:{background:"#222",color:"#fff",border:"1px solid #1a1a1a",textShadow:"1px 1px 0 #222"},count:{heatOn:"color"},column:{background:"#3f3f3f"}});j.theme.light=j.extend({},s,{heatmaps:[{saturation:0.5,lightness:0.5}],
container:{color:"#666",background:"#fff",textShadow:"1px 1px 0 rgba(255,255,255,.5), -1px -1px 0 rgba(255,255,255,.5)",boxShadow:"0 0 0 1px rgba(0,0,0,.1)"},count:{heatOn:"color"},column:{background:"#eaeaea"}});j.theme.colorful=j.extend({},s,{heatmaps:[{saturation:0.5,lightness:0.6}],container:{heatOn:"backgroundColor",background:"#888",color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,.2)",boxShadow:"0 0 0 1px rgba(0,0,0,.1)"},column:{background:"#777",backgroundColor:"rgba(0,0,0,.2)"}});j.theme.transparent=
j.extend({},s,{heatmaps:[{saturation:0.8,lightness:0.5}],container:{padding:0,color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,.5)"},count:{padding:"0 5px",height:"40px",lineHeight:"40px"},legend:{padding:"0 5px",height:"40px",lineHeight:"42px"},graph:{height:"40px"},column:{width:5,background:"#999",heatOn:"backgroundColor",opacity:0.5}})})(window,FPSMeter);

var Meter=pc.createScript("meter");Meter.prototype.initialize=function(){this.meter=new FPSMeter(document.body,{graph:1,heat:1})},Meter.prototype.update=function(e){this.meter.tick()};var Shoot=pc.createScript("shoot");Shoot.attributes.add("power",{type:"number",default:1}),Shoot.attributes.add("bullet",{type:"entity"}),Shoot.prototype.initialize=function(){},Shoot.prototype.update=function(t){if(this.app.keyboard.wasPressed(pc.KEY_SHIFT)){var o=this.app.root.findByName("AMMO");"0"!==o.element.text&&(this.shoot(),o.element.text=(parseInt(o.element.text)-1).toString())}},Shoot.prototype.shoot=function(t){var o=this.bullet.clone();this.app.root.addChild(o);var e=this.entity;this.force=new pc.Vec3,this.force.copy(e.forward),this.force.scale(this.power);var i=e.getPosition(),a=e.forward;i.add(a.scale(5+.01*e.rigidbody.linearVelocity.length())),o.setPosition(i);var r=e.getRotation();o.setRotation(r),o.rotateLocal(90,0,0),o.enabled=!0,o.rigidbody.applyImpulse(this.force)},Shoot.prototype.swap=function(t){};var Fly=pc.createScript("fly");Fly.attributes.add("speed",{type:"number",default:500}),Fly.attributes.add("camera",{type:"entity"}),Fly.prototype.initialize=function(){this.roll=0,void 0===localStorage.timer&&(localStorage.timer=0),this.timer=0,setInterval(function(){localStorage.setItem("timer",Number(localStorage.timer)+1)},6e4)},Fly.prototype.localCameraUpdate=function(){var t=this.camera;t.camera.fov=45+.1*this.entity.rigidbody.linearVelocity.length();this.app.keyboard.isPressed(pc.KEY_D)?this.roll+=.65:this.app.keyboard.isPressed(pc.KEY_A)&&(this.roll-=.65),this.roll*=.95,t.setRotation(this.entity.getRotation()),t.rotateLocal(-10,0,this.roll);var e=new pc.Vec3(0,3,10),i=new pc.Vec3(0,4,12),a=this.entity.rigidbody.linearVelocity.length()/170;e.lerp(e,i,a),t.setLocalPosition(e)},Fly.prototype.update=function(t){if(this.app.keyboard.isPressed(pc.KEY_SPACE)){var e=this.entity.forward.clone().scale(this.speed);this.entity.rigidbody.applyForce(e)}if(this.localCameraUpdate(),this.app.keyboard.wasPressed(pc.KEY_P)&&(1==this.app.timeScale?(this.app.timeScale=0,this.app.root.findByName("AI_PARENT").enabled=!1,this.app.root.findByName("Pause").enabled=!0):(this.app.timeScale=1,this.app.root.findByName("AI_PARENT").enabled=!0,this.app.root.findByName("Pause").enabled=!1)),this.app.keyboard.isPressed(pc.KEY_W)){var i=this.entity.right.clone().scale(30);this.entity.rigidbody.applyTorque(i)}if(this.app.keyboard.isPressed(pc.KEY_S)){var a=this.entity.right.clone().scale(-30);this.entity.rigidbody.applyTorque(a)}if(this.app.keyboard.isPressed(pc.KEY_D)){var r=this.entity.up.clone().scale(-35);this.entity.rigidbody.applyTorque(r)}if(this.app.keyboard.isPressed(pc.KEY_A)){var s=this.entity.up.clone().scale(35);this.entity.rigidbody.applyTorque(s)}},Fly.prototype.swap=function(t){};var radius,particlesH,Interaction=pc.createScript("interaction"),refineH=!1,refreshH=!1,localUranium=Number(localStorage.uranium),localHyperspace=Number(localStorage.hyperspeed);Interaction.prototype.initialize=function(){particlesH=this.entity.children[1],this.app.on("off:2S",this.onOffHP,this)},Interaction.prototype.refresh=function(){this.entity.children[0].children[0].element.text=localUranium+"/10 uranium \n T to create unit\n"+localHyperspace+" units of hyperspeed \n Y to use Hyperdrive"},Interaction.prototype.refine=function(){particlesH.particlesystem.play(),localUranium-=10,refineH=!0,setTimeout(function(){localStorage.setItem("uranium",localUranium),localHyperspace++,localStorage.setItem("hyperspeed",localHyperspace),particlesH.particlesystem.stop(),refineH=!1},2e3)},Interaction.prototype.update=function(e){this.app.root.findByName("Player").getPosition().distance(this.entity.getPosition())<2.5?(this.entity.children[0].enabled=!0,radius=this.entity.children[0].enabled):(this.entity.children[0].enabled=!1,this.entity.children[0].children[0].element.text="Press I\nto interact",this.entity.children[0].children[0].element.fontSize=32,this.entity.children[1].particlesystem.stop()),!0===radius&&this.app.keyboard.wasPressed(pc.KEY_J)&&(localUranium+=80),!0===radius&&!0===refreshH&&this.refresh(),!0===radius&&this.app.keyboard.wasPressed(pc.KEY_I)&&(this.entity.children[0].children[0].element.fontSize=30,this.refresh(),refreshH=!0),this.app.keyboard.wasPressed(pc.KEY_T)&&localUranium>=40&&!0===radius&&!1===refineH&&this.refine(),this.app.keyboard.wasPressed(pc.KEY_Y)&&localStorage.hyperspeed>0&&!0===radius&&(this.app.mouse.off("mousemove",this._onMouseMove,this),this.app.mouse.off("mousedown"),this.app.root.findByName("BridgeSound").sound.stop("Sound1"),this.app.root.findByName("BridgeSound").sound.stop("Sound2"),this.app.root.findByName("HyperdriveSound").sound.play("Sound"),this.app.root.findByName("RootBridge").enabled=!1,this.app.root.findByName("RootHyperdrive").enabled=!0)},Interaction.prototype.onOffHP=function(){};var menu,localCarbon,localFood,particles,FoodReplicator=pc.createScript("foodReplicator"),refresh=!1,refining=!1;FoodReplicator.prototype.initialize=function(){localCarbon=Number(localStorage.carbon),localFood=Number(localStorage.food),particles=this.entity.children[1],this.app.on("off:2S",this.onOffFood,this)},FoodReplicator.prototype.refine=function(){particles.particlesystem.play(),localCarbon-=5,refining=!0,setTimeout(function(){localFood+=1,localStorage.setItem("carbon",localCarbon),localStorage.setItem("food",localFood),localStorage.setItem("storage_food",localFood),particles.particlesystem.stop(),refining=!1},1e4)},FoodReplicator.prototype.refresh=function(){this.entity.children[0].children[0].element.text=localCarbon+"/5 carbon \n T to create unit \n"+localStorage.food+" units of food available"},FoodReplicator.prototype.update=function(e){var o=this.app.root.findByName("Player").getPosition();this.app.keyboard.wasPressed(pc.KEY_J)&&(localCarbon+=10),o.distance(this.entity.getPosition())<2.5?(this.entity.children[0].enabled=!0,menu=this.entity.children[0].enabled):(this.entity.children[0].enabled=!1,this.entity.children[0].children[0].element.text="Press I\nto interact",this.entity.children[0].children[0].element.fontSize=30,menu=!1,refresh=!1),!0===menu&&!0===refresh&&this.refresh(),!0===menu&&this.app.keyboard.wasPressed(pc.KEY_I)&&(this.entity.children[0].children[0].element.fontSize=25,this.refresh(),refresh=!0),this.app.keyboard.wasPressed(pc.KEY_T)&&!0===menu&&localCarbon>4&&!1===refining&&this.refine()},FoodReplicator.prototype.onOffFood=function(){};var menuE,particlesE,Electricity=pc.createScript("electricity"),refreshE=!1,refineE=!1,localLithium=Number(localStorage.lithium),localBattery=Number(localStorage.battery);Electricity.prototype.initialize=function(){particlesE=this.entity.children[1],this.app.on("off:2S",this.onOffElec,this)},Electricity.prototype.refine=function(){particlesE.particlesystem.play(),localLithium-=5,refineE=!0,setTimeout(function(){localBattery+=1,localStorage.setItem("lithium",localLithium),localStorage.setItem("battery",localBattery),localStorage.setItem("storage_battery",localBattery),particlesE.particlesystem.stop(),refineE=!1},2e4)},Electricity.prototype.refresh=function(){this.entity.children[0].children[0].element.text=localLithium+"/5 lithium \n T to create battery \n"+localBattery+" units of battery"},Electricity.prototype.update=function(t){this.app.root.findByName("Player").getPosition().distance(this.entity.getPosition())<2?(this.entity.children[0].enabled=!0,menuE=this.entity.children[0].enabled):(this.entity.children[0].enabled=!1,this.entity.children[0].children[0].element.text="Press I\nto interact",menuE=!1,refreshE=!1),!0===menuE&&this.app.keyboard.wasPressed(pc.KEY_J)&&(localLithium+=10),!0===menuE&&!0===refreshE&&this.refresh(),!0===menuE&&this.app.keyboard.wasPressed(pc.KEY_I)&&(this.refresh(),refreshE=!0),!0===menuE&&this.app.keyboard.wasPressed(pc.KEY_T)&&localLithium>=5&&!1===refineE&&this.refine()},Electricity.prototype.onOffElec=function(){};var menuF,particlesF,Fuel=pc.createScript("fuel"),refreshF=!1,refineF=!1,localFuel=Number(localStorage.fuel);Fuel.prototype.initialize=function(){particlesF=this.entity.children[1],this.app.on("off:2S",this.onOffFuel,this)},Fuel.prototype.refresh=function(){this.entity.children[0].children[0].element.text=localOxygen+"/3 Oxygen \n T to create fuel \n"+localFuel+" units of fuel"},Fuel.prototype.refine=function(){particlesF.particlesystem.play(),localOxygen-=3,refineF=!0,setTimeout(function(){localFuel+=1,localStorage.setItem("fuel",localFuel),localStorage.setItem("storage_fuel",localFuel),localStorage.setItem("oxygen",localOxygen),particlesF.particlesystem.stop(),refineF=!1},2e4)},Fuel.prototype.update=function(e){this.app.root.findByName("Player").getPosition().distance(this.entity.getPosition())<2.3?(this.entity.children[0].enabled=!0,menuF=this.entity.children[0].enabled):(this.entity.children[0].enabled=!1,this.entity.children[0].children[0].element.text="Press I\nto interact",refreshF=!1,refineF=!1),!0===menuF&&!0===refreshF&&this.refresh(),!0===menuF&&this.app.keyboard.wasPressed(pc.KEY_I)&&(this.refresh(),refreshF=!0),this.app.keyboard.wasPressed(pc.KEY_T)&&localOxygen>=3&&!0===menuF&&!1===refineF&&this.refine()},Fuel.prototype.onOffFuel=function(){};var menuw,particlesw,Water=pc.createScript("water"),refreshw=!1,refiningw=!1,localWater=Number(localStorage.water),localHydrogen=Number(localStorage.hydrogen),localOxygen=Number(localStorage.oxygen);Water.prototype.initialize=function(){particlesw=this.entity.children[1],this.app.on("off:2S",this.onOffFood,this)},Water.prototype.refine=function(){particlesw.particlesystem.play(),localHydrogen-=2,localOxygen-=1,refiningw=!0,setTimeout(function(){localWater+=1,localStorage.setItem("hydrogen",localHydrogen),localStorage.setItem("oxygen",localOxygen),localStorage.setItem("water",localWater),localStorage.setItem("storage_water",localWater),particlesw.particlesystem.stop(),refiningw=!1},1e4)},Water.prototype.refresh=function(){this.entity.children[0].children[0].element.text=localHydrogen+"/2 Hydrogen \n "+localOxygen+"/1 Oxygen \n T to create water \n"+localWater+" units of water"},Water.prototype.update=function(e){var t=this.app.root.findByName("Player").getPosition();this.app.keyboard.wasPressed(pc.KEY_J)&&!0===menuw&&(localHydrogen+=10,localOxygen+=10),t.distance(this.entity.getPosition())<2.3?(this.entity.children[0].enabled=!0,menuw=this.entity.children[0].enabled):(this.entity.children[0].enabled=!1,this.entity.children[0].children[0].element.text="Press I\nto interact",this.entity.children[0].children[0].element.fontSize=50,refreshw=!1,menuw=!1),!0===menuw&&!0===refreshw&&this.refresh(),!0===menuw&&this.app.keyboard.wasPressed(pc.KEY_I)&&(this.entity.children[0].children[0].element.fontSize=50,this.refresh(),refreshw=!0),localHydrogen>=2&&localOxygen>0&&this.app.keyboard.wasPressed(pc.KEY_T)&&!0===menuw&&!1===refiningw&&this.refine()},Water.prototype.onOffFood=function(){};var NebulaStabilizer=pc.createScript("nebulaStabilizer");NebulaStabilizer.prototype.initialize=function(){},NebulaStabilizer.prototype.update=function(i){this.app.root.findByName("Nebula").rigidbody.linearVelocity=pc.Vec3.ZERO,this.app.root.findByName("Nebula").rigidbody.angularVelocity=pc.Vec3.ZERO};var AsteroidSpawner=pc.createScript("asteroidSpawner");AsteroidSpawner.attributes.add("asteroid_model",{type:"entity"}),AsteroidSpawner.attributes.add("ice",{type:"entity"}),AsteroidSpawner.attributes.add("nebula",{type:"entity"}),AsteroidSpawner.attributes.add("comet",{type:"entity"}),AsteroidSpawner.attributes.add("particle",{type:"entity"}),AsteroidSpawner.prototype.initialize=function(){this.counter=20,this.generateField(200,100)},AsteroidSpawner.prototype.generateField=function(e,t){for(var a=0;a<t;a++){var o=new pc.Vec3(Math.random()*e*2-e,Math.random()*e*2-e,Math.random()*e*2-e),r=this.spawn(o.x,o.y,o.z,new pc.Vec3,0);r.wraparound=!0,r.radius=e}},AsteroidSpawner.prototype.update=function(e){this.counter-=e/3;var t=this.app.root.findByName("Ship");if(this.counter<0){this.counter=5*Math.random()+2;var a=new pc.Vec3;a.copy(t.getPosition());a.add(new pc.Vec3(2*Math.random(),2*Math.random(),2*Math.random())),a.add(t.forward.scale(500));var o=(new pc.Vec3).sub2(t.getPosition(),a),r=1.5*Math.random()+1;this.spawn(a.x,a.y,a.z,o,r)}},AsteroidSpawner.prototype.spawn=function(e,t,a,o,r){var i,n=Math.floor(4*Math.random()+1);if(1===n)(i=this.asteroid_model.clone()).name="Asteroid";else if(2===n){1===Math.floor(3*Math.random()+1)?(i=this.ice.clone()).name="Ice":(i=this.asteroid_model.clone()).name="Asteroid"}else if(3===n){1===Math.floor(5*Math.random()+1)?(i=this.nebula.clone()).name="Nebula":(i=this.asteroid_model.clone()).name="Asteroid"}else if(4===n){1===Math.floor(8*Math.random()+1)?(i=this.comet.clone()).name="Comet":(i=this.asteroid_model.clone()).name="Asteroid"}this.app.root.addChild(i),i.setPosition(e,t,a),i.rigidbody.applyTorque(Math.random()*r,Math.random()*r,Math.random()*r);this.app.root.findByName("Ship");var d=new pc.Vec3;return d.copy(o),d.scale(r),i.rigidbody.applyImpulse(d),i.enabled=!0,i},AsteroidSpawner.prototype.swap=function(e){this.initialize()};// objectCollection.js
/*jshint esversion: 6*/

let ObjectCollection = pc.createScript('objectCollection');

// initialize code called once per entity
ObjectCollection.prototype.initialize = function() {
    this.gravityCollection = false;
    this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this);
};

// update code called every frame
ObjectCollection.prototype.update = function(dt) {
    
};

ObjectCollection.prototype.onKeyDown = function (event) {
    // Check event.key to detect which key has been pressed
    if (event.key === pc.KEY_0) {
        this.collect();
    }

    event.event.preventDefault();
};

ObjectCollection.prototype.collect = function() {
    let myPosition = this.entity.getPosition();
    let allEntities = this.app.root.children;
    let collectable = [];
    
    for (let i=0; i<allEntities.length; i++) {
        if (allEntities[i].name === "Asteroid" || allEntities[i].name === "Nebula") {
            let thisPos = allEntities[i].getPosition();
            if (this.compare(thisPos, myPosition) === true) {
                collectable.push(allEntities[i]);
            }
        } 
    }
    
    this.moveToward(collectable);
    console.log(collectable);
    
};

ObjectCollection.prototype.compare = function(position1, position2) {
    if ( (position1.x <= position2.x+1 && position1.x >= position2.x-1) || (position1.y <= position2.y+1 && position1.y >= position2.y-1) || (position1.z <= position2.z+1 && position1.z >= position2.z-1)) {
        return true;
    }
    else {
        return false;
    }
};

ObjectCollection.prototype.moveToward = function(entityArr) {
    let enLength = entityArr.length;
    for (let i=0; i<enLength; i++) {
        entityArr[i].rigidbody.enabled = false;
        entityArr[i].collision.enabled = false;
        
        entityArr[i].lookAt(this.entity.getPosition());
        
        entityArr[i].rigidbody.enabled = true;
        entityArr[i].collision.enabled = true;
        let relativePos = new pc.Vec3();
        
        
        let fdForce = entityArr[i].forward.clone();
      
        fdForce.scale(300);
        relativePos.sub2(entityArr[i].getPosition(), this.entity.getPosition());
        entityArr[i].rigidbody.applyForce(fdForce);
    }
};

// swap method called for script hot-reloading
// inherit your script state here
// ObjectCollection.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

var farCam,CameraSwap=pc.createScript("cameraSwap");CameraSwap.attributes.add("Cockpit_Scene",{type:"string",default:"",title:"Cockpit Scene Name to Load"}),CameraSwap.prototype.initialize=function(){farCam=this.app.root.findByName("far")},CameraSwap.prototype.update=function(i){this.app.keyboard.wasPressed(pc.KEY_E)&&(setTimeout(function(){farCam.enabled=!0,this.enabled=!1}.bind(this),300),setTimeout(function(){this.app.fire("lens:flare")}.bind(this),1e4),setTimeout(function(){this.app.systems.rigidbody.setGravity(0,-9.8,0),this.app.root.findByName("RootBridge").enabled=!1,this.app.root.findByName("RootFlight").enabled=!1,this.app.root.findByName("RootTimeMachine").enabled=!1,this.app.root.findByName("TMSound").sound.stop("Sound"),this.app.root.findByName("CockpitSound").sound.play("Sound"),this.app.root.findByName("RootCockpit").findByName("cockpit").script.caution.initialize(),this.app.root.findByName("RootCockpit").findByName("Rating_Parent").script.rating.initialize(),this.app.root.findByName("RootCockpit").findByName("3").script.setMiniGame.initialize(),this.app.root.findByName("FUEL_TEXT").script.fuelInit.initialize(),this.app.root.findByName("WATER_TEXT").script.waterInit.initialize(),this.app.root.findByName("FOOD_TEXT").script.foodInit.initialize(),this.app.root.findByName("BATTERY_TEXT").script.batteryInit.initialize(),this.app.root.findByName("COLLECTOR_TEXT").script.collectorInit.initialize(),this.app.root.findByName("Cycler").script.cycle.initialize(),this.app.root.findByName("RootCockpit").enabled=!0}.bind(this),16e3))},CameraSwap.prototype.loadScene=function(i){var t=this.app.root.findByName("Root"),a=this.app.scenes.find(i);this.app.scenes.loadSceneHierarchy(a.url,function(i,a){i?console.error(i):t.destroy()})};var Hyperdrive=pc.createScript("hyperdrive");Hyperdrive.prototype.initialize=function(){this.x=0,this.y=0,this.z=0,setTimeout(function(){this.app.root.findByName("EndCredits").enabled=!0}.bind(this),35e3),setTimeout(function(){this.app.root.findByName("HyperdriveSound").sound.stop("Sound"),this.app.root.findByName("MMSound").sound.play("Sound"),this.app.root.findByName("EndCredits").enabled=!1,localStorage.clear(),this.app.root.findByName("ResumeBTN").script.resumeGameFromMainMenu.initialize(),this.app.root.findByName("RootHyperdrive").enabled=!1,this.app.root.findByName("RootMainMenu").enabled=!0}.bind(this),6e4)},Hyperdrive.prototype.update=function(t){var i=.2*Math.sin(Date.now()/1e3)+.01*(2*Math.random()-1);this.x+=.05*(i-this.x);var e=.05*Math.sin(Date.now()/100)+.2*(2*Math.random()-1);this.y+=.01*(e-this.y);var n=.05*Math.sin(Date.now()/100)+.2*(2*Math.random()-1);this.z+=.01*(n-this.z);var o=15*Math.sin(Date.now()/1e3);this.entity.setLocalPosition(this.x,this.y,this.z),this.entity.setLocalEulerAngles(0,0,o)},Hyperdrive.prototype.swap=function(t){this.x=t.x,this.y=t.y,this.z=t.z};var Camera=pc.createScript("camera");Camera.attributes.add("maxElevation",{type:"number",default:70}),Camera.prototype.initialize=function(){var t=this.app;this.viewPos=new pc.Vec3,this.targetViewPos=new pc.Vec3,this.tempVec=new pc.Vec3,this.distance=4,this.targetDistance=4,this.quatX=new pc.Quat,this.quatY=new pc.Quat,this.transformStarted=!1,t.mouse.disableContextMenu();var e=this.entity.getEulerAngles();this.rotX=e.x,this.rotY=e.y,this.targetRotX=this.rotX,this.targetRotY=this.rotY,this.setBestCameraPositionForModel();var i,s,a;this.hammer=Hammer(t.graphicsDevice.canvas,{prevent_default:!0,drag_max_touches:2,transform_min_scale:.08,transform_min_rotation:180,transform_always_block:!0,hold:!1,release:!1,swipe:!1,tap:!1}),this.hammer.on("transformstart",function(t){this.transformStarted=!0,i=this.targetDistance,t.preventDefault(),this.hammer.options.drag=!1}.bind(this)),this.hammer.on("transformend",function(t){this.transformStarted=!1,this.hammer.options.drag=!0}.bind(this)),this.hammer.on("transform",function(t){if(this.transformStarted){var e=t.gesture.scale;this.targetDistance=i/e}}.bind(this)),this.hammer.on("dragstart",function(t){if(!this.transformStarted){var e=t.gesture,i=void 0!==e.touches?e.touches.length:1;this.panning=2===i,this.dragStarted=!0,s=e.center.pageX,a=e.center.pageY}}.bind(this)),this.hammer.on("dragend",function(t){this.dragStarted&&(this.dragStarted=!1,this.panning=!1)}.bind(this)),this.hammer.on("drag",function(t){var e=t.gesture,i=e.center.pageX-s,r=e.center.pageY-a;this.panning?this.pan(-.025*i,.025*r):this.orbit(.5*i,.5*r),s=e.center.pageX,a=e.center.pageY}.bind(this)),t.mouse.on(pc.EVENT_MOUSEMOVE,this.onMouseMove,this),t.mouse.on(pc.EVENT_MOUSEWHEEL,this.onMouseWheel,this)},Camera.prototype.setBestCameraPositionForModel=function(){this.app;this.reset(new pc.Vec3(0,0,0),10)},Camera.prototype.reset=function(t,e){this.viewPos.copy(t),this.targetViewPos.copy(t),this.distance=100,this.targetDistance=4;this.entity.getEulerAngles();this.rotX=35,this.rotY=20,this.targetRotX=35,this.targetRotY=20},Camera.prototype.pan=function(t,e){this.tempVec.copy(this.entity.right).scale(t),this.targetViewPos.add(this.tempVec),this.tempVec.copy(this.entity.up).scale(e),this.targetViewPos.add(this.tempVec)},Camera.prototype.dolly=function(t){this.targetDistance+=t,this.targetDistance<0&&(this.targetDistance=0)},Camera.prototype.orbit=function(t,e){this.targetRotX+=t,this.targetRotY+=e,this.targetRotY=pc.math.clamp(this.targetRotY,-this.maxElevation,this.maxElevation)},Camera.prototype.onMouseWheel=function(t){t.event.preventDefault(),this.dolly(-.25*t.wheel)},Camera.prototype.onMouseMove=function(t){if(t.buttons[pc.MOUSEBUTTON_LEFT])this.orbit(.2*t.dx,.2*t.dy);else if(t.buttons[pc.MOUSEBUTTON_RIGHT]){var e=this.distance/700;this.pan(t.dx*-e,t.dy*e)}},Camera.prototype.update=function(t){this.app.keyboard.wasPressed(pc.KEY_SPACE)&&this.setBestCameraPositionForModel(),this.viewPos.lerp(this.viewPos,this.targetViewPos,t/.1),this.distance=pc.math.lerp(this.distance,this.targetDistance,t/.2),this.rotX=pc.math.lerp(this.rotX,this.targetRotX,t/.2),this.rotY=pc.math.lerp(this.rotY,this.targetRotY,t/.2),this.quatX.setFromAxisAngle(pc.Vec3.RIGHT,-this.rotY),this.quatY.setFromAxisAngle(pc.Vec3.UP,-this.rotX),this.quatY.mul(this.quatX),this.entity.setPosition(this.viewPos),this.entity.setRotation(this.quatY),this.entity.translateLocal(0,0,this.distance)},Camera.prototype.swap=function(t){};var NormalMapFix=pc.createScript("normalMapFix");NormalMapFix.prototype.initialize=function(){var e=this,t=function(){if(e.entity.model.model)for(var i=e.entity.model.meshInstances,a=0;a<i.length;a++){var n=i[a].material;n.chunks.normalXYZPS=["vec3 unpackNormal(vec4 nmap) {","    vec3 normal;","    normal.xy = nmap.xy * 2.0 - 1.0;","    normal.z = sqrt(1.0 - saturate(dot(normal.xy, normal.xy)));","    return normalize(normal);","} "].join("\n"),n.chunks.ambientPrefilteredCubePS=["#ifndef PMREM4","#define PMREM4","uniform samplerCube texture_prefilteredCubeMap4;","#endif","void addAmbient() {","    vec3 fixedReflDir = fixSeamsStatic(dNormalW, 1.0 - 1.0 / 4.0);","    fixedReflDir.x *= -1.0;","    dDiffuseLight += processEnvironment($DECODE(textureCube(texture_prefilteredCubeMap4, fixedReflDir)).rgb) * 2.0;","}"].join("\n"),n.update()}else setTimeout(t,0)};this.entity.model.model?t():this.entity.model.asset&&app.assets.get(this.entity.model.asset).once("load",function(){t()},this)},NormalMapFix.prototype.update=function(e){},NormalMapFix.prototype.swap=function(e){};// hammer.min.js
/*! Hammer.JS - v1.1.3 - 2014-05-20
 * http://eightmedia.github.io/hammer.js
 *
 * Copyright (c) 2014 Jorik Tangelder <j.tangelder@gmail.com>;
 * Licensed under the MIT license */


!function(a,b){"use strict";function c(){d.READY||(s.determineEventTypes(),r.each(d.gestures,function(a){u.register(a)}),s.onTouch(d.DOCUMENT,n,u.detect),s.onTouch(d.DOCUMENT,o,u.detect),d.READY=!0)}var d=function v(a,b){return new v.Instance(a,b||{})};d.VERSION="1.1.3",d.defaults={behavior:{userSelect:"none",touchAction:"pan-y",touchCallout:"none",contentZooming:"none",userDrag:"none",tapHighlightColor:"rgba(0,0,0,0)"}},d.DOCUMENT=document,d.HAS_POINTEREVENTS=navigator.pointerEnabled||navigator.msPointerEnabled,d.HAS_TOUCHEVENTS="ontouchstart"in a,d.IS_MOBILE=/mobile|tablet|ip(ad|hone|od)|android|silk/i.test(navigator.userAgent),d.NO_MOUSEEVENTS=d.HAS_TOUCHEVENTS&&d.IS_MOBILE||d.HAS_POINTEREVENTS,d.CALCULATE_INTERVAL=25;var e={},f=d.DIRECTION_DOWN="down",g=d.DIRECTION_LEFT="left",h=d.DIRECTION_UP="up",i=d.DIRECTION_RIGHT="right",j=d.POINTER_MOUSE="mouse",k=d.POINTER_TOUCH="touch",l=d.POINTER_PEN="pen",m=d.EVENT_START="start",n=d.EVENT_MOVE="move",o=d.EVENT_END="end",p=d.EVENT_RELEASE="release",q=d.EVENT_TOUCH="touch";d.READY=!1,d.plugins=d.plugins||{},d.gestures=d.gestures||{};var r=d.utils={extend:function(a,c,d){for(var e in c)!c.hasOwnProperty(e)||a[e]!==b&&d||(a[e]=c[e]);return a},on:function(a,b,c){a.addEventListener(b,c,!1)},off:function(a,b,c){a.removeEventListener(b,c,!1)},each:function(a,c,d){var e,f;if("forEach"in a)a.forEach(c,d);else if(a.length!==b){for(e=0,f=a.length;f>e;e++)if(c.call(d,a[e],e,a)===!1)return}else for(e in a)if(a.hasOwnProperty(e)&&c.call(d,a[e],e,a)===!1)return},inStr:function(a,b){return a.indexOf(b)>-1},inArray:function(a,b){if(a.indexOf){var c=a.indexOf(b);return-1===c?!1:c}for(var d=0,e=a.length;e>d;d++)if(a[d]===b)return d;return!1},toArray:function(a){return Array.prototype.slice.call(a,0)},hasParent:function(a,b){for(;a;){if(a==b)return!0;a=a.parentNode}return!1},getCenter:function(a){var b=[],c=[],d=[],e=[],f=Math.min,g=Math.max;return 1===a.length?{pageX:a[0].pageX,pageY:a[0].pageY,clientX:a[0].clientX,clientY:a[0].clientY}:(r.each(a,function(a){b.push(a.pageX),c.push(a.pageY),d.push(a.clientX),e.push(a.clientY)}),{pageX:(f.apply(Math,b)+g.apply(Math,b))/2,pageY:(f.apply(Math,c)+g.apply(Math,c))/2,clientX:(f.apply(Math,d)+g.apply(Math,d))/2,clientY:(f.apply(Math,e)+g.apply(Math,e))/2})},getVelocity:function(a,b,c){return{x:Math.abs(b/a)||0,y:Math.abs(c/a)||0}},getAngle:function(a,b){var c=b.clientX-a.clientX,d=b.clientY-a.clientY;return 180*Math.atan2(d,c)/Math.PI},getDirection:function(a,b){var c=Math.abs(a.clientX-b.clientX),d=Math.abs(a.clientY-b.clientY);return c>=d?a.clientX-b.clientX>0?g:i:a.clientY-b.clientY>0?h:f},getDistance:function(a,b){var c=b.clientX-a.clientX,d=b.clientY-a.clientY;return Math.sqrt(c*c+d*d)},getScale:function(a,b){return a.length>=2&&b.length>=2?this.getDistance(b[0],b[1])/this.getDistance(a[0],a[1]):1},getRotation:function(a,b){return a.length>=2&&b.length>=2?this.getAngle(b[1],b[0])-this.getAngle(a[1],a[0]):0},isVertical:function(a){return a==h||a==f},setPrefixedCss:function(a,b,c,d){var e=["","Webkit","Moz","O","ms"];b=r.toCamelCase(b);for(var f=0;f<e.length;f++){var g=b;if(e[f]&&(g=e[f]+g.slice(0,1).toUpperCase()+g.slice(1)),g in a.style){a.style[g]=(null==d||d)&&c||"";break}}},toggleBehavior:function(a,b,c){if(b&&a&&a.style){r.each(b,function(b,d){r.setPrefixedCss(a,d,b,c)});var d=c&&function(){return!1};"none"==b.userSelect&&(a.onselectstart=d),"none"==b.userDrag&&(a.ondragstart=d)}},toCamelCase:function(a){return a.replace(/[_-]([a-z])/g,function(a){return a[1].toUpperCase()})}},s=d.event={preventMouseEvents:!1,started:!1,shouldDetect:!1,on:function(a,b,c,d){var e=b.split(" ");r.each(e,function(b){r.on(a,b,c),d&&d(b)})},off:function(a,b,c,d){var e=b.split(" ");r.each(e,function(b){r.off(a,b,c),d&&d(b)})},onTouch:function(a,b,c){var f=this,g=function(e){var g,h=e.type.toLowerCase(),i=d.HAS_POINTEREVENTS,j=r.inStr(h,"mouse");j&&f.preventMouseEvents||(j&&b==m&&0===e.button?(f.preventMouseEvents=!1,f.shouldDetect=!0):i&&b==m?f.shouldDetect=1===e.buttons||t.matchType(k,e):j||b!=m||(f.preventMouseEvents=!0,f.shouldDetect=!0),i&&b!=o&&t.updatePointer(b,e),f.shouldDetect&&(g=f.doDetect.call(f,e,b,a,c)),g==o&&(f.preventMouseEvents=!1,f.shouldDetect=!1,t.reset()),i&&b==o&&t.updatePointer(b,e))};return this.on(a,e[b],g),g},doDetect:function(a,b,c,d){var e=this.getTouchList(a,b),f=e.length,g=b,h=e.trigger,i=f;b==m?h=q:b==o&&(h=p,i=e.length-(a.changedTouches?a.changedTouches.length:1)),i>0&&this.started&&(g=n),this.started=!0;var j=this.collectEventData(c,g,e,a);return b!=o&&d.call(u,j),h&&(j.changedLength=i,j.eventType=h,d.call(u,j),j.eventType=g,delete j.changedLength),g==o&&(d.call(u,j),this.started=!1),g},determineEventTypes:function(){var b;return b=d.HAS_POINTEREVENTS?a.PointerEvent?["pointerdown","pointermove","pointerup pointercancel lostpointercapture"]:["MSPointerDown","MSPointerMove","MSPointerUp MSPointerCancel MSLostPointerCapture"]:d.NO_MOUSEEVENTS?["touchstart","touchmove","touchend touchcancel"]:["touchstart mousedown","touchmove mousemove","touchend touchcancel mouseup"],e[m]=b[0],e[n]=b[1],e[o]=b[2],e},getTouchList:function(a,b){if(d.HAS_POINTEREVENTS)return t.getTouchList();if(a.touches){if(b==n)return a.touches;var c=[],e=[].concat(r.toArray(a.touches),r.toArray(a.changedTouches)),f=[];return r.each(e,function(a){r.inArray(c,a.identifier)===!1&&f.push(a),c.push(a.identifier)}),f}return a.identifier=1,[a]},collectEventData:function(a,b,c,d){var e=k;return r.inStr(d.type,"mouse")||t.matchType(j,d)?e=j:t.matchType(l,d)&&(e=l),{center:r.getCenter(c),timeStamp:Date.now(),target:d.target,touches:c,eventType:b,pointerType:e,srcEvent:d,preventDefault:function(){var a=this.srcEvent;a.preventManipulation&&a.preventManipulation(),a.preventDefault&&a.preventDefault()},stopPropagation:function(){this.srcEvent.stopPropagation()},stopDetect:function(){return u.stopDetect()}}}},t=d.PointerEvent={pointers:{},getTouchList:function(){var a=[];return r.each(this.pointers,function(b){a.push(b)}),a},updatePointer:function(a,b){a==o||a!=o&&1!==b.buttons?delete this.pointers[b.pointerId]:(b.identifier=b.pointerId,this.pointers[b.pointerId]=b)},matchType:function(a,b){if(!b.pointerType)return!1;var c=b.pointerType,d={};return d[j]=c===(b.MSPOINTER_TYPE_MOUSE||j),d[k]=c===(b.MSPOINTER_TYPE_TOUCH||k),d[l]=c===(b.MSPOINTER_TYPE_PEN||l),d[a]},reset:function(){this.pointers={}}},u=d.detection={gestures:[],current:null,previous:null,stopped:!1,startDetect:function(a,b){this.current||(this.stopped=!1,this.current={inst:a,startEvent:r.extend({},b),lastEvent:!1,lastCalcEvent:!1,futureCalcEvent:!1,lastCalcData:{},name:""},this.detect(b))},detect:function(a){if(this.current&&!this.stopped){a=this.extendEventData(a);var b=this.current.inst,c=b.options;return r.each(this.gestures,function(d){!this.stopped&&b.enabled&&c[d.name]&&d.handler.call(d,a,b)},this),this.current&&(this.current.lastEvent=a),a.eventType==o&&this.stopDetect(),a}},stopDetect:function(){this.previous=r.extend({},this.current),this.current=null,this.stopped=!0},getCalculatedData:function(a,b,c,e,f){var g=this.current,h=!1,i=g.lastCalcEvent,j=g.lastCalcData;i&&a.timeStamp-i.timeStamp>d.CALCULATE_INTERVAL&&(b=i.center,c=a.timeStamp-i.timeStamp,e=a.center.clientX-i.center.clientX,f=a.center.clientY-i.center.clientY,h=!0),(a.eventType==q||a.eventType==p)&&(g.futureCalcEvent=a),(!g.lastCalcEvent||h)&&(j.velocity=r.getVelocity(c,e,f),j.angle=r.getAngle(b,a.center),j.direction=r.getDirection(b,a.center),g.lastCalcEvent=g.futureCalcEvent||a,g.futureCalcEvent=a),a.velocityX=j.velocity.x,a.velocityY=j.velocity.y,a.interimAngle=j.angle,a.interimDirection=j.direction},extendEventData:function(a){var b=this.current,c=b.startEvent,d=b.lastEvent||c;(a.eventType==q||a.eventType==p)&&(c.touches=[],r.each(a.touches,function(a){c.touches.push({clientX:a.clientX,clientY:a.clientY})}));var e=a.timeStamp-c.timeStamp,f=a.center.clientX-c.center.clientX,g=a.center.clientY-c.center.clientY;return this.getCalculatedData(a,d.center,e,f,g),r.extend(a,{startEvent:c,deltaTime:e,deltaX:f,deltaY:g,distance:r.getDistance(c.center,a.center),angle:r.getAngle(c.center,a.center),direction:r.getDirection(c.center,a.center),scale:r.getScale(c.touches,a.touches),rotation:r.getRotation(c.touches,a.touches)}),a},register:function(a){var c=a.defaults||{};return c[a.name]===b&&(c[a.name]=!0),r.extend(d.defaults,c,!0),a.index=a.index||1e3,this.gestures.push(a),this.gestures.sort(function(a,b){return a.index<b.index?-1:a.index>b.index?1:0}),this.gestures}};d.Instance=function(a,b){var e=this;c(),this.element=a,this.enabled=!0,r.each(b,function(a,c){delete b[c],b[r.toCamelCase(c)]=a}),this.options=r.extend(r.extend({},d.defaults),b||{}),this.options.behavior&&r.toggleBehavior(this.element,this.options.behavior,!0),this.eventStartHandler=s.onTouch(a,m,function(a){e.enabled&&a.eventType==m?u.startDetect(e,a):a.eventType==q&&u.detect(a)}),this.eventHandlers=[]},d.Instance.prototype={on:function(a,b){var c=this;return s.on(c.element,a,b,function(a){c.eventHandlers.push({gesture:a,handler:b})}),c},off:function(a,b){var c=this;return s.off(c.element,a,b,function(a){var d=r.inArray({gesture:a,handler:b});d!==!1&&c.eventHandlers.splice(d,1)}),c},trigger:function(a,b){b||(b={});var c=d.DOCUMENT.createEvent("Event");c.initEvent(a,!0,!0),c.gesture=b;var e=this.element;return r.hasParent(b.target,e)&&(e=b.target),e.dispatchEvent(c),this},enable:function(a){return this.enabled=a,this},dispose:function(){var a,b;for(r.toggleBehavior(this.element,this.options.behavior,!1),a=-1;b=this.eventHandlers[++a];)r.off(this.element,b.gesture,b.handler);return this.eventHandlers=[],s.off(this.element,e[m],this.eventStartHandler),null}},function(a){function b(b,d){var e=u.current;if(!(d.options.dragMaxTouches>0&&b.touches.length>d.options.dragMaxTouches))switch(b.eventType){case m:c=!1;break;case n:if(b.distance<d.options.dragMinDistance&&e.name!=a)return;var j=e.startEvent.center;if(e.name!=a&&(e.name=a,d.options.dragDistanceCorrection&&b.distance>0)){var k=Math.abs(d.options.dragMinDistance/b.distance);j.pageX+=b.deltaX*k,j.pageY+=b.deltaY*k,j.clientX+=b.deltaX*k,j.clientY+=b.deltaY*k,b=u.extendEventData(b)}(e.lastEvent.dragLockToAxis||d.options.dragLockToAxis&&d.options.dragLockMinDistance<=b.distance)&&(b.dragLockToAxis=!0);var l=e.lastEvent.direction;b.dragLockToAxis&&l!==b.direction&&(b.direction=r.isVertical(l)?b.deltaY<0?h:f:b.deltaX<0?g:i),c||(d.trigger(a+"start",b),c=!0),d.trigger(a,b),d.trigger(a+b.direction,b);var q=r.isVertical(b.direction);(d.options.dragBlockVertical&&q||d.options.dragBlockHorizontal&&!q)&&b.preventDefault();break;case p:c&&b.changedLength<=d.options.dragMaxTouches&&(d.trigger(a+"end",b),c=!1);break;case o:c=!1}}var c=!1;d.gestures.Drag={name:a,index:50,handler:b,defaults:{dragMinDistance:10,dragDistanceCorrection:!0,dragMaxTouches:1,dragBlockHorizontal:!1,dragBlockVertical:!1,dragLockToAxis:!1,dragLockMinDistance:25}}}("drag"),d.gestures.Gesture={name:"gesture",index:1337,handler:function(a,b){b.trigger(this.name,a)}},function(a){function b(b,d){var e=d.options,f=u.current;switch(b.eventType){case m:clearTimeout(c),f.name=a,c=setTimeout(function(){f&&f.name==a&&d.trigger(a,b)},e.holdTimeout);break;case n:b.distance>e.holdThreshold&&clearTimeout(c);break;case p:clearTimeout(c)}}var c;d.gestures.Hold={name:a,index:10,defaults:{holdTimeout:500,holdThreshold:2},handler:b}}("hold"),d.gestures.Release={name:"release",index:1/0,handler:function(a,b){a.eventType==p&&b.trigger(this.name,a)}},d.gestures.Swipe={name:"swipe",index:40,defaults:{swipeMinTouches:1,swipeMaxTouches:1,swipeVelocityX:.6,swipeVelocityY:.6},handler:function(a,b){if(a.eventType==p){var c=a.touches.length,d=b.options;if(c<d.swipeMinTouches||c>d.swipeMaxTouches)return;(a.velocityX>d.swipeVelocityX||a.velocityY>d.swipeVelocityY)&&(b.trigger(this.name,a),b.trigger(this.name+a.direction,a))}}},function(a){function b(b,d){var e,f,g=d.options,h=u.current,i=u.previous;switch(b.eventType){case m:c=!1;break;case n:c=c||b.distance>g.tapMaxDistance;break;case o:!r.inStr(b.srcEvent.type,"cancel")&&b.deltaTime<g.tapMaxTime&&!c&&(e=i&&i.lastEvent&&b.timeStamp-i.lastEvent.timeStamp,f=!1,i&&i.name==a&&e&&e<g.doubleTapInterval&&b.distance<g.doubleTapDistance&&(d.trigger("doubletap",b),f=!0),(!f||g.tapAlways)&&(h.name=a,d.trigger(h.name,b)))}}var c=!1;d.gestures.Tap={name:a,index:100,handler:b,defaults:{tapMaxTime:250,tapMaxDistance:10,tapAlways:!0,doubleTapDistance:20,doubleTapInterval:300}}}("tap"),d.gestures.Touch={name:"touch",index:-1/0,defaults:{preventDefault:!1,preventMouse:!1},handler:function(a,b){return b.options.preventMouse&&a.pointerType==j?void a.stopDetect():(b.options.preventDefault&&a.preventDefault(),void(a.eventType==q&&b.trigger("touch",a)))}},function(a){function b(b,d){switch(b.eventType){case m:c=!1;break;case n:if(b.touches.length<2)return;var e=Math.abs(1-b.scale),f=Math.abs(b.rotation);if(e<d.options.transformMinScale&&f<d.options.transformMinRotation)return;u.current.name=a,c||(d.trigger(a+"start",b),c=!0),d.trigger(a,b),f>d.options.transformMinRotation&&d.trigger("rotate",b),e>d.options.transformMinScale&&(d.trigger("pinch",b),d.trigger("pinch"+(b.scale<1?"in":"out"),b));break;case p:c&&b.changedLength<2&&(d.trigger(a+"end",b),c=!1)}}var c=!1;d.gestures.Transform={name:a,index:45,defaults:{transformMinScale:.01,transformMinRotation:1},handler:b}}("transform"),"function"==typeof define&&define.amd?define(function(){return d}):"undefined"!=typeof module&&module.exports?module.exports=d:a.Hammer=d}(window);
//# sourceMappingURL=hammer.min.map

// damageCounter.js
/*jshint esversion: 6*/

let DamageCounter = pc.createScript('damageCounter');

// initialize code called once per entity
DamageCounter.prototype.initialize = function() {
    this.entity.collision.on('collisionend', this.onCollisionEnd, this);
};

// update code called every frame
DamageCounter.prototype.update = function(dt) {
    
};

DamageCounter.prototype.onCollisionEnd = function(result) {
    // Destroy the bullet if it hits an asteroid 
    if(result.name === "Asteroid") {
        this.damage(8);
    }
    
    else if (result.name === "Ice") {
        this.damage(5);
    }
    
    else if (result.name === "Comet") {
        this.damage(2);
    }
    
};

DamageCounter.prototype.damage = function(amt) {
    let damageText = this.app.root.findByName("DAMAGE");
    if (parseInt(damageText.element.text) > 0) {
        damageText.element.text = (parseInt(damageText.element.text)-amt).toString();
    }
    else {
        
    }
};

// swap method called for script hot-reloading
// inherit your script state here
// DamageCounter.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

var HydrogenInit=pc.createScript("hydrogenInit");HydrogenInit.prototype.initialize=function(){this.hydrogenInitial=Number(localStorage.hydrogen),this.entity.element.text=Number(localStorage.hydrogen)},HydrogenInit.prototype.sendValue=function(){return this.hydrogenInitial};var CarbonInit=pc.createScript("carbonInit");CarbonInit.prototype.initialize=function(){this.reducedCarbon=Number(localStorage.carbon),this.entity.element.text=Number(localStorage.carbon)},CarbonInit.prototype.sendValue=function(){return this.reducedCarbon};var LithiumInit=pc.createScript("lithiumInit");LithiumInit.prototype.initialize=function(){this.lithiumInitial=Number(localStorage.lithium),this.entity.element.text=Number(localStorage.lithium)},LithiumInit.prototype.sendValue=function(){return this.lithiumInitial};var OxygenInit=pc.createScript("oxygenInit");OxygenInit.prototype.initialize=function(){this.initialUranium=Number(localStorage.oxygen),this.entity.element.text=Number(localStorage.oxygen)},OxygenInit.prototype.sendValue=function(){return this.initialUranium};var UraniumInit=pc.createScript("uraniumInit");UraniumInit.prototype.initialize=function(){this.uraniumInitial=Number(localStorage.uranium),this.entity.element.text=Number(localStorage.uranium)},UraniumInit.prototype.sendValue=function(){return this.uraniumInitial};var FuelInit=pc.createScript("fuelInit");FuelInit.prototype.initialize=function(){this.entity.element.text=Number(localStorage.fuel)},FuelInit.prototype.update=function(t){};// collect.js
/*jshint esversion: 6*/

let Collect = pc.createScript('collect');

// initialize code called once per entity
Collect.prototype.initialize = function() {
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onSelect, this);
    
    this.app.root.findByName("MAT_TO_COLLECT").element.text = Number(localStorage.collector).toString();
    
};

// update code called every frame
Collect.prototype.onSelect = function(e) {
    let from = this.entity.camera.screenToWorld(e.x, e.y, this.entity.camera.nearClip);
    let to = this.entity.camera.screenToWorld(e.x, e.y, this.entity.camera.farClip);

    let result = this.app.systems.rigidbody.raycastFirst(from, to);
    if (result) {
        let pickedEntity = result.entity;
        if (pickedEntity.name !== "Ship") {
            if (pickedEntity.model.enabled === true) {
                switch (pickedEntity.name) {
                    case "Asteroid":
                        break;
                    case "Ice":

                        if (Number(localStorage.collector) > 1) {
                            this.saveHydrogen(2);
                            this.saveSHydrogen(2);
                            this.saveOxygen(4);
                            this.saveSOxygen(4);

                            this.updateMat("HYDROGEN", 2, localStorage.hydrogen);
                            this.updateMat("OXYGEN", 4, localStorage.oxygen);
                            localStorage.setItem('collector', (parseInt(this.app.root.findByName("MAT_TO_COLLECT").element.text)-1));
                            this.app.root.findByName("MAT_TO_COLLECT").element.text = (parseInt(this.app.root.findByName("MAT_TO_COLLECT").element.text)-1).toString();
                            localStorage.setItem('collector', (parseInt(this.app.root.findByName("MAT_TO_COLLECT").element.text)-1));
                            this.app.root.findByName("MAT_TO_COLLECT").element.text = (parseInt(this.app.root.findByName("MAT_TO_COLLECT").element.text)-1).toString();
                        }

                        pickedEntity.findByName("COLLECT").particlesystem.play();
                        pickedEntity.model.enabled = false;
                        pickedEntity.rigidbody.enabled = false;
                        break;
                    case "Model":
                        if (Number(localStorage.collector) > 0) {
                            this.saveUranium(10);
                            this.saveSUranium(10);
                            this.updateMat("URANIUM", 10, localStorage.uranium);
                            localStorage.setItem('collector', (parseInt(this.app.root.findByName("MAT_TO_COLLECT").element.text)-1));
                            this.app.root.findByName("MAT_TO_COLLECT").element.text = (parseInt(this.app.root.findByName("MAT_TO_COLLECT").element.text)-1).toString();
                        }
                        pickedEntity.parent.findByName("COLLECT").particlesystem.play();
                        pickedEntity.model.enabled = false;
                        pickedEntity.rigidbody.enabled = false;
                        pickedEntity.parent.findByName("Particle System").particlesystem.enabled = false;
                        pickedEntity.parent.rigidbody.enabled = false;
                        break;
                    case "Comet":

                        if (Number(localStorage.collector) > 0) {
                            this.saveLithium(5);
                            this.saveSLithium(5);
                            this.saveCarbon(5);
                            this.saveSCarbon(5);

                            this.updateMat("LITHIUM", 5, localStorage.lithium);
                            this.updateMat("CARBON", 5, localStorage.carbon);
                            localStorage.setItem('collector', (parseInt(this.app.root.findByName("MAT_TO_COLLECT").element.text)-1));
                            this.app.root.findByName("MAT_TO_COLLECT").element.text = (parseInt(this.app.root.findByName("MAT_TO_COLLECT").element.text)-1).toString();   
                        }          


                        pickedEntity.findByName("COLLECT").particlesystem.play();
                        pickedEntity.model.enabled = false;
                        pickedEntity.rigidbody.enabled = false;
                        pickedEntity.findByName("Particle System").enabled = false;
                        break;
                }
            }
        }
    }
};

Collect.prototype.updateMat = function(MAT_Name, lim) {
    let initial = "MAT_"+MAT_Name;
    let entityToGet = this.app.root.findByName(initial);
    
    if (this.app.root.findByName("MAT_TO_COLLECT").element.text !== "0") {
       let intText = parseInt(entityToGet.element.text);
       if (intText < lim) {
            entityToGet.element.text = (parseInt(entityToGet.element.text)+1).toString();
       } 
    }
};

Collect.prototype.saveHydrogen = function(lim) {
    let text = parseInt(this.app.root.findByName("MAT_HYDROGEN").element.text);
    if (text < lim) {
        localStorage.hydrogen = Number(localStorage.hydrogen) + 1;
    }
};

Collect.prototype.saveSHydrogen = function(lim) {
    let text = parseInt(this.app.root.findByName("MAT_HYDROGEN").element.text);
    if (text < lim) {
        localStorage.storage_hydrogen = Number(localStorage.storage_hydrogen) + 1;
    }
};

Collect.prototype.saveOxygen = function(lim) {
    let text = parseInt(this.app.root.findByName("MAT_OXYGEN").element.text);
    if (text < lim) {
        localStorage.oxygen = Number(localStorage.oxygen) + 1;
    }
};

Collect.prototype.saveSOxygen = function(lim) {
    let text = parseInt(this.app.root.findByName("MAT_OXYGEN").element.text);
    if (text < lim) {
        localStorage.storage_oxygen = Number(localStorage.storage_oxygen) + 1;
    }
};

Collect.prototype.saveLithium = function(lim) {
    let text = parseInt(this.app.root.findByName("MAT_LITHIUM").element.text);
    if (text < lim) {
        localStorage.lithium = Number(localStorage.lithium) + 1;
    }
};

Collect.prototype.saveSLithium = function(lim) {
    let text = parseInt(this.app.root.findByName("MAT_LITHIUM").element.text);
    if (text < lim) {
        localStorage.storage_lithium = Number(localStorage.storage_lithium) + 1;
    }
};

Collect.prototype.saveCarbon = function(lim) {
    let text = parseInt(this.app.root.findByName("MAT_CARBON").element.text);
    if (text < lim) {
        localStorage.carbon = Number(localStorage.carbon) + 1;
    }
};

Collect.prototype.saveSCarbon = function(lim) {
    let text = parseInt(this.app.root.findByName("MAT_CARBON").element.text);
    if (text < lim) {
        localStorage.storage_carbon = Number(localStorage.storage_carbon) + 1;
    }
};

Collect.prototype.saveUranium = function(lim) {
    let text = parseInt(this.app.root.findByName("MAT_URANIUM").element.text);
    if (text < lim) {
        localStorage.uranium = Number(localStorage.uranium) + 1;
    }
};

Collect.prototype.saveSUranium = function(lim) {
    let text = parseInt(this.app.root.findByName("MAT_URANIUM").element.text);
    if (text < lim) {
        localStorage.storage_uranium = Number(localStorage.storage_uranium) + 1;
    }
};

// swap method called for script hot-reloading
// inherit your script state here
// Collect.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

var FoodInit=pc.createScript("foodInit");FoodInit.prototype.initialize=function(){this.entity.element.text=Number(localStorage.food)},FoodInit.prototype.update=function(t){};var WaterInit=pc.createScript("waterInit");WaterInit.prototype.initialize=function(){this.entity.element.text=Number(localStorage.water)},WaterInit.prototype.update=function(t){};var BatteryInit=pc.createScript("batteryInit");BatteryInit.prototype.initialize=function(){this.entity.element.text=Number(localStorage.battery)},BatteryInit.prototype.update=function(t){};var Caution=pc.createScript("caution"),activeC=!1,revC=!1;Caution.prototype.initialize=function(){this.app.on("flash:caution",this.onFlashCaution,this)},Caution.prototype.update=function(){!0===activeC&&(this.entity.model.meshInstances[0].material.emissiveIntensity>9.5&&(revC=!0),this.entity.model.meshInstances[0].material.emissiveIntensity<1&&(revC=!1),!1===revC&&(this.entity.model.meshInstances[0].material.emissiveIntensity+=1.5,this.entity.model.meshInstances[0].material.update()),!0===revC&&(this.entity.model.meshInstances[0].material.emissiveIntensity-=1.5,this.entity.model.meshInstances[0].material.update()))},Caution.prototype.onFlashCaution=function(){activeC=!activeC};// cycle.js
/*jshint esversion: 6*/

let Cycle = pc.createScript('cycle');

Cycle.attributes.add('one', {
    type: 'entity',
});

Cycle.attributes.add('two', {
    type: 'entity',
});

Cycle.attributes.add('three', {
    type: 'entity',
});

Cycle.attributes.add("Flight_Scene", {type: "string", default: "", title: "Flight Scene Name to Load"});
Cycle.attributes.add("Bridge_Scene", {type: "string", default: "", title: "Bridge Scene Name to Load"});

// initialize code called once per entity
Cycle.prototype.initialize = function() {
    
};

// update code called every frame
Cycle.prototype.update = function(dt) {
    if (this.app.keyboard.wasPressed(pc.KEY_RIGHT)) {
        this.increment();
    }
    
    if (this.app.keyboard.wasPressed(pc.KEY_LEFT)) {
        this.increment();
    }
    
    if (this.app.keyboard.wasPressed(pc.KEY_ENTER)) {
        this.goTo();
    }
    
};

Cycle.prototype.increment = function() {
    if (this.one.enabled === true) {
        this.one.enabled = false;
        this.two.enabled = true;
    }
    
    else if (this.two.enabled === true) {
        this.two.enabled = false;
        this.three.enabled = true;
    }
    
    else if (this.three.enabled === true) {
        this.three.enabled = false;
        this.one.enabled = true;
    }
};

Cycle.prototype.decrement = function() {
    if (this.one.enabled === true) {
        this.one.enabled = false;
        this.three.enabled = true;
    }
    
    else if (this.two.enabled === true) {
        this.two.enabled = false;
        this.one.enabled = true;
    }
    
    else if (this.three.enabled === true) {
        this.three.enabled = false;
        this.two.enabled = true;
    }
};

Cycle.prototype.goTo = function() {
    if (this.three.enabled === true) {
        if (this.three.element.text === 'not started'){
            let oneText = this.three.children[0];
            let twoText = this.three.children[1];
            let threeText = this.three.children[2];
            
            let arr1 = [oneText.element.text, twoText.element.text, threeText.element.text];
            let arr2 = [oneText.children[0].element.text, twoText.children[0].element.text, threeText.children[0].element.text];
            let arr3 = [false, false, false];
            let arr4 = [];
            
            if (arr1[0] === "hydrogen") {
                arr4[0] = Number(localStorage.hydrogen);
            }
            
            else if (arr1[0] === "oxygen") {
                arr4[0] = Number(localStorage.oxygen);
            }
            
            else if (arr1[0] === "carbon") {
                arr4[0] = Number(localStorage.carbon);
            }
            
            else if (arr1[0] === "lithium") {
                arr4[0] = Number(localStorage.lithium);
            }
            
            
            if (arr1[1] === "hydrogen") {
                arr4[1] = Number(localStorage.hydrogen);
            }
            
            else if (arr1[1] === "oxygen") {
                arr4[1] = Number(localStorage.oxygen);
            }
            
            else if (arr1[1] === "carbon") {
                arr4[1] = Number(localStorage.carbon);
            }
            
            else if (arr1[1] === "lithium") {
                arr4[1] = Number(localStorage.lithium);
            }
            
            
            if (arr1[2] === "hydrogen") {
                arr4[2] = Number(localStorage.hydrogen);
            }
            
            else if (arr1[2] === "oxygen") {
                arr4[2] = Number(localStorage.oxygen);
            }
            
            else if (arr1[2] === "carbon") {
                arr4[2] = Number(localStorage.carbon);
            }
            
            else if (arr1[2] === "lithium") {
                arr4[2] = Number(localStorage.lithium);
            }
            
            localStorage.setItem('arr1S', JSON.stringify(arr1));
            localStorage.setItem('arr2S', JSON.stringify(arr2));
            localStorage.setItem('arr3S', JSON.stringify(arr3));
            localStorage.setItem('arr4S', JSON.stringify(arr4));
            
            this.three.element.text = 'in progress';
        }
        
        else if (this.three.element.text === 'in progress') {
            let tick1 = this.app.root.findByName("ImgOne").findByName("Tick");
            let tick2 = this.app.root.findByName("ImgTwo").findByName("Tick");
            let tick3 = this.app.root.findByName("ImgThree").findByName("Tick");
            let currentData, futureData;
            
            if (tick1.enabled === true && tick2.enabled === true && tick3.enabled === true) {
                if (this.app.root.findByName("E").enabled === true) {
                    currentData = parseInt(localStorage.getItem('collector'));
                    futureData = currentData + 1;
                    localStorage.setItem('collector', futureData.toString());
                    this.app.root.findByName("COLLECTOR_TEXT").element.text = futureData.toString();
                }
                
                else if (this.app.root.findByName("D").enabled === true) {
                    currentData = parseInt(localStorage.getItem('collector'));
                    futureData = currentData + 3;
                    localStorage.setItem('collector', futureData.toString());
                    this.app.root.findByName("COLLECTOR_TEXT").element.text = futureData.toString();
                }
                
                else if (this.app.root.findByName("C").enabled === true) {
                    currentData = parseInt(localStorage.getItem('collector'));
                    futureData = currentData + 5;
                    localStorage.setItem('collector', futureData.toString());
                    this.app.root.findByName("COLLECTOR_TEXT").element.text = futureData.toString();
                }
                
                else if (this.app.root.findByName("B").enabled === true) {
                    currentData = parseInt(localStorage.getItem('collector'));
                    futureData = currentData + 7;
                    localStorage.setItem('collector', futureData.toString());
                    this.app.root.findByName("COLLECTOR_TEXT").element.text = futureData.toString();
                }
                
                else if (this.app.root.findByName("A").enabled === true) {
                    currentData = parseInt(localStorage.getItem('collector'));
                    futureData = currentData + 9;
                    localStorage.setItem('collector', futureData.toString());
                    this.app.root.findByName("COLLECTOR_TEXT").element.text = futureData.toString();
                }
                
                
                localStorage.arr1S = "0";
                localStorage.arr2S = "0";
                localStorage.arr3S = "0";
                localStorage.arr4S = "0";
                this.three.element.text = 'not started';
                
                if (this.app.root.findByName("E").enabled === true) {
                    this.three.script.setMiniGame.setValues('E');
                }
                else if (this.app.root.findByName("D").enabled === true) {
                    this.three.script.setMiniGame.setValues('D');
                }
                else if (this.app.root.findByName("C").enabled === true) {
                    this.three.script.setMiniGame.setValues('C');
                }
                else if (this.app.root.findByName("B").enabled === true) {
                    this.three.script.setMiniGame.setValues('B');
                }
                else if (this.app.root.findByName("A").enabled === true) {
                    this.three.script.setMiniGame.setValues('A');
                }
            }
            
            else {
                this.app.fire('flash:caution');
                setTimeout(function(){
                    this.app.fire('flash:caution');
                }.bind(this), 1000);
            }
            
        }
        
    }
    
    else if (this.one.enabled === true) {
        let fuelText = parseInt(this.app.root.findByName("FUEL_TEXT").element.text);
        if (fuelText < 1) {
            this.app.fire('flash:caution');
            setTimeout(function(){
                this.app.fire('flash:caution');
            }.bind(this), 1000);
        }
        else {
            this.app.root.findByName("FUEL_TEXT").element.text = fuelText - 1;
            localStorage.setItem('fuel', (fuelText-1));
            this.app.timeScale = 1;
            this.app.systems.rigidbody.setGravity(0,0,0);
            
            this.app.root.findByName("CockpitSound").sound.stop("Sound");
            this.app.root.findByName("FlightSound").sound.play("Sound");
            
            this.app.root.findByName("MAT_HYDROGEN").script.hydrogenInit.initialize();
            this.app.root.findByName("MAT_OXYGEN").script.oxygenInit.initialize();
            this.app.root.findByName("MAT_URANIUM").script.uraniumInit.initialize();
            this.app.root.findByName("MAT_CARBON").script.carbonInit.initialize();
            this.app.root.findByName("MAT_LITHIUM").script.lithiumInit.initialize();
            
            this.app.root.findByName("RootCockpit").enabled = false;
            this.app.root.findByName("RootBridge").enabled = false;
            this.app.root.findByName("RootFlight").enabled = true;
        }
    }
    
    else if (this.two.enabled === true) {
        this.app.timeScale = 1;
        this.app.systems.rigidbody.setGravity(0,-9.8,0);
        
        let randNumberSound = Math.floor(Math.random() * 2) + 1;
        if (randNumberSound === 1) {
            this.app.root.findByName("CockpitSound").sound.stop("Sound");
            this.app.root.findByName("BridgeSound").sound.play("Sound1");
        }
        else if (randNumberSound === 2) {
            this.app.root.findByName("CockpitSound").sound.stop("Sound");
            this.app.root.findByName("BridgeSound").sound.play("Sound2");
        }
        
        this.app.root.findByName("Player").script.firstPersonMovement.initialize();
        this.app.root.findByName("RootFlight").enabled = false;
        this.app.root.findByName("RootCockpit").enabled = false;
        this.app.root.findByName("RootBridge").enabled = true;
    }
    
};

Cycle.prototype.loadScene = function (sceneName) {
    // Get a reference to the scene's root object
    var oldHierarchy = this.app.root.findByName ('Root');
    
    // Get the path to the scene
    var scene = this.app.scenes.find(sceneName);
    
    // Load the scenes entity hierarchy
    this.app.scenes.loadSceneHierarchy(scene.url, function (err, parent) {
        if (!err) {
            oldHierarchy.destroy();
        } else {
            console.error(err);
        }
    });
};

// swap method called for script hot-reloading
// inherit your script state here
// Cycle.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// rating.js
/*jshint esversion: 6*/

let Rating = pc.createScript('rating');

// initialize code called once per entity
Rating.prototype.initialize = function() {
    let childLen = this.entity.children.length;
    for (let er=0; er<childLen; er++) {
        this.entity.children[er].enabled = false;
    }
    
    this.getMaterials();
};

// update code called every frame
Rating.prototype.update = function(dt) {
    
};

Rating.prototype.getMaterials = function() {
    let timer = (Number(localStorage.timer));
    let hydrogenTotal;
    let carbonTotal;
    let lithiumTotal;
    let oxygenTotal;
    let waterTotal;
    let batteryTotal;
    let fuelTotal;
    let foodTotal;
    
    //RAW
    
    if (timer <= 0) {
        console.log("cehjicheich");
        hydrogenTotal = 0;
        carbonTotal = 0;
        lithiumTotal = 0;
        oxygenTotal = 0;
    }
    
    else if (timer > 0 && timer < 10) {
        hydrogenTotal = ((Number(localStorage.storage_hydrogen)/timer)*10);
        carbonTotal = ((Number(localStorage.storage_carbon)/timer)*10);
        lithiumTotal = ((Number(localStorage.storage_lithium)/timer)*10);
        oxygenTotal = ((Number(localStorage.storage_oxygen)/timer)*10);
    }
    else if (timer < 20) {
        hydrogenTotal = ((Number(localStorage.storage_hydrogen)/timer)*20);
        carbonTotal = ((Number(localStorage.storage_carbon)/timer)*20);
        lithiumTotal = ((Number(localStorage.storage_lithium)/timer)*20);
        oxygenTotal = ((Number(localStorage.storage_oxygen)/timer)*20);
    }
    else if (timer < 36) {
        hydrogenTotal = ((Number(localStorage.storage_hydrogen)/timer)*40);
        carbonTotal = ((Number(localStorage.storage_carbon)/timer)*40);
        lithiumTotal = ((Number(localStorage.storage_lithium)/timer)*40);
        oxygenTotal = ((Number(localStorage.storage_oxygen)/timer)*40);
    }
    else {
        hydrogenTotal = ((Number(localStorage.storage_hydrogen)/timer)*60);
        carbonTotal = ((Number(localStorage.storage_carbon)/timer)*60);
        lithiumTotal = ((Number(localStorage.storage_lithium)/timer)*60);
        oxygenTotal = ((Number(localStorage.storage_oxygen)/timer)*60);
    }
    
    //PROC
    
    if (timer <= 0) {
        console.log("cehjicheich");
        waterTotal = 0;
        batteryTotal = 0;
        fuelTotal = 0;
        foodTotal = 0;
    }
    
    if (timer > 0 && timer < 10) {
        waterTotal = ((Number(localStorage.storage_water)/timer)*10);
        batteryTotal = ((Number(localStorage.storage_water)/timer)*10);
        fuelTotal = ((Number(localStorage.storage_fuel)/timer)*10);
        foodTotal = ((Number(localStorage.storage_food)/timer)*10);
    }
    else if (timer < 20) {
        waterTotal = ((Number(localStorage.storage_water)/timer)*20);
        batteryTotal = ((Number(localStorage.storage_water)/timer)*20);
        fuelTotal = ((Number(localStorage.storage_fuel)/timer)*20);
        foodTotal = ((Number(localStorage.storage_food)/timer)*20);
    }
    else if (timer < 36) {
        waterTotal = ((Number(localStorage.storage_water)/timer)*40);
        batteryTotal = ((Number(localStorage.storage_water)/timer)*40);
        fuelTotal = ((Number(localStorage.storage_fuel)/timer)*40);
        foodTotal = ((Number(localStorage.storage_food)/timer)*40);
    }
    else {
        waterTotal = ((Number(localStorage.storage_water)/timer)*60);
        batteryTotal = ((Number(localStorage.storage_water)/timer)*60);
        fuelTotal = ((Number(localStorage.storage_fuel)/timer)*60);
        foodTotal = ((Number(localStorage.storage_food)/timer)*60);
    }
    
    let mat_arr = [hydrogenTotal, oxygenTotal, lithiumTotal, carbonTotal, waterTotal, fuelTotal, batteryTotal, foodTotal];
    
    if (timer <= 0) {
        let myEntity = this.app.root.findByName('Rating_Parent');
        let three = this.app.root.findByName('3');
        myEntity.script.rating.rate('E');
        three.script.setMiniGame.setValues('E');
    }
    
    else {
        predict(mat_arr);
    }
};


Rating.prototype.rate = function(letter) {
    this.app.root.findByName(letter).enabled = true;
};

const predict = async function(arr) {
    let inputCalc = tf.tensor(arr);
    let data = inputCalc.reshape([1, 8]);
    const model = await tf.loadLayersModel('https://raw.githubusercontent.com/ABcoder29/special-tribble/main/model.json');
    let tensorOutput = model.predict(data);
    
    let finalRes = parseFloat(tensorOutput.dataSync()[0]);
    let app = pc.Application.getApplication();
    let myEntity = app.root.findByName('Rating_Parent');
    let three = app.root.findByName('3');
    
    if (finalRes < 8) {
        myEntity.script.rating.rate('E');
        three.script.setMiniGame.setValues('E');
    }
    
    else if (finalRes >= 8 && finalRes <= 10) {
        myEntity.script.rating.rate('D');
        three.script.setMiniGame.setValues('D');
    }
    
    else if (finalRes > 10 && finalRes <= 12) {
        myEntity.script.rating.rate('C');
        three.script.setMiniGame.setValues('C');
    }
    
    else if (finalRes > 12 && finalRes <= 14) {
        myEntity.script.rating.rate('B');
        three.script.setMiniGame.setValues('B');
    }
    
    else {
        myEntity.script.rating.rate('A');
        three.script.setMiniGame.setValues('A');
    }
    
}

// swap method called for script hot-reloading
// inherit your script state here
// Rating.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

var Video=pc.createScript("video");Video.attributes.add("materials",{type:"asset",assetType:"material",array:!0}),Video.attributes.add("videoUrl",{type:"string"}),Video.prototype.initialize=function(){var e=this.app,t=new pc.Texture(e.graphicsDevice,{format:pc.PIXELFORMAT_R5_G6_B5,autoMipmap:!1});t.minFilter=pc.FILTER_LINEAR,t.magFilter=pc.FILTER_LINEAR,t.addressU=pc.ADDRESS_CLAMP_TO_EDGE,t.addressV=pc.ADDRESS_CLAMP_TO_EDGE;var i=document.createElement("video");i.addEventListener("canplay",function(e){t.setSource(i)}),i.src="https://media.publit.io/file/chaos_wallpaper_finished.mp4",i.crossOrigin="anonymous",i.loop=!0,i.muted=!0,i.play();for(var a=0;a<this.materials.length;a++){var r=this.materials[a].resource;r.emissiveMap=t,r.update()}this.videoTexture=t,this.upload=!0},Video.prototype.update=function(e){this.upload=!this.upload,this.upload&&this.videoTexture.upload()};// setMiniGame.js
/*jshint esversion: 6*/

let SetMiniGame = pc.createScript('setMiniGame');

// initialize code called once per entity
SetMiniGame.prototype.initialize = function() {
    if (localStorage.arr1S !== '0') {
        this.entity.element.text = "in progress";
    }
};

// update code called every frame
SetMiniGame.prototype.setValues = function(rating) {
    //Setting Materials
    let rawMaterials = ['hydrogen', 'oxygen', 'carbon', 'lithium'];
    
    let one = rawMaterials[Math.floor(Math.random() * rawMaterials.length)];
    this.entity.children[0].element.text = one;
    rawMaterials.splice(rawMaterials.indexOf(one), 1);
    
    let two = rawMaterials[Math.floor(Math.random() * rawMaterials.length)];
    this.entity.children[1].element.text = two;
    rawMaterials.splice(rawMaterials.indexOf(two), 1);
    
    let three = rawMaterials[Math.floor(Math.random() * rawMaterials.length)];
    this.entity.children[2].element.text = three;
    rawMaterials.splice(rawMaterials.indexOf(three), 1);
    
    
    //Setting Values
    let num, num2, num3;
    if (localStorage.arr1S === '0') {
        if (rating === 'E') {
            num = Math.floor(Math.random() * 3) + 1; 
            num2 = Math.floor(Math.random() * 3) + 1;
            num3 = Math.floor(Math.random() * 3) + 1;

            this.entity.children[0].children[0].element.text = num;
            this.entity.children[1].children[0].element.text = num2;
            this.entity.children[2].children[0].element.text = num3;
        }

        else if (rating === 'D') {
            num = Math.floor(Math.random() * 5) + 4; 
            num2 = Math.floor(Math.random() * 5) + 4;
            num3 = Math.floor(Math.random() * 5) + 4;

            this.entity.children[0].children[0].element.text = num;
            this.entity.children[1].children[0].element.text = num2;
            this.entity.children[2].children[0].element.text = num3;
        }

        else if (rating === 'C') {
            num = Math.floor(Math.random() * 8) + 6; 
            num2 = Math.floor(Math.random() * 8) + 6;
            num3 = Math.floor(Math.random() * 8) + 6;

            this.entity.children[0].children[0].element.text = num;
            this.entity.children[1].children[0].element.text = num2;
            this.entity.children[2].children[0].element.text = num3;
        }

        else if (rating === 'B') {
            num = Math.floor(Math.random() * 10) + 9; 
            num2 = Math.floor(Math.random() * 10) + 9;
            num3 = Math.floor(Math.random() * 10) + 9;

            this.entity.children[0].children[0].element.text = num;
            this.entity.children[1].children[0].element.text = num2;
            this.entity.children[2].children[0].element.text = num3;
        }

        else if (rating === 'A') {
            num = Math.floor(Math.random() * 13) + 11; 
            num2 = Math.floor(Math.random() * 13) + 11;
            num3 = Math.floor(Math.random() * 13) + 11;

            this.entity.children[0].children[0].element.text = num;
            this.entity.children[1].children[0].element.text = num2;
            this.entity.children[2].children[0].element.text = num3;
        }
    }
    
    else {
        let matArr = JSON.parse(localStorage.getItem('arr1S'));
        let numArr = JSON.parse(localStorage.getItem('arr2S'));
        let statusArr = [false];
        let leftArr = JSON.parse(localStorage.getItem('arr4S'));
        
        this.entity.children[0].element.text = matArr[0];
        this.entity.children[1].element.text = matArr[1];
        this.entity.children[2].element.text = matArr[2];
        
        this.entity.children[0].children[0].element.text = numArr[0];
        this.entity.children[1].children[0].element.text = numArr[1];
        this.entity.children[2].children[0].element.text = numArr[2];
        
        let numberLithium = Number(localStorage.lithium) + (5*(Number(localStorage.battery)));
        let numberCarbon = Number(localStorage.carbon) + (5*(Number(localStorage.food)));
        let numberOxygen = Number(localStorage.oxygen) + (3*(Number(localStorage.oxygen)));
        let numberHydrogen = 0;
        let i;
        for (i = 1; i <= Number(localStorage.water); i++) {
            numberOxygen ++;
            numberHydrogen = numberHydrogen + 2;
        }
        
        
        if (statusArr[0] === true) {
            this.app.root.findByName("ImgOne").findByName("Tick").enabled = true;
        }
        
        else {
            if (matArr[0] === "hydrogen") {
                this.app.root.findByName("ImgOne").findByName("Text").enabled = true;
                if ((numberHydrogen - leftArr[0]) > 0) {
                    this.app.root.findByName("ImgOne").findByName("Text").element.text = numberHydrogen - leftArr[0];
                    if ((numberHydrogen - leftArr[0]) > parseInt(this.entity.children[0].children[0].element.text)) {
                        this.app.root.findByName("ImgOne").findByName("Text").enabled = false;
                        this.app.root.findByName("ImgOne").findByName("Tick").enabled = true;
                    }
                }
                else {
                    this.app.root.findByName("ImgOne").findByName("Text").element.text = 0;
                }
            }
            else if (matArr[0] === "carbon") {
                this.app.root.findByName("ImgOne").findByName("Text").enabled = true;
                if ((numberCarbon - leftArr[0]) > 0) {
                    this.app.root.findByName("ImgOne").findByName("Text").element.text = numberCarbon - leftArr[0];
                    if ((numberCarbon - leftArr[0]) > parseInt(this.entity.children[0].children[0].element.text)) {
                        this.app.root.findByName("ImgOne").findByName("Text").enabled = false;
                        this.app.root.findByName("ImgOne").findByName("Tick").enabled = true;
                    }
                }
                else {
                    this.app.root.findByName("ImgOne").findByName("Text").element.text = 0;
                }
            }
            else if (matArr[0] === "lithium") {
                this.app.root.findByName("ImgOne").findByName("Text").enabled = true;
                if ((numberLithium - leftArr[0]) > 0) {
                    this.app.root.findByName("ImgOne").findByName("Text").element.text = numberLithium - leftArr[0];
                    if ((numberLithium - leftArr[0]) > parseInt(this.entity.children[0].children[0].element.text)) {
                        this.app.root.findByName("ImgOne").findByName("Text").enabled = false;
                        this.app.root.findByName("ImgOne").findByName("Tick").enabled = true;
                    }
                }
                else {
                    this.app.root.findByName("ImgOne").findByName("Text").element.text = 0;
                }
            }
            else if (matArr[0] === "oxygen") {
                this.app.root.findByName("ImgOne").findByName("Text").enabled = true;
                if ((numberOxygen - leftArr[0]) > 0) {
                    this.app.root.findByName("ImgOne").findByName("Text").element.text = numberOxygen - leftArr[0];
                    if ((numberOxygen - leftArr[0]) > parseInt(this.entity.children[0].children[0].element.text)) {
                        this.app.root.findByName("ImgOne").findByName("Text").enabled = false;
                        this.app.root.findByName("ImgOne").findByName("Tick").enabled = true;
                    }
                }
                else {
                    this.app.root.findByName("ImgOne").findByName("Text").element.text = 0;
                }
            }
        }
        
        
        if (statusArr[1] === true) {
            this.app.root.findByName("ImgTwo").findByName("Tick").enabled = true;
        }
        
        else {
            if (matArr[1] === "hydrogen") {
                this.app.root.findByName("ImgTwo").findByName("Text").enabled = true;
                if ((numberHydrogen - leftArr[1]) > 0) {
                    this.app.root.findByName("ImgTwo").findByName("Text").element.text = numberHydrogen - leftArr[1];
                    if ((numberHydrogen - leftArr[1]) > parseInt(this.entity.children[1].children[0].element.text)) {
                        this.app.root.findByName("ImgTwo").findByName("Text").enabled = false;
                        this.app.root.findByName("ImgTwo").findByName("Tick").enabled = true;
                    }
                }
                else {
                    this.app.root.findByName("ImgTwo").findByName("Text").element.text = 0;
                }
            }
            else if (matArr[1] === "carbon") {
                this.app.root.findByName("ImgTwo").findByName("Text").enabled = true;
                if ((numberCarbon - leftArr[0]) > 0) {
                    this.app.root.findByName("ImgTwo").findByName("Text").element.text = numberCarbon - leftArr[1];
                    if ((numberCarbon - leftArr[1]) > parseInt(this.entity.children[1].children[0].element.text)) {
                        this.app.root.findByName("ImgTwo").findByName("Text").enabled = false;
                        this.app.root.findByName("ImgTwo").findByName("Tick").enabled = true;
                    }
                }
                else {
                    this.app.root.findByName("ImgTwo").findByName("Text").element.text = 0;
                }
            }
            else if (matArr[1] === "lithium") {
                this.app.root.findByName("ImgTwo").findByName("Text").enabled = true;
                if ((numberLithium - leftArr[0]) > 0) {
                    this.app.root.findByName("ImgTwo").findByName("Text").element.text = numberLithium - leftArr[1];
                    if ((numberLithium - leftArr[1]) > parseInt(this.entity.children[1].children[0].element.text)) {
                        this.app.root.findByName("ImgTwo").findByName("Text").enabled = false;
                        this.app.root.findByName("ImgTwo").findByName("Tick").enabled = true;
                    }
                }
                else {
                    this.app.root.findByName("ImgTwo").findByName("Text").element.text = 0;
                }
            }
            else if (matArr[1] === "oxygen") {
                this.app.root.findByName("ImgTwo").findByName("Text").enabled = true;
                if ((numberOxygen - leftArr[1]) > 0) {
                    this.app.root.findByName("ImgTwo").findByName("Text").element.text = numberOxygen - leftArr[1];
                    if ((numberOxygen - leftArr[1]) > parseInt(this.entity.children[1].children[0].element.text)) {
                        this.app.root.findByName("ImgTwo").findByName("Text").enabled = false;
                        this.app.root.findByName("ImgTwo").findByName("Tick").enabled = true;
                    }
                }
                else {
                    this.app.root.findByName("ImgTwo").findByName("Text").element.text = 0;
                }
            }
        }
        
        
        if (statusArr[2] === true) {
            this.app.root.findByName("ImgThree").findByName("Tick").enabled = true;
        }
        
        else {
            if (matArr[2] === "hydrogen") {
                this.app.root.findByName("ImgThree").findByName("Text").enabled = true;
                if ((numberHydrogen - leftArr[2]) > 0) {
                    this.app.root.findByName("ImgThree").findByName("Text").element.text = numberHydrogen - leftArr[2];
                    if ((numberHydrogen - leftArr[2]) > parseInt(this.entity.children[2].children[0].element.text)) {
                        this.app.root.findByName("ImgThree").findByName("Text").enabled = false;
                        this.app.root.findByName("ImgThree").findByName("Tick").enabled = true;
                    }
                }
                else {
                    this.app.root.findByName("ImgThree").findByName("Text").element.text = 0;
                }
            }
            else if (matArr[2] === "carbon") {
                this.app.root.findByName("ImgThree").findByName("Text").enabled = true;
                if ((numberCarbon - leftArr[0]) > 0) {
                    this.app.root.findByName("ImgThree").findByName("Text").element.text = numberCarbon - leftArr[2];
                    if ((numberCarbon - leftArr[2]) > parseInt(this.entity.children[2].children[0].element.text)) {
                        this.app.root.findByName("ImgThree").findByName("Text").enabled = false;
                        this.app.root.findByName("ImgThree").findByName("Tick").enabled = true;
                    }
                }
                else {
                    this.app.root.findByName("ImgThree").findByName("Text").element.text = 0;
                }
            }
            else if (matArr[2] === "lithium") {
                this.app.root.findByName("ImgThree").findByName("Text").enabled = true;
                if ((numberLithium - leftArr[0]) > 0) {
                    this.app.root.findByName("ImgThree").findByName("Text").element.text = numberLithium - leftArr[2];
                    if ((numberLithium - leftArr[2]) > parseInt(this.entity.children[2].children[0].element.text)) {
                        this.app.root.findByName("ImgThree").findByName("Text").enabled = false;
                        this.app.root.findByName("ImgThree").findByName("Tick").enabled = true;
                    }
                }
                else {
                    this.app.root.findByName("ImgThree").findByName("Text").element.text = 0;
                }
            }
            else if (matArr[2] === "oxygen") {
                this.app.root.findByName("ImgThree").findByName("Text").enabled = true;
                if ((numberOxygen - leftArr[1]) > 0) {
                    this.app.root.findByName("ImgThree").findByName("Text").element.text = numberOxygen - leftArr[2];
                    if ((numberOxygen - leftArr[2]) > parseInt(this.entity.children[2].children[0].element.text)) {
                        this.app.root.findByName("ImgThree").findByName("Text").enabled = false;
                        this.app.root.findByName("ImgThree").findByName("Tick").enabled = true;
                    }
                }
                else {
                    this.app.root.findByName("ImgThree").findByName("Text").element.text = 0;
                }
            }
        
        }
    }
    
};

// swap method called for script hot-reloading
// inherit your script state here
// SetMiniGame.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

var CollectorInit=pc.createScript("collectorInit");CollectorInit.prototype.initialize=function(){this.entity.element.text=Number(localStorage.collector)},CollectorInit.prototype.update=function(t){};var ResumeAfterPause=pc.createScript("resumeAfterPause");ResumeAfterPause.prototype.initialize=function(){this.entity.element.on("click",function(e){this.app.timeScale=1,this.app.root.findByName("AI_PARENT").enabled=!0,this.app.root.findByName("Pause").enabled=!1},this)},ResumeAfterPause.prototype.update=function(e){};var Btcp=pc.createScript("btcp");Btcp.attributes.add("Cockpit_Scene",{type:"string",default:"",title:"Cockpit Scene Name to Load"}),Btcp.prototype.initialize=function(){this.entity.element.on("click",function(i){this.app.mouse.off(pc.EVENT_MOUSEDOWN,this.onSelect,this),this.app.timeScale=1,this.app.systems.rigidbody.setGravity(0,-9.8,0),this.app.root.findByName("RootFlight").enabled=!1,this.app.root.findByName("RootBridge").enabled=!1,this.app.root.findByName("FlightSound").sound.stop("Sound"),this.app.root.findByName("CockpitSound").sound.play("Sound"),this.app.root.findByName("RootCockpit").findByName("cockpit").script.caution.initialize(),this.app.root.findByName("RootCockpit").findByName("Rating_Parent").script.rating.initialize(),this.app.root.findByName("RootCockpit").findByName("3").script.setMiniGame.initialize(),this.app.root.findByName("Cycler").script.cycle.initialize(),this.app.root.findByName("FUEL_TEXT").script.fuelInit.initialize(),this.app.root.findByName("WATER_TEXT").script.waterInit.initialize(),this.app.root.findByName("FOOD_TEXT").script.foodInit.initialize(),this.app.root.findByName("BATTERY_TEXT").script.batteryInit.initialize(),this.app.root.findByName("COLLECTOR_TEXT").script.collectorInit.initialize(),this.app.root.findByName("RootCockpit").enabled=!0},this)},Btcp.prototype.update=function(i){},Btcp.prototype.loadScene=function(i){var t=this.app.root.findByName("Root"),o=this.app.scenes.find(i);this.app.scenes.loadSceneHierarchy(o.url,function(i,o){i?console.error(i):t.destroy()})};var TimeMachineTeleport=pc.createScript("timeMachineTeleport");TimeMachineTeleport.attributes.add("Time_Machine",{type:"string",default:"",title:"TM Scene Name to Load"}),TimeMachineTeleport.prototype.initialize=function(){this.entity.element.on("click",function(o){localStorage.clear(),void 0===localStorage.oxygen&&(localStorage.oxygen=0),void 0===localStorage.storage_oxygen&&(localStorage.storage_oxygen=0),void 0===localStorage.hydrogen&&(localStorage.hydrogen=0),void 0===localStorage.storage_hydrogen&&(localStorage.storage_hydrogen=0),void 0===localStorage.lithium&&(localStorage.lithium=0),void 0===localStorage.storage_lithium&&(localStorage.storage_lithium=0),void 0===localStorage.battery&&(localStorage.battery=0),void 0===localStorage.storage_battery&&(localStorage.storage_battery=0),void 0===localStorage.carbon&&(localStorage.carbon=0),void 0===localStorage.storage_carbon&&(localStorage.storage_carbon=0),void 0===localStorage.uranium&&(localStorage.uranium=0),void 0===localStorage.storage_uranium&&(localStorage.storage_uranium=0),void 0===localStorage.water&&(localStorage.water=0),void 0===localStorage.storage_water&&(localStorage.storage_water=0),void 0===localStorage.fuel&&(localStorage.fuel=5),void 0===localStorage.storage_fuel&&(localStorage.storage_fuel=0),void 0===localStorage.food&&(localStorage.food=0),void 0===localStorage.storage_food&&(localStorage.storage_food=0),void 0===localStorage.hyperspeed&&(localStorage.hyperspeed=0),void 0===localStorage.collector&&(localStorage.collector=5),void 0===localStorage.timer&&(localStorage.timer=0),void 0===localStorage.arr1S&&(localStorage.arr1S="0"),void 0===localStorage.arr2S&&(localStorage.arr2S="0"),void 0===localStorage.arr3S&&(localStorage.arr3S="0"),void 0===localStorage.arr4S&&(localStorage.arr4S="0"),this.app.root.findByName("MMSound").sound.stop("Sound"),this.app.root.findByName("TMSound").sound.play("Sound"),this.app.root.findByName("RootMainMenu").enabled=!1,this.app.root.findByName("RootTimeMachine").enabled=!0},this)},TimeMachineTeleport.prototype.update=function(o){},TimeMachineTeleport.prototype.loadScene=function(o){var a=this.app.root.findByName("Root"),e=this.app.scenes.find(o);this.app.scenes.loadSceneHierarchy(e.url,function(o,e){o?console.error(o):a.destroy()})};var currentText,BridgeTutorial=pc.createScript("bridgeTutorial");BridgeTutorial.attributes.add("css",{type:"asset",assetType:"css",title:"CSS Asset"}),BridgeTutorial.attributes.add("html",{type:"asset",assetType:"html",title:"HTML Asset"}),BridgeTutorial.prototype.initialize=function(){var t=document.createElement("style");document.head.appendChild(t),t.innerHTML=this.css.resource||"",this.div=document.createElement("div"),this.div.classList.add("container"),this.div.innerHTML=this.html.resource||"",document.body.appendChild(this.div),this.bindEvents()},BridgeTutorial.prototype.bindEvents=function(){var t=this.div.querySelector(".button");text=this.div.querySelector(".text"),document.getElementsByClassName("container")[0].style.display="none",text&&(text.textContent=""),t&&t.addEventListener("click",function(){localStorage.tutCounter+=currentText,document.getElementsByClassName("container")[0].style.display="none"},!1)},BridgeTutorial.prototype.update=function(t){};var Die=pc.createScript("die");Die.prototype.initialize=function(){this.check=!1},Die.prototype.update=function(e){console.log(this.entity.element.text),parseInt(this.entity.element.text)<=0&&(alert("die"),this.check=!0)};var CameraShake=pc.createScript("cameraShake");CameraShake.attributes.add("shakeInterval",{type:"number",default:.1,title:"Camera Shake Interval"}),CameraShake.attributes.add("maxShakeDistance",{type:"number",default:.1,title:"Max Shake Distance"}),CameraShake.attributes.add("duration",{type:"number",default:1,title:"Duration"}),CameraShake.prototype.initialize=function(){this.time=0,this.timeSinceLastShake=0,this.startPosition=this.entity.getPosition().clone(),this.app.on("camera:shake",this.onStartShake,this)},CameraShake.prototype.update=function(t){if(this.time+=t,this.time<this.duration&&(this.timeSinceLastShake+=t,this.timeSinceLastShake>=this.shakeInterval)){var a=1-pc.math.clamp(this.time/this.duration,0,1),e=2*Math.PI*pc.math.random(0,1),i=pc.math.random(0,this.maxShakeDistance)*a+pc.math.random(0,this.maxShakeDistance)*a,h=i>1?2-i:i,s=h*Math.cos(e),n=h*Math.sin(e);this.entity.setLocalPosition(this.startPosition.x+s,this.startPosition.y+n,this.startPosition.z),this.timeSinceLastShake-=this.shakeInterval}},CameraShake.prototype.onStartShake=function(){this.time=0};var Explode=pc.createScript("explode");Explode.prototype.initialize=function(){this.light=this.entity.findByName("PointLight"),this.mainVfx=this.entity.particlesystem,this.smokeVfx=this.entity.findByName("ExplosionSmoke").particlesystem,this.derbisVfx=this.entity.findByName("ExplosionDebris").particlesystem,this.timeSinceEnabled=0,this.explosionInterval=3;var i=this;setTimeout(function(){i.explode(),i.entity.sound.play("vfx"),i.app.root.findByName("112212").model.enabled=!1},3e3),setTimeout(function(){i.app.root.findByName("RootExplosion").enabled=!1,i.app.root.findByName("CockpitSound").sound.play("Sound"),i.app.root.findByName("RootCockpit").findByName("cockpit").script.caution.initialize(),i.app.root.findByName("RootCockpit").findByName("Rating_Parent").script.rating.initialize(),i.app.root.findByName("RootCockpit").findByName("3").script.setMiniGame.initialize(),i.app.root.findByName("Cycler").script.cycle.initialize(),i.app.root.findByName("FUEL_TEXT").script.fuelInit.initialize(),i.app.root.findByName("WATER_TEXT").script.waterInit.initialize(),i.app.root.findByName("FOOD_TEXT").script.foodInit.initialize(),i.app.root.findByName("BATTERY_TEXT").script.batteryInit.initialize(),i.app.root.findByName("COLLECTOR_TEXT").script.collectorInit.initialize(),i.app.root.findByName("RootCockpit").enabled=!0},6e3)},Explode.prototype.update=function(i){this.timeSinceEnabled+=i,this.timeSinceEnabled>.5&&this.light.enabled&&(this.light.enabled=!1)},Explode.prototype.explode=function(){this.timeSinceEnabled=0,this.light.enabled=!0,this.mainVfx.reset(),this.mainVfx.play(),this.smokeVfx.reset(),this.smokeVfx.play(),this.derbisVfx.reset(),this.derbisVfx.play(),this.app.fire("camera:shake")};var Btcp2=pc.createScript("btcp2");Btcp2.attributes.add("Cockpit_Scene",{type:"string",default:"",title:"Cockpit Scene Name to Load"}),Btcp2.prototype.initialize=function(){this.entity.element.on("click",function(i){this.app.mouse.off("mousemove",this._onMouseMove,this),this.app.mouse.off("mousedown"),this.app.fire("off:2S"),this.app.timeScale=1,this.app.systems.rigidbody.setGravity(0,-9.8,0),this.app.root.findByName("RootBridge").enabled=!1,this.app.root.findByName("RootFlight").enabled=!1,this.app.root.findByName("BridgeSound").sound.stop("Sound1"),this.app.root.findByName("BridgeSound").sound.stop("Sound2"),this.app.root.findByName("CockpitSound").sound.play("Sound"),this.app.root.findByName("RootCockpit").findByName("cockpit").script.caution.initialize(),this.app.root.findByName("RootCockpit").findByName("Rating_Parent").script.rating.initialize(),this.app.root.findByName("RootCockpit").findByName("3").script.setMiniGame.initialize(),this.app.root.findByName("FUEL_TEXT").script.fuelInit.initialize(),this.app.root.findByName("WATER_TEXT").script.waterInit.initialize(),this.app.root.findByName("FOOD_TEXT").script.foodInit.initialize(),this.app.root.findByName("BATTERY_TEXT").script.batteryInit.initialize(),this.app.root.findByName("COLLECTOR_TEXT").script.collectorInit.initialize(),this.app.root.findByName("Cycler").script.cycle.initialize(),this.app.root.findByName("RootCockpit").enabled=!0},this)},Btcp2.prototype.update=function(i){},Btcp2.prototype.loadScene=function(i){var t=this.app.root.findByName("Root"),o=this.app.scenes.find(i);this.app.scenes.loadSceneHierarchy(o.url,function(i,o){i?console.error(i):t.destroy()})};var MovePlayer=pc.createScript("movePlayer");MovePlayer.prototype.initialize=function(){},MovePlayer.prototype.update=function(e){var t=this.entity.forward.clone();this.app.keyboard.isPressed(pc.KEY_W)&&this.entity.translateLocal(0,0,-.002),this.app.keyboard.isPressed(pc.KEY_S)&&(t.scale(-50),this.entity.rigidbody.applyForce(t)),this.app.keyboard.isPressed(pc.KEY_A)};var FirstPersonMovement=pc.createScript("firstPersonMovement");FirstPersonMovement.attributes.add("camera",{type:"entity",description:"Optional, assign a camera entity, otherwise one is created"}),FirstPersonMovement.attributes.add("power",{type:"number",default:2500,description:"Adjusts the speed of player movement"}),FirstPersonMovement.attributes.add("lookSpeed",{type:"number",default:.25,description:"Adjusts the sensitivity of looking"}),FirstPersonMovement.prototype.initialize=function(){this.force=new pc.Vec3,this.eulers=new pc.Vec3;var e=this.app;e.mouse.on("mousemove",this._onMouseMove,this),e.mouse.on("mousedown",function(){e.mouse.enablePointerLock()},this),this.entity.collision||console.error("First Person Movement script needs to have a 'collision' component"),this.entity.rigidbody&&this.entity.rigidbody.type===pc.BODYTYPE_DYNAMIC||console.error("First Person Movement script needs to have a DYNAMIC 'rigidbody' component"),void 0===localStorage.timer&&(localStorage.timer=0),this.timer=0,setInterval(function(){localStorage.setItem("timer",Number(localStorage.timer)+1)},6e4)},FirstPersonMovement.prototype.update=function(e){this.camera||this._createCamera();var t=this.force,o=this.app,s=this.camera.forward,r=this.camera.right,i=0,a=0;(o.keyboard.isPressed(pc.KEY_A)||o.keyboard.isPressed(pc.KEY_Q))&&(i-=r.x,a-=r.z),o.keyboard.isPressed(pc.KEY_D)&&(i+=r.x,a+=r.z),o.keyboard.isPressed(pc.KEY_W)&&(i+=s.x,a+=s.z),o.keyboard.isPressed(pc.KEY_S)&&(i-=s.x,a-=s.z),0!==i&&0!==a&&(t.set(i,0,a).normalize().scale(this.power),this.entity.rigidbody.applyForce(t)),this.camera.setLocalEulerAngles(this.eulers.y,this.eulers.x,0)},FirstPersonMovement.prototype._onMouseMove=function(e){(pc.Mouse.isPointerLocked()||e.buttons[0])&&(this.eulers.x-=this.lookSpeed*e.dx,this.eulers.y-=this.lookSpeed*e.dy)},FirstPersonMovement.prototype._createCamera=function(){this.camera=new pc.Entity,this.camera.setName("First Person Camera"),this.camera.addComponent("camera"),this.entity.addChild(this.camera),this.camera.translateLocal(0,.5,0)};var CreditOpener=pc.createScript("creditOpener");CreditOpener.prototype.initialize=function(){this.entity.element.on("click",function(e){this.app.root.findByName("RootMainMenu").findByName("2D Screen").enabled=!1,this.app.root.findByName("RootMainMenu").findByName("Plane").enabled=!1,this.app.root.findByName("Credits").enabled=!0},this)},CreditOpener.prototype.update=function(e){};var BackFromCredits=pc.createScript("backFromCredits");BackFromCredits.prototype.initialize=function(){this.entity.element.on("click",function(e){this.app.root.findByName("Credits").enabled=!1,this.app.root.findByName("RootMainMenu").findByName("2D Screen").enabled=!0,this.app.root.findByName("RootMainMenu").findByName("Plane").enabled=!0},this)},BackFromCredits.prototype.update=function(e){};var Death=pc.createScript("death");Death.prototype.initialize=function(){this.check=!1},Death.prototype.update=function(e){if(parseInt(this.entity.element.text)<=0&&!1===this.check){this.app.root.findByName("DAMAGE").element.text="100";var t=parseInt(this.app.root.findByName("MAT_CARBON").element.text)-this.app.root.findByName("MAT_CARBON").script.carbonInit.sendValue(),a=parseInt(this.app.root.findByName("MAT_HYDROGEN").element.text)-this.app.root.findByName("MAT_HYDROGEN").script.hydrogenInit.sendValue(),o=parseInt(this.app.root.findByName("MAT_LITHIUM").element.text)-this.app.root.findByName("MAT_LITHIUM").script.lithiumInit.sendValue(),r=parseInt(this.app.root.findByName("MAT_OXYGEN").element.text)-this.app.root.findByName("MAT_OXYGEN").script.oxygenInit.sendValue(),i=parseInt(this.app.root.findByName("MAT_URANIUM").element.text)-this.app.root.findByName("MAT_URANIUM").script.uraniumInit.sendValue();localStorage.setItem("carbon",Number(localStorage.carbon)-t),localStorage.setItem("hydrogen",Number(localStorage.hydrogen)-a),localStorage.setItem("lithium",Number(localStorage.lithium)-o),localStorage.setItem("oxygen",Number(localStorage.oxygen)-r),localStorage.setItem("uranium",Number(localStorage.uranium)-i),localStorage.setItem("storage_carbon",Number(localStorage.storage_carbon)-t),localStorage.setItem("storage_hydrogen",Number(localStorage.storage_hydrogen)-a),localStorage.setItem("storage_lithium",Number(localStorage.storage_lithium)-o),localStorage.setItem("storage_oxygen",Number(localStorage.storage_oxygen)-r),localStorage.setItem("storage_uranium",Number(localStorage.storage_uranium)-i),this.app.root.findByName("RootFlight").enabled=!1,this.app.root.findByName("FlightSound").sound.stop("Sound"),this.app.root.findByName("RootExplosion").enabled=!0,this.check=!0}};var instructions,instructionsScreen,Instructions=pc.createScript("instructions");Instructions.attributes.add("one",{type:"entity"}),Instructions.attributes.add("two",{type:"entity"}),Instructions.attributes.add("three",{type:"entity"}),Instructions.prototype.initialize=function(){instructions=this.app.root.findByName("Instructions"),instructionsScreen=this.app.root.findByName("InstructionsScreen")},Instructions.prototype.update=function(e){this.app.keyboard.wasPressed(pc.KEY_L)&&(!0===this.app.root.findByName("RootFlight").enabled?!1===this.app.root.findByName("Instructions").enabled?(this.app.timeScale=0,this.app.root.findByName("RootFlight").findByName("2D Screen").enabled=!1,this.app.root.findByName("Instructions").enabled=!0,this.app.root.findByName("InstructionsScreen").findByName("FlightInstructions").enabled=!0):(this.app.timeScale=1,this.app.root.findByName("RootFlight").findByName("2D Screen").enabled=!0,this.app.root.findByName("Instructions").enabled=!1,this.app.root.findByName("InstructionsScreen").findByName("FlightInstructions").enabled=!1):!0===this.app.root.findByName("RootBridge").enabled?!1===this.app.root.findByName("Instructions").enabled?(this.app.mouse.disablePointerLock(),this.app.timeScale=0,this.app.root.findByName("RootBridge").findByName("2D_1_Screen").enabled=!1,this.app.root.findByName("Instructions").enabled=!0,this.app.root.findByName("InstructionsScreen").findByName("BridgeInstructions").enabled=!0):(this.app.mouse.enablePointerLock(),this.app.timeScale=1,this.app.root.findByName("RootBridge").findByName("2D_1_Screen").enabled=!0,this.app.root.findByName("Instructions").enabled=!1,this.app.root.findByName("InstructionsScreen").findByName("BridgeInstructions").enabled=!1):!0===this.app.root.findByName("RootCockpit").enabled&&(!1===this.app.root.findByName("Instructions").enabled?(this.app.timeScale=0,this.app.root.findByName("RootCockpit").findByName("2D Screen").enabled=!1,this.app.root.findByName("Instructions").enabled=!0,this.app.root.findByName("InstructionsScreen").findByName("CockpitInstructions").enabled=!0,!0===this.one.enabled?(this.app.root.findByName("ForTwo").enabled=!1,this.app.root.findByName("ForThree").enabled=!1,this.app.root.findByName("ForOne").enabled=!0):!0===this.two.enabled?(this.app.root.findByName("ForThree").enabled=!1,this.app.root.findByName("ForOne").enabled=!1,this.app.root.findByName("ForTwo").enabled=!0):!0===this.three.enabled&&(this.app.root.findByName("ForOne").enabled=!1,this.app.root.findByName("ForTwo").enabled=!1,this.app.root.findByName("ForThree").enabled=!0)):(this.app.timeScale=1,this.app.root.findByName("ForOne").enabled=!1,this.app.root.findByName("ForTwo").enabled=!1,this.app.root.findByName("ForTwo").enabled=!1,this.app.root.findByName("RootCockpit").findByName("2D Screen").enabled=!0,this.app.root.findByName("Instructions").enabled=!1,this.app.root.findByName("InstructionsScreen").findByName("CockpitInstructions").enabled=!1)))};var TransitionScript=pc.createScript("transitionScript");TransitionScript.attributes.add("css",{type:"asset",assetType:"css",title:"CSS Asset"}),TransitionScript.attributes.add("html",{type:"asset",assetType:"html",title:"HTML Asset"}),TransitionScript.prototype.initialize=function(){var e=document.createElement("style");document.head.appendChild(e),e.innerHTML=this.css.resource||"",this.div=document.createElement("div"),this.div.classList.add("container"),this.div.innerHTML=this.html.resource||"",document.body.appendChild(this.div)},TransitionScript.prototype.bindEvents=function(){this.app.root.findByName("RootMainMenu").enabled=!1;var e=this;$("#nextBTN").click(function(){$(".console-container").style.display="none",$("#nextBTN").style.display="none",e.entity.enabled=!1,e.app.root.findByName("RootTimeMachine").enabled=!0}),function consoleText(e,t,n){void 0===n&&(n=["#fff"]);var i=!0,o=document.getElementById("console"),s=1,a=1,r=!1,c=document.getElementById(t);c.setAttribute("style","color:"+n[0]),window.setInterval(function(){0===s&&!1===r?(r=!0,c.innerHTML=e[0].substring(0,s),window.setTimeout(function(){var t=n.shift();n.push(t);var i=e.shift();e.push(i),a=1,c.setAttribute("style","color:"+n[0]),s+=a,r=!1},1e3)):s===e[0].length+1&&!1===r?(r=!0,window.setTimeout(function(){s+=a=-1,r=!1},1e3)):!1===r&&(c.innerHTML=e[0].substring(0,s),s+=a)},120),window.setInterval(function(){!0===i?(o.className="console-underscore hidden",i=!1):(o.className="console-underscore",i=!0)},400)}(["Welcome Commander.","The year is 2100.","An operation to travel back in time to the big bang is underway.","You have been chosen by the team to fly their spacecraft.","Equipped with a means to collect raw materials from space, you must survive the chaos of the universe.","Can you take on primordial chaos?"],"text",["rebeccapurple"])},TransitionScript.prototype.update=function(e){};pc.script.createLoadingScreen(function(e){var t,a;t=["body {","    background-color: #283538;","}","#application-splash-wrapper {","    position: absolute;","    top: 0;","    left: 0;","    height: 100%;","    width: 100%;","    background-color: #283538;","}","#application-splash {","    position: absolute;","    top: calc(50% - 28px);","    width: 264px;","    left: calc(50% - 132px);","}","#application-splash img {","    width: 100%;","}","#progress-bar-container {","    margin: 20px auto 0 auto;","    height: 2px;","    width: 100%;","    background-color: #1d292c;","}","#progress-bar {","    width: 0%;","    height: 100%;","    background-color: #f60;","}","@media (max-width: 480px) {","    #application-splash {","        width: 170px;","        left: calc(50% - 85px);","    }","}"].join("\n"),(a=document.createElement("style")).type="text/css",a.styleSheet?a.styleSheet.cssText=t:a.appendChild(document.createTextNode(t)),document.head.appendChild(a),function(){var e=document.createElement("div");e.id="application-splash-wrapper",document.body.appendChild(e);var t=document.createElement("div");t.id="application-splash",e.appendChild(t),t.style.display="none";var a=document.createElement("img");a.src="https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/images/play_text_252_white.png",t.appendChild(a),a.onload=function(){t.style.display="block"};var o=document.createElement("div");o.id="progress-bar-container",t.appendChild(o);var n=document.createElement("div");n.id="progress-bar",o.appendChild(n)}(),e.on("preload:end",function(){e.off("preload:progress")}),e.on("preload:progress",function(e){var t=document.getElementById("progress-bar");t&&(e=Math.min(1,Math.max(0,e)),t.style.width=100*e+"%")}),e.on("start",function(){var e=document.getElementById("application-splash-wrapper");e.parentElement.removeChild(e)})});pc.script.createLoadingScreen(function(e){var t,a;t=["body {","    background-color: #283538;","}","#application-splash-wrapper {","    position: absolute;","    top: 0;","    left: 0;","    height: 100%;","    width: 100%;","    background-color: #283538;","}","#application-splash {","    position: absolute;","    top: calc(50% - 28px);","    width: 264px;","    left: calc(50% - 132px);","}","#application-splash img {","    width: 100%;","}","#progress-bar-container {","    margin: 20px auto 0 auto;","    height: 2px;","    width: 100%;","    background-color: #1d292c;","}","#progress-bar {","    width: 0%;","    height: 100%;","    background-color: #f60;","}","@media (max-width: 480px) {","    #application-splash {","        width: 170px;","        left: calc(50% - 85px);","    }","}"].join("\n"),(a=document.createElement("style")).type="text/css",a.styleSheet?a.styleSheet.cssText=t:a.appendChild(document.createTextNode(t)),document.head.appendChild(a),function(){var e=document.createElement("div");e.id="application-splash-wrapper",document.body.appendChild(e);var t=document.createElement("div");t.id="application-splash",e.appendChild(t),t.style.display="none";var a=document.createElement("img");a.src="https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/images/play_text_252_white.png",t.appendChild(a),a.onload=function(){t.style.display="block"};var o=document.createElement("div");o.id="progress-bar-container",t.appendChild(o);var n=document.createElement("div");n.id="progress-bar",o.appendChild(n)}(),e.on("preload:end",function(){e.off("preload:progress")}),e.on("preload:progress",function(e){var t=document.getElementById("progress-bar");t&&(e=Math.min(1,Math.max(0,e)),t.style.width=100*e+"%")}),e.on("start",function(){var e=document.getElementById("application-splash-wrapper");e.parentElement.removeChild(e)})});