var cave={scene:{}};var s_HelloWorld="HelloWorld.jpg",s_CloseNormal="CloseNormal.png",s_CloseSelected="CloseSelected.png",s_Dot="dot.png",g_resources=[{src:s_HelloWorld},{src:s_CloseNormal},{src:s_CloseSelected},{src:s_Dot}];cave.scene.Title=cc.Scene.extend({onEnter:function(){this._super();var a=new cave.scene.Title.BaseLayer;this.addChild(a);a.init()}});cave.scene.Title.BaseLayer=cc.Layer.extend({init:function(){this._super();var a=cc.Director.getInstance().getWinSize();this.titleLabel=cc.LabelTTF.create("CAVE","Impact",38);this.titleLabel.setPosition(cc.p(a.width/2,a.height-40));this.addChild(this.titleLabel,5)}});cave.scene.Game=cc.Scene.extend({onEnter:function(){this._super();this.layer=new cave.scene.Game.BaseLayer;this.addChild(this.layer);this.layer.init()}});
cave.scene.Game.BaseLayer=cc.Layer.extend({SPEED:65,RESIDUAL_IMAGE_DURATION:100,init:function(){this._super();var a=cc.Director.getInstance().getWinSize();this.player=cave.scene.Game.Player.create();this.player.setPosition(cc.p(a.width/3,a.height/2));this.addChild(this.player);this.tail=cave.scene.Game.Player.ResidualImage.create(this.player,this.RESIDUAL_IMAGE_DURATION);this.addChild(this.tail);this.obstacle=new cave.scene.Game.Obstacle;this.obstacle.init();for(var b=0;b<=a.width/this.obstacle.WIDTH;b++)this.obstacle.generateNext();
this.addChild(this.obstacle);this.setTouchEnabled(!0);this.setTouchMode(cc.TOUCH_ONE_BY_ONE)},onEnterTransitionDidFinish:function(){this.player.scheduleUpdate();this.tail.scheduleUpdate();this.obstacle.scheduleUpdate();this.scheduleUpdate();var a=cc.MoveBy.create(1,cc.p(this.SPEED,0));this.player.runAction(cc.RepeatForever.create(a));a=cc.MoveBy.create(1,cc.p(-this.SPEED,0));this.runAction(cc.RepeatForever.create(a))},update:function(){var a=cc.Director.getInstance().getWinSize(),b=Math.abs(this.getPositionX()),
a=this.obstacle.getMostDistantWallX()-a.width;b>a&&this.obstacle.generateNext()},onTouchBegan:function(a,b){this.player.goingUp();return!0},onTouchEnded:function(a,b){this.player.goingDown()}});
cave.scene.Game.Player=cc.Node.extend({G:0.2,INITIAL_SPEED:5,MAX_SPEED:7,DOT_SIZE:12,DEFAULT_COLOR:cc.c4(0,255,204,255),init:function(){this._super();this.color=this.DEFAULT_COLOR;this.size=this.DOT_SIZE;this.dot=cc.DrawNode.create();this.dot.drawDot(cc.p(0,0),this.size,cc.c4FFromccc3B(this.color));this.addChild(this.dot);this.speed=cc.p(0,this.INITIAL_SPEED);this.goingDown();return!0},update:function(){this.speed=cc.pAdd(this.speed,this.gravity);this.speed=this._ccpGrip(this.speed,this.MAX_SPEED);
var a=this.getPosition();this.setPosition(cc.pAdd(a,this.speed))},goingUp:function(){this.gravity=cc.p(0,this.G)},goingDown:function(){this.gravity=cc.p(0,-this.G)},_ccpGrip:function(a,b){return cc.pCompOp(a,function(a){return a>=b?b:a<=-b?-b:a})}});cave.scene.Game.Player.create=function(){var a=new cave.scene.Game.Player;return a&&a.init()?a:null};
cave.scene.Game.Player.ResidualImage=cc.Node.extend({initWithPlayer:function(a,b){this.player=a;this.duration=b;this.points=[];this.effect=cc.DrawNode.create();this.addChild(this.effect);return!0},update:function(){var a=this.player.getPosition();this.points.push(cc.p(a.x,a.y));this.points.length>this.duration&&this.points.shift();this._redraw()},_redraw:function(){var a=0.6*this.player.size,b=this.player.color,b=cc.c4(b.r,b.g,b.b,b.a),c=b.a/this.duration;this.effect.clear();if(2<=this.points.length)for(var d=
this.points.length-1;0<d;d--)this.effect.drawSegment(this.points[d-1],this.points[d],a,cc.c4FFromccc4B(b)),b.a>=c&&(b.a-=c)}});cave.scene.Game.Player.ResidualImage.create=function(a,b){var c=new cave.scene.Game.Player.ResidualImage;return c&&c.initWithPlayer(a,b)?c:null};
cave.scene.Game.Obstacle=cc.Node.extend({WIDTH:30,DEFAULT_COLOR:cc.c4(255,204,0,255),init:function(){this.upperWalls=[];this.lowerWalls=[];this.floatingWalls=[];this.count=0;this.effect=cc.DrawNode.create();this.addChild(this.effect);this.maxWallsCount=cc.Director.getInstance().getWinSize().width/this.WIDTH*2},generateNext:function(){var a=cc.Director.getInstance().getWinSize(),b=this.WIDTH,c=this.WIDTH*this.count,d=50+this.count/3+100*Math.random();this.upperWalls.push([c,a.height-d,b,d]);this.upperWalls.length>=
this.maxWallsCount&&this.upperWalls.shift();a=50+this.count/3+100*Math.random();this.lowerWalls.push([c,0,b,a]);this.lowerWalls.length>=this.maxWallsCount&&this.lowerWalls.shift();this.count++;this.generated=!0},update:function(){this.generated&&(this.effect.clear(),this._redraw(),this.generated=!1)},getMostDistantWallX:function(){return this.count*this.WIDTH},_redraw:function(){var a=cc.c4FFromccc4B(this.DEFAULT_COLOR);this.upperWalls.forEach(function(b){b=this._convertToVertex(b[0],b[1],b[2],b[3]);
this.effect.drawPoly(b,a,0,a)},this);this.lowerWalls.forEach(function(b){b=this._convertToVertex(b[0],b[1],b[2],b[3]);this.effect.drawPoly(b,a,0,a)},this)},_convertToVertex:function(a,b,c,d){return[cc.p(a,b),cc.p(a,b+d),cc.p(a+c,b+d),cc.p(a+c,b)]}});var cocos2dApp=cc.Application.extend({config:document.ccConfig,ctor:function(a){this._super();this.startScene=a;cc.COCOS2D_DEBUG=this.config.COCOS2D_DEBUG;cc.initDebugSetting();cc.setup(this.config.tag);cc.AppController.shareAppController().didFinishLaunchingWithOptions()},applicationDidFinishLaunching:function(){var a=cc.Director.getInstance();cc.EGLView.getInstance()._adjustSizeToBrowser();var b=cc.EGLView.getInstance().getFrameSize(),c=cc.size(640,960),d=cc.size(640,960),e=[],f=[];e.push("res");
cc.FileUtils.getInstance().setSearchPaths(e);e=cc.Application.getInstance().getTargetPlatform();e==cc.TARGET_PLATFORM.MOBILE_BROWSER?f.push("HD"):e==cc.TARGET_PLATFORM.PC_BROWSER&&(800<=b.height?f.push("HD"):(c=cc.size(320,480),f.push("Normal")));cc.FileUtils.getInstance().setSearchResolutionsOrder(f);a.setContentScaleFactor(c.width/d.width);cc.EGLView.getInstance().setDesignResolutionSize(d.width,d.height,cc.RESOLUTION_POLICY.SHOW_ALL);cc.EGLView.getInstance().resizeWithBrowserSize(!0);a.setDisplayStats(this.config.showFPS);
a.setAnimationInterval(1/this.config.frameRate);cc.LoaderScene.preload(g_resources,function(){a.replaceScene(new this.startScene)},this);return!0}}),myApp=new cocos2dApp(cave.scene.Game);