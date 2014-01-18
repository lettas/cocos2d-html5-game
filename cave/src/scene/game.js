cave.scene.Game = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new cave.scene.Game.BaseLayer();
        this.addChild(layer);
        layer.init();
    }
});

cave.scene.Game.BaseLayer = cc.Layer.extend({
    init: function() {
        this._super();
        this.setMouseEnabled(true);
        this.setTouchEnabled(true);

        var size = cc.Director.getInstance().getWinSize();

        this.player = cave.scene.Game.Player.create();
        this.player.setPosition(cc.p(size.width / 4, size.height / 2));
        this.addChild(this.player, 10);
        this.player.scheduleUpdate();
    },

    onMouseDown: function(event) {
        this.player.goingUp();
    },

    onMouseUp: function(event) {
        this.player.goingDown();
    },

    onTouchBegan: function(touch, event) {
        this.player.goingUp();
    },

    onTouchEnded: function(touch, event) {
        this.player.goingDown();
    }
});

cave.scene.Game.Player = cc.Node.extend({
    G: 0.1,
    MAX_SPEED: 3.0,

    init: function() {
        this._super();

        this.dot = cc.DrawNode.create();
        this.dot.drawDot(cc.p(0, 0), 6, cc.c4FFromccc3B(cc.c3(255, 0, 0)));
        this.addChild(this.dot);

        this.speed = cc.p(0, 0);
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

