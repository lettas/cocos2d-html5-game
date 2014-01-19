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

        this.tail = new cave.scene.Game.Player.ResidualImage();
        this.tail.initWithPlayer(this.player, 100);
        this.addChild(this.tail);

        this.setTouchEnabled(true);
        this.setTouchMode(cc.TOUCH_ONE_BY_ONE);
    },

    onEnterTransitionDidFinish: function() {
        this.player.scheduleUpdate();
        this.tail.scheduleUpdate();

        var playerAction = cc.MoveBy.create(1, cc.p(60, 0));
        this.player.runAction(cc.RepeatForever.create(playerAction));

        var backAction = cc.MoveBy.create(1, cc.p(-60, 0));
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
    MAX_SPEED: 7.0,

    init: function() {
        this._super();

        this.color = cc.c4(0x00, 0xFF, 0xCC, 0xFF);
        this.size = 12;
        this.dot = cc.DrawNode.create();
        this.dot.drawDot(cc.p(0, 0), this.size, cc.c4FFromccc3B(this.color));
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

cave.scene.Game.Player.ResidualImage = cc.Node.extend({
    initWithPlayer: function(player, duration) {
        this.player = player;
        this.duration = duration;
        this.points = [];
        this.effect = cc.DrawNode.create();
        this.addChild(this.effect);
    },

    update: function() {
        var p = this.player.getPosition();
        this.points.push(cc.p(p.x, p.y));
        if (this.points.length > this.duration) {
            this.points.shift();
        }

        this.effect.clear();
        if (this.points.length >= 2) {
            var c = this.player.color;
            var color = cc.c4(c.r, c.g, c.b, c.a);
            var alphaAttenuation = color.a * 1.0 / this.duration;
            var radius = this.player.size * 0.6;
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

