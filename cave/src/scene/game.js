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

        this.gameLayer = cc.Layer.create();
        this.addChild(this.gameLayer, 0);

        this.player = cave.scene.Game.Player.create();
        this.player.setPosition(cc.p(size.width / 3, size.height / 2));
        this.gameLayer.addChild(this.player);

        this.tail = cave.scene.Game.Player.ResidualImage.create(this.player, this.RESIDUAL_IMAGE_DURATION);
        this.gameLayer.addChild(this.tail);

        this.obstacle = new cave.scene.Game.Obstacle();
        this.obstacle.init();
        for (var i = 0; i <= size.width / this.obstacle.WIDTH; i++) {
            this.obstacle.generateNext();
        }
        this.gameLayer.addChild(this.obstacle);

        this.hudLayer = cc.Layer.create();
        this.addChild(this.hudLayer, 10);

        var scoreLabelFontSize = 72;
        var scoreLabelSize = cc.size(size.width - 20, scoreLabelFontSize);
        this.scoreLabel = cc.LabelTTF.create("0", cave.config.LABEL_FONT, scoreLabelFontSize, scoreLabelSize, cc.TEXT_ALIGNMENT_RIGHT);
        this.scoreLabel.setPosition(size.width / 2, size.height - scoreLabelSize.height / 2);
        this.hudLayer.addChild(this.scoreLabel);

        var highScoreLabelFontSize = 24;
        var highScoreLabelSize = cc.size(size.width - 20, highScoreLabelFontSize + 5);
        var highScoreLabelText = "HighScore: " + this.getHighScore();
        this.highScoreLabel = cc.LabelTTF.create(highScoreLabelText, cave.config.LABEL_FONT, highScoreLabelFontSize, highScoreLabelSize, cc.TEXT_ALIGNMENT_RIGHT);
        this.highScoreLabel.setPosition(size.width / 2, highScoreLabelSize.height / 2);
        this.hudLayer.addChild(this.highScoreLabel);

        this.setTouchEnabled(true);
        this.setTouchMode(cc.TOUCH_ONE_BY_ONE);
    },

    onEnterTransitionDidFinish: function() {
        this.player.scheduleUpdate();
        this.tail.scheduleUpdate();
        this.obstacle.scheduleUpdate();
        this.scheduleUpdate();

        var playerAction = cc.MoveBy.create(1, cc.p(this.SPEED, 0));
        this.player.runAction(cc.RepeatForever.create(playerAction));

        var backAction = cc.MoveBy.create(1, cc.p(-this.SPEED, 0));
        this.gameLayer.runAction(cc.RepeatForever.create(backAction));
    },

    update: function() {
        var winSize = cc.Director.getInstance().getWinSize();
        var distance = Math.abs(this.gameLayer.getPositionX());
        var nextGeneratePoint = this.obstacle.getMostDistantWallX() - winSize.width;
        if (distance > nextGeneratePoint) {
            this.obstacle.generateNext();
        }

        this.scoreLabel.setString(this.getScore());

        var isCollided = this.obstacle.allWalls().some(function(wall) {
            return this.player.collisionWith(wall);
        }, this);

        if (isCollided) {
            this.playGameOverScene();
        }
    },

    playGameOverScene: function() {
        this._stopAnimations();

        var size = cc.Director.getInstance().getWinSize();

        var gameOverFontSize = 72;
        var gameOverLabel = cc.LabelTTF.create("GAME OVER", cave.config.LABEL_FONT, gameOverFontSize);
        gameOverLabel.setPosition(size.width / 2, size.height / 2);
        this.addChild(gameOverLabel);

        var oldHighScore = this.getHighScore();
        var updated = this._updateHighScore();
        if (updated) {
            var newHighScore = this.getHighScore();
            var highScoreFontSize = 24;
            var highScoreText = "New Record!: " + oldHighScore + " -> " + newHighScore;
            var highScoreLabel = cc.LabelTTF.create(highScoreText, cave.config.LABEL_FONT, highScoreFontSize);
            highScoreLabel.setPosition(cc.pSub(gameOverLabel.getPosition(), cc.p(0, gameOverFontSize)));
            this.addChild(highScoreLabel);
        }

        setTimeout(function() {
            var retryFontSize = 36;
            var retryLabel = cc.LabelTTF.create("tap to retry", cave.config.LABEL_FONT, retryFontSize);
            retryLabel.setPosition(cc.pSub(gameOverLabel.getPosition(), cc.p(0, gameOverFontSize * 2)));

            this.addChild(retryLabel);
            this.onTouchEnded = function() {
                cc.Director.getInstance().replaceScene(new cave.scene.Game());
            };
        }.bind(this), 500);
    },

    _updateHighScore: function() {
        var highScore = this.getHighScore();
        var currentScore = this.getScore();
        if (highScore < currentScore) {
            this.setHighScore(currentScore);
            return true;
        }
        return false;
    },

    getScore: function() {
        return Math.floor(Math.abs(this.gameLayer.getPositionX()));
    },

    getHighScore: function() {
        return localStorage.getItem('HighScore') - 0;
    },

    setHighScore: function(score) {
        return localStorage.setItem('HighScore', score);
    },

    _stopAnimations: function() {
        this.gameLayer.stopAllActions();
        this.player.stopAllActions();
        this.unscheduleUpdate();
        this.player.unscheduleUpdate();
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
    },

    collisionWith: function(rect) {
        var playerPosition = this.getPosition();

        // rectからplayerに一番近い頂点を見つける
        var p1 = cc.p(rect.x, rect.y);
        var p2 = cc.p(rect.x + rect.width, rect.y + rect.height);
        var p = cc.pClamp(playerPosition, p1, p2);

        // playerとの距離がplayerのsize以下ならぶつかってます
        return cc.pDistance(playerPosition, p) < this.size;
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

cave.scene.Game.Obstacle = cc.Node.extend({
    DEFAULT_COLOR: cc.c4(0xFF, 0xCC, 0x00, 0xFF),

    // 洞窟パラメータ
    WIDTH:     30, // 壁の幅
    BUFFER:    30, // 最低でも開ける隙間の大きさ
    AMPLITUDE: 70, // 壁の振れ幅

    init: function() {
        this.upperWalls = []; // {cc.rect}
        this.lowerWalls = []; // {cc.rect}
        this.floatingWalls = []; // {cc.rect}
        this.count = 0;
        this.floatingWallFrequency = 0;

        this.effect = cc.DrawNode.create();
        this.addChild(this.effect);

        var winSize = cc.Director.getInstance().getWinSize();
        this.maxWallsCount = (winSize.width / this.WIDTH) * 2;
        this.maxWallHeight = (winSize.height - this.BUFFER) * 2 / 5;
    },

    generateNext: function() {
        var winSize = cc.Director.getInstance().getWinSize();
        var w = this.WIDTH;
        var x = this.WIDTH * this.count;

        var upperWall = this._generateUpperWall();
        this.upperWalls.push(upperWall);
        if (this.upperWalls.length >= this.maxWallsCount) {
            this.upperWalls.shift();
        }

        var lowerWall = this._generateLowerWall();
        this.lowerWalls.push(lowerWall);
        if (this.lowerWalls.length >= this.maxWallsCount) {
            this.lowerWalls.shift();
        }

        var lot = Math.random() * 1000;
        if (lot < this.floatingWallFrequency) {
            var floatingWall = this._generateFloatingWall();
            this.floatingWalls.push(floatingWall);
            if (this.floatingWalls.length >= this.maxWallsCount) {
                this.floatingWalls.shift();
            }
            this.floatingWallFrequency = 0;
        }
        else {
            this.floatingWallFrequency += this.count;
            this.floatingWallFrequency = Math.min(this.floatingWallFrequency, 900);
        }

        this.count++;
        this.generated = true;
    },

    _randomWallHeight: function(minHeight) {
        minHeight = Math.min(minHeight, this.maxWallHeight - this.AMPLITUDE);
        return Math.floor(minHeight + Math.random() * this.AMPLITUDE);
    },

    _generateUpperWall: function() {
        var winSize = cc.Director.getInstance().getWinSize();
        var w = Math.floor(this.WIDTH);
        var h = Math.floor(this._randomWallHeight(50 + this.count));
        var x = Math.floor(w * this.count);
        var y = Math.floor(winSize.height - h);
        return cc.rect(x, y, w, h);
    },

    _generateLowerWall: function() {
        var w = Math.floor(this.WIDTH);
        var h = Math.floor(this._randomWallHeight(50 + this.count));
        var x = Math.floor(w * this.count);
        var y = Math.floor(0);
        return cc.rect(x, y, w, h);
    },

    _generateFloatingWall: function() {
        var winSize = cc.Director.getInstance().getWinSize();
        var w = Math.floor(this.WIDTH);
        var h = Math.floor(this._randomWallHeight(75));
        var x = Math.floor(w * this.count);
        var y = Math.floor(winSize.height / 3 + Math.random() * this.maxWallHeight);
        return cc.rect(x, y, w, h);
    },

    update: function() {
        if (this.generated) {
            this.effect.clear()
            this._redraw();
            this.generated = false;
        }
    },

    getMostDistantWallX: function() {
        return this.count * this.WIDTH;
    },

    _redraw: function() {
        var color = cc.c4FFromccc4B(this.DEFAULT_COLOR);
        this.allWalls().forEach(function(wall) {
            var vertex = this._convertToVertex(wall);
            this.effect.drawPoly(vertex, color, 0, color);
        }, this);
    },

    allWalls: function() {
        return [].concat(this.upperWalls, this.lowerWalls, this.floatingWalls);
    },

    _convertToVertex: function(rect) {
        return [
            cc.p(rect.x, rect.y),
            cc.p(rect.x, rect.y + rect.height),
            cc.p(rect.x + rect.width, rect.y + rect.height),
            cc.p(rect.x + rect.width, rect.y)
        ];
    }
});

