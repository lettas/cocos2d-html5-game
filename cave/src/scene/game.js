cave.scene.Game = cc.Scene.extend({
    onEnter: function () {
        this._super();
        this.layer = new cave.scene.Game.BaseLayer();
        this.addChild(this.layer);
        this.layer.init();
    }
});

cave.scene.Game.BaseLayer = cc.Layer.extend({
    SPEED: 65,
    RESIDUAL_IMAGE_DURATION: 100,

    init: function() {
        this._super();

        var size = cc.Director.getInstance().getWinSize();

        this.player = cave.scene.Game.Player.create();
        this.player.setPosition(cc.p(size.width / 3, size.height / 2));
        this.addChild(this.player);

        this.tail = cave.scene.Game.Player.ResidualImage.create(this.player, this.RESIDUAL_IMAGE_DURATION);
        this.addChild(this.tail);

        this.setTouchEnabled(true);
        this.setTouchMode(cc.TOUCH_ONE_BY_ONE);
    },

    onEnterTransitionDidFinish: function() {
        this.player.scheduleUpdate();
        this.tail.scheduleUpdate();

        var playerAction = cc.MoveBy.create(1, cc.p(this.SPEED, 0));
        this.player.runAction(cc.RepeatForever.create(playerAction));

        var backAction = cc.MoveBy.create(1, cc.p(-this.SPEED, 0));
        this.runAction(cc.RepeatForever.create(backAction));
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
    INITIAL_SPEED: 5.0,
    MAX_SPEED: 7.0, // px / frame
    DOT_SIZE: 12,
    DEFAULT_COLOR: cc.c4(0x00, 0xFF, 0xCC, 0xFF),

    init: function() {
        this._super();

        this.color = this.DEFAULT_COLOR;
        this.size = this.DOT_SIZE;
        this.dot = cc.DrawNode.create();
        this.dot.drawDot(cc.p(0, 0), this.size, cc.c4FFromccc3B(this.color));
        this.addChild(this.dot);

        this.speed = cc.p(0, this.INITIAL_SPEED);
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

cave.scene.Game.Player.ResidualImage = cc.Node.extend({
    initWithPlayer: function(player, duration) {
        this.player = player;
        this.duration = duration;
        this.points = [];
        this.effect = cc.DrawNode.create();
        this.addChild(this.effect);
        return true;
    },

    update: function() {
        var p = this.player.getPosition();
        this.points.push(cc.p(p.x, p.y));
        if (this.points.length > this.duration) {
            this.points.shift();
        }
        this._redraw();
    },

    _redraw: function() {
        var radius = this.player.size * 0.6;
        var c = this.player.color;
        var color = cc.c4(c.r, c.g, c.b, c.a);
        var alphaAttenuation = color.a / this.duration;

        this.effect.clear();
        if (this.points.length >= 2) {
            for (var i = this.points.length - 1; i > 0; i--) {
                var from = this.points[i - 1];
                var to = this.points[i];
                this.effect.drawSegment(from, to, radius, cc.c4FFromccc4B(color));
                if (color.a >= alphaAttenuation) {
                    color.a -= alphaAttenuation;
                }
            }
        }
    }
});

cave.scene.Game.Player.ResidualImage.create = function(player, dulation) {
    var instance = new cave.scene.Game.Player.ResidualImage();
    return instance && instance.initWithPlayer(player, dulation) ? instance : null;
}

