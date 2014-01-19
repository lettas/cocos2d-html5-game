var cave={scene:{}};var s_HelloWorld="HelloWorld.jpg",s_CloseNormal="CloseNormal.png",s_CloseSelected="CloseSelected.png",s_Dot="dot.png",g_resources=[{src:s_HelloWorld},{src:s_CloseNormal},{src:s_CloseSelected},{src:s_Dot}];cave.scene.Title=cc.Scene.extend({onEnter:function(){this._super();var a=new cave.scene.Title.BaseLayer;this.addChild(a);a.init()}});cave.scene.Title.BaseLayer=cc.Layer.extend({init:function(){this._super();var a=cc.Director.getInstance().getWinSize();this.titleLabel=cc.LabelTTF.create("CAVE","Impact",38);this.titleLabel.setPosition(cc.p(a.width/2,a.height-40));this.addChild(this.titleLabel,5)}});cave.scene.Game=cc.Scene.extend({onEnter:function(){this._super();this.layer=new cave.scene.Game.BaseLayer;this.addChild(this.layer);this.layer.init()}});
cave.scene.Game.BaseLayer=cc.Layer.extend({SPEED:65,RESIDUAL_IMAGE_DURATION:100,init:function(){this._super();var a=cc.Director.getInstance().getWinSize();this.gameLayer=cc.Layer.create();this.addChild(this.gameLayer,0);this.player=cave.scene.Game.Player.create();this.player.setPosition(cc.p(a.width/3,a.height/2));this.gameLayer.addChild(this.player);this.tail=cave.scene.Game.Player.ResidualImage.create(this.player,this.RESIDUAL_IMAGE_DURATION);this.gameLayer.addChild(this.tail);this.obstacle=new cave.scene.Game.Obstacle;
this.obstacle.init();for(var b=0;b<=a.width/this.obstacle.WIDTH;b++)this.obstacle.generateNext();this.gameLayer.addChild(this.obstacle);this.hudLayer=cc.Layer.create();this.addChild(this.hudLayer,10);b=cc.size(a.width-20,38);this.scoreLabel=cc.LabelTTF.create("0","Impact",38,b,cc.TEXT_ALIGNMENT_RIGHT);this.scoreLabel.setPosition(a.width/2,a.height-b.height/2);this.hudLayer.addChild(this.scoreLabel);this.setTouchEnabled(!0);this.setTouchMode(cc.TOUCH_ONE_BY_ONE)},onEnterTransitionDidFinish:function(){this.player.scheduleUpdate();
this.tail.scheduleUpdate();this.obstacle.scheduleUpdate();this.scheduleUpdate();var a=cc.MoveBy.create(1,cc.p(this.SPEED,0));this.player.runAction(cc.RepeatForever.create(a));a=cc.MoveBy.create(1,cc.p(-this.SPEED,0));this.gameLayer.runAction(cc.RepeatForever.create(a))},update:function(){var a=cc.Director.getInstance().getWinSize(),b=Math.abs(this.gameLayer.getPositionX()),a=this.obstacle.getMostDistantWallX()-a.width;b>a&&this.obstacle.generateNext();this.scoreLabel.setString(this.getScore())},playGameOverScene:function(){this._stopAnimations()},
getScore:function(){return Math.floor(Math.abs(this.gameLayer.getPositionX()))},_stopAnimations:function(){this.gameLayer.stopAllActions();this.player.stopAllActions();this.unscheduleUpdate();this.player.unscheduleUpdate()},onTouchBegan:function(a,b){this.player.goingUp();return!0},onTouchEnded:function(a,b){this.player.goingDown()}});
cave.scene.Game.Player=cc.Node.extend({G:0.1,INITIAL_SPEED:2.5,MAX_SPEED:3.5,DOT_SIZE:6,DEFAULT_COLOR:cc.c4(0,255,204,255),init:function(){this._super();this.color=this.DEFAULT_COLOR;this.size=this.DOT_SIZE;this.dot=cc.DrawNode.create();this.dot.drawDot(cc.p(0,0),this.size,cc.c4FFromccc3B(this.color));this.addChild(this.dot);this.speed=cc.p(0,this.INITIAL_SPEED);this.goingDown();return!0},update:function(){this.speed=cc.pAdd(this.speed,this.gravity);this.speed=this._ccpGrip(this.speed,this.MAX_SPEED);
var a=this.getPosition();this.setPosition(cc.pAdd(a,this.speed))},goingUp:function(){this.gravity=cc.p(0,this.G)},goingDown:function(){this.gravity=cc.p(0,-this.G)},_ccpGrip:function(a,b){return cc.pCompOp(a,function(a){return a>=b?b:a<=-b?-b:a})},collisionWith:function(a){var b=this.getPosition(),c=cc.p(a.x,a.y);a=cc.p(a.x+a.width,a.y+a.height);c=cc.pClamp(b,c,a);return cc.pDistance(b,c)<this.size}});cave.scene.Game.Player.create=function(){var a=new cave.scene.Game.Player;return a&&a.init()?a:null};
cave.scene.Game.Player.ResidualImage=cc.Node.extend({initWithPlayer:function(a,b){this.player=a;this.duration=b;this.points=[];this.effect=cc.DrawNode.create();this.addChild(this.effect);return!0},update:function(){var a=this.player.getPosition();this.points.push(cc.p(a.x,a.y));this.points.length>this.duration&&this.points.shift();this._redraw()},_redraw:function(){var a=0.6*this.player.size,b=this.player.color,b=cc.c4(b.r,b.g,b.b,b.a),c=b.a/this.duration;this.effect.clear();if(2<=this.points.length)for(var d=
this.points.length-1;0<d;d--)this.effect.drawSegment(this.points[d-1],this.points[d],a,cc.c4FFromccc4B(b)),b.a>=c&&(b.a-=c)}});cave.scene.Game.Player.ResidualImage.create=function(a,b){var c=new cave.scene.Game.Player.ResidualImage;return c&&c.initWithPlayer(a,b)?c:null};
cave.scene.Game.Obstacle=cc.Node.extend({DEFAULT_COLOR:cc.c4(255,204,0,255),WIDTH:20,BUFFER:15,AMPLITUDE:35,init:function(){this.upperWalls=[];this.lowerWalls=[];this.floatingWalls=[];this.floatingWallFrequency=this.count=0;this.effect=cc.DrawNode.create();this.addChild(this.effect);var a=cc.Director.getInstance().getWinSize();this.maxWallsCount=a.width/this.WIDTH+2;this.maxWallHeight=2*(a.height-this.BUFFER)/5},generateNext:function(){cc.Director.getInstance().getWinSize();var a=this._generateUpperWall();
this.upperWalls.push(a);this.upperWalls.length>=this.maxWallsCount&&this.upperWalls.shift();a=this._generateLowerWall();this.lowerWalls.push(a);this.lowerWalls.length>=this.maxWallsCount&&this.lowerWalls.shift();1E3*Math.random()<this.floatingWallFrequency?(a=this._generateFloatingWall(),this.floatingWalls.push(a),this.floatingWalls.length>=this.maxWallsCount&&this.floatingWalls.shift(),this.floatingWallFrequency=0):(this.floatingWallFrequency+=this.count,this.floatingWallFrequency=Math.min(this.floatingWallFrequency,
900));this.count++;this.generated=!0},_randomWallHeight:function(a){a=Math.min(a,this.maxWallHeight-this.AMPLITUDE);return Math.floor(a+Math.random()*this.AMPLITUDE)},_generateUpperWall:function(){var a=cc.Director.getInstance().getWinSize(),b=Math.floor(this.WIDTH),c=Math.floor(this._randomWallHeight(25+this.count));return cc.rect(Math.floor(b*this.count),Math.floor(a.height-c),b,c)},_generateLowerWall:function(){var a=Math.floor(this.WIDTH),b=Math.floor(this._randomWallHeight(25+this.count));return cc.rect(Math.floor(a*
this.count),Math.floor(0),a,b)},_generateFloatingWall:function(){var a=cc.Director.getInstance().getWinSize(),b=Math.floor(this.WIDTH),c=Math.floor(this._randomWallHeight(35)),d=Math.floor(b*this.count),a=Math.floor(a.height/3+Math.random()*this.maxWallHeight);return cc.rect(d,a,b,c)},update:function(){this.generated&&(this.effect.clear(),this._redraw(),this.generated=!1)},getMostDistantWallX:function(){return this.count*this.WIDTH},_redraw:function(){var a=cc.c4FFromccc4B(this.DEFAULT_COLOR);this.allWalls().forEach(function(b){b=
this._convertToVertex(b);this.effect.drawPoly(b,a,0,a)},this)},allWalls:function(){return[].concat(this.upperWalls,this.lowerWalls,this.floatingWalls)},_convertToVertex:function(a){return[cc.p(a.x,a.y),cc.p(a.x,a.y+a.height),cc.p(a.x+a.width,a.y+a.height),cc.p(a.x+a.width,a.y)]}});var cocos2dApp=cc.Application.extend({config:document.ccConfig,ctor:function(a){this._super();this.startScene=a;cc.COCOS2D_DEBUG=this.config.COCOS2D_DEBUG;cc.initDebugSetting();cc.setup(this.config.tag);cc.AppController.shareAppController().didFinishLaunchingWithOptions()},applicationDidFinishLaunching:function(){var a=cc.Director.getInstance();cc.EGLView.getInstance()._adjustSizeToBrowser();var b=cc.EGLView.getInstance().getFrameSize(),c=cc.size(320,400),d=cc.size(320,400),e=[],f=[];e.push("res");
cc.FileUtils.getInstance().setSearchPaths(e);e=cc.Application.getInstance().getTargetPlatform();e==cc.TARGET_PLATFORM.MOBILE_BROWSER?f.push("HD"):e==cc.TARGET_PLATFORM.PC_BROWSER&&(800<=b.height?f.push("HD"):(c=cc.size(320,480),f.push("Normal")));cc.FileUtils.getInstance().setSearchResolutionsOrder(f);a.setContentScaleFactor(c.width/d.width);cc.EGLView.getInstance().setDesignResolutionSize(d.width,d.height,cc.RESOLUTION_POLICY.SHOW_ALL);cc.EGLView.getInstance().resizeWithBrowserSize(!0);a.setDisplayStats(this.config.showFPS);
a.setAnimationInterval(1/this.config.frameRate);cc.LoaderScene.preload(g_resources,function(){a.replaceScene(new this.startScene)},this);return!0}}),myApp=new cocos2dApp(cave.scene.Game);