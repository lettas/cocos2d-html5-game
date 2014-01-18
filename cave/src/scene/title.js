cave.scene.Title = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new cave.scene.Title.BaseLayer();
        this.addChild(layer);
        layer.init();
    }
});

cave.scene.Title.BaseLayer = cc.Layer.extend({
    init: function() {
        var size = cc.Director.getInstance().getWinSize();
        this.titleLabel = cc.LabelTTF.create("CAVE", "Impact", 38);
        this.titleLabel.setPosition(cc.p(size.width / 2, size.height - 40));
        this.addChild(this.titleLabel, 5);
    }
});

