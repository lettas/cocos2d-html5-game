cave.scene.Game = cc.Scene.extend({
    onEnter: function () {
        this._super();
        this.layer = new cave.scene.Game.BaseLayer();
        this.addChild(this.layer);
        this.layer.init();
    }
});

cave.scene.Game.BaseLayer = cc.Layer.extend({
    init: function() {
        this._super();

        var size = cc.Director.getInstance().getWinSize();

        this.player = cave.scene.Game.Player.create();
        this.player.setPosition(cc.p(size.width / 4, size.height / 2));
        this.addChild(this.player, 10);

        this.backgroundLayer = cc.Layer.create();
        this.addChild(this.backgroundLayer);

        this.tail = cc.MotionStreak.create(2.0, 1, 18, this.player.color, s_Dot);
        this.tail.setPosition(this.player.getPosition());
        this.backgroundLayer.addChild(this.tail);

        this.setTouchEnabled(true);
        this.setTouchMode(cc.TOUCH_ONE_BY_ONE);

    },

    onEnterTransitionDidFinish: function() {
        var size = cc.Director.getInstance().getWinSize();
        this.player.scheduleUpdate();
        this.scheduleUpdate();

        var moveAction = cc.MoveBy.create(1, cc.p(-60, 0));
        this.backgroundLayer.runAction(cc.RepeatForever.create(moveAction));
    },

    update: function() {
        var playerTailPosition = cc.pSub(this.player.getPosition(), this.backgroundLayer.getPosition());
        this.tail.setPosition(playerTailPosition);
    },

    onTouchBegan: function(touch, event) {
        this.player.goingUp();
        return true;
    },

    onTouchEnded: function(touch, event) {
        this.player.goingDown();
    }
});

cave.scene.Game.Player = cc.Node.extend({
    G: 0.2,
    MAX_SPEED: 7.0,

    init: function() {
        this._super();

        this.color = cc.c4(0x00, 0xFF, 0xCC, 0xFF);
        this.dot = cc.DrawNode.create();
        this.dot.drawDot(cc.p(0, 0), 12, cc.c4FFromccc3B(this.color));
        this.addChild(this.dot);

        this.speed = cc.p(0, 5);
        this.goingDown();
        return true;
    },

    update: function() {
        this.speed = cc.pAdd(this.speed, this.gravity);
        this.speed = this._ccpGrip(this.speed, this.MAX_SPEED);

        var p = this.getPosition();
        this.setPosition(cc.pAdd(p, this.speed));
    },

    goingUp: function() {
        this.gravity = cc.p(0, this.G);
    },

    goingDown: function() {
        this.gravity = cc.p(0, -this.G);
    },

    /*
     * cc.pのオレオレ拡張
     * xとyの値を(+-)maxにギュッと収める
     */
    _ccpGrip: function(p, max) {
        return cc.pCompOp(p, function(n) {
            if (n >= max) {
                return max;
            }
            else if (n <= -max) {
                return -max;
            }
            return n;
        });
    }
});

cave.scene.Game.Player.create = function() {
    var player = new cave.scene.Game.Player();
    return player && player.init() ? player : null;
}

