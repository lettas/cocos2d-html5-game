var cave={scene:{}};var s_HelloWorld="HelloWorld.jpg",s_CloseNormal="CloseNormal.png",s_CloseSelected="CloseSelected.png",g_resources=[{src:s_HelloWorld},{src:s_CloseNormal},{src:s_CloseSelected}];cave.scene.Title=cc.Scene.extend({onEnter:function(){this._super();var a=new cave.scene.Title.BaseLayer;this.addChild(a);a.init()}});cave.scene.Title.BaseLayer=cc.Layer.extend({init:function(){this._super();var a=cc.Director.getInstance().getWinSize();this.titleLabel=cc.LabelTTF.create("CAVE","Impact",38);this.titleLabel.setPosition(cc.p(a.width/2,a.height-40));this.addChild(this.titleLabel,5)}});cave.scene.Game=cc.Scene.extend({onEnter:function(){this._super();var a=new cave.scene.Game.BaseLayer;this.addChild(a);a.init()}});
cave.scene.Game.BaseLayer=cc.Layer.extend({init:function(){this._super();var a=cc.Director.getInstance().getWinSize();this.player=cave.scene.Game.Player.create();this.player.setPosition(cc.p(a.width/4,a.height/2));this.addChild(this.player,10);this.setTouchEnabled(!0)},onEnterTransitionDidFinish:function(){this.player.scheduleUpdate()},onTouchesBegan:function(a,b){this.player.goingUp();return!0},onTouchesEnded:function(a,b){this.player.goingDown()}});
cave.scene.Game.Player=cc.Node.extend({G:0.1,MAX_SPEED:3,init:function(){this._super();this.dot=cc.DrawNode.create();this.dot.drawDot(cc.p(0,0),6,cc.c4FFromccc3B(cc.c3(255,0,0)));this.addChild(this.dot);this.speed=cc.p(0,0);this.goingDown();return!0},update:function(){this.speed=cc.pAdd(this.speed,this.gravity);this.speed=this._ccpGrip(this.speed,this.MAX_SPEED);var a=this.getPosition();this.setPosition(cc.pAdd(a,this.speed))},goingUp:function(){this.gravity=cc.p(0,this.G)},goingDown:function(){this.gravity=
cc.p(0,-this.G)},_ccpGrip:function(a,b){return cc.pCompOp(a,function(a){return a>=b?b:a<=-b?-b:a})}});cave.scene.Game.Player.create=function(){var a=new cave.scene.Game.Player;return a&&a.init()?a:null};var cocos2dApp=cc.Application.extend({config:document.ccConfig,ctor:function(a){this._super();this.startScene=a;cc.COCOS2D_DEBUG=this.config.COCOS2D_DEBUG;cc.initDebugSetting();cc.setup(this.config.tag);cc.AppController.shareAppController().didFinishLaunchingWithOptions()},applicationDidFinishLaunching:function(){var a=cc.Director.getInstance();cc.EGLView.getInstance()._adjustSizeToBrowser();var b=cc.EGLView.getInstance().getFrameSize(),f=cc.size(480,800),d=cc.size(480,800),c=[],e=[];c.push("res");
cc.FileUtils.getInstance().setSearchPaths(c);c=cc.Application.getInstance().getTargetPlatform();c==cc.TARGET_PLATFORM.MOBILE_BROWSER?e.push("HD"):c==cc.TARGET_PLATFORM.PC_BROWSER&&(800<=b.height?e.push("HD"):(f=cc.size(320,480),d=cc.size(320,480),e.push("Normal")));cc.FileUtils.getInstance().setSearchResolutionsOrder(e);a.setContentScaleFactor(f.width/d.width);cc.EGLView.getInstance().setDesignResolutionSize(d.width,d.height,cc.RESOLUTION_POLICY.SHOW_ALL);cc.EGLView.getInstance().resizeWithBrowserSize(!0);
a.setDisplayStats(this.config.showFPS);a.setAnimationInterval(1/this.config.frameRate);cc.LoaderScene.preload(g_resources,function(){a.replaceScene(new this.startScene)},this);return!0}}),myApp=new cocos2dApp(cave.scene.Game);