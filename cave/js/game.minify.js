var cave={scene:{}};var s_HelloWorld="HelloWorld.jpg",s_CloseNormal="CloseNormal.png",s_CloseSelected="CloseSelected.png",s_Dot="dot.png",g_resources=[{src:s_HelloWorld},{src:s_CloseNormal},{src:s_CloseSelected},{src:s_Dot}];cave.scene.Title=cc.Scene.extend({onEnter:function(){this._super();var a=new cave.scene.Title.BaseLayer;this.addChild(a);a.init()}});cave.scene.Title.BaseLayer=cc.Layer.extend({init:function(){this._super();var a=cc.Director.getInstance().getWinSize();this.titleLabel=cc.LabelTTF.create("CAVE","Impact",38);this.titleLabel.setPosition(cc.p(a.width/2,a.height-40));this.addChild(this.titleLabel,5)}});cave.scene.Game=cc.Scene.extend({onEnter:function(){this._super();this.layer=new cave.scene.Game.BaseLayer;this.addChild(this.layer);this.layer.init()}});
cave.scene.Game.BaseLayer=cc.Layer.extend({init:function(){this._super();var a=cc.Director.getInstance().getWinSize();this.player=cave.scene.Game.Player.create();this.player.setPosition(cc.p(a.width/4,a.height/2));this.addChild(this.player,10);this.backgroundLayer=cc.Layer.create();this.addChild(this.backgroundLayer);this.tail=cc.MotionStreak.create(2,1,18,this.player.color,s_Dot);this.tail.setPosition(this.player.getPosition());this.backgroundLayer.addChild(this.tail);this.setTouchEnabled(!0);this.setTouchMode(cc.TOUCH_ONE_BY_ONE)},
onEnterTransitionDidFinish:function(){cc.Director.getInstance().getWinSize();this.player.scheduleUpdate();this.scheduleUpdate();var a=cc.MoveBy.create(1,cc.p(-60,0));this.backgroundLayer.runAction(cc.RepeatForever.create(a))},update:function(){var a=cc.pSub(this.player.getPosition(),this.backgroundLayer.getPosition());this.tail.setPosition(a)},onTouchBegan:function(a,b){this.player.goingUp();return!0},onTouchEnded:function(a,b){this.player.goingDown()}});
cave.scene.Game.Player=cc.Node.extend({G:0.2,MAX_SPEED:7,init:function(){this._super();this.color=cc.c4(0,255,204,255);this.dot=cc.DrawNode.create();this.dot.drawDot(cc.p(0,0),12,cc.c4FFromccc3B(this.color));this.addChild(this.dot);this.speed=cc.p(0,5);this.goingDown();return!0},update:function(){this.speed=cc.pAdd(this.speed,this.gravity);this.speed=this._ccpGrip(this.speed,this.MAX_SPEED);var a=this.getPosition();this.setPosition(cc.pAdd(a,this.speed))},goingUp:function(){this.gravity=cc.p(0,this.G)},
goingDown:function(){this.gravity=cc.p(0,-this.G)},_ccpGrip:function(a,b){return cc.pCompOp(a,function(a){return a>=b?b:a<=-b?-b:a})}});cave.scene.Game.Player.create=function(){var a=new cave.scene.Game.Player;return a&&a.init()?a:null};var cocos2dApp=cc.Application.extend({config:document.ccConfig,ctor:function(a){this._super();this.startScene=a;cc.COCOS2D_DEBUG=this.config.COCOS2D_DEBUG;cc.initDebugSetting();cc.setup(this.config.tag);cc.AppController.shareAppController().didFinishLaunchingWithOptions()},applicationDidFinishLaunching:function(){var a=cc.Director.getInstance();cc.EGLView.getInstance()._adjustSizeToBrowser();var b=cc.EGLView.getInstance().getFrameSize(),f=cc.size(640,960),e=cc.size(640,960),c=[],d=[];c.push("res");
cc.FileUtils.getInstance().setSearchPaths(c);c=cc.Application.getInstance().getTargetPlatform();c==cc.TARGET_PLATFORM.MOBILE_BROWSER?d.push("HD"):c==cc.TARGET_PLATFORM.PC_BROWSER&&(800<=b.height?d.push("HD"):(f=cc.size(320,480),d.push("Normal")));cc.FileUtils.getInstance().setSearchResolutionsOrder(d);a.setContentScaleFactor(f.width/e.width);cc.EGLView.getInstance().setDesignResolutionSize(e.width,e.height,cc.RESOLUTION_POLICY.SHOW_ALL);cc.EGLView.getInstance().resizeWithBrowserSize(!0);a.setDisplayStats(this.config.showFPS);
a.setAnimationInterval(1/this.config.frameRate);cc.LoaderScene.preload(g_resources,function(){a.replaceScene(new this.startScene)},this);return!0}}),myApp=new cocos2dApp(cave.scene.Game);