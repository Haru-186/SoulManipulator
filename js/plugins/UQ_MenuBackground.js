

(function() {
	var createBg = Scene_MenuBase.prototype.createBackground;
    Scene_MenuBase.prototype.createBackground = function() {
        createBg.call(this);

	    this._backgroundSprite = new Sprite(ImageManager.loadSystem('background'));
	    this.addChild(this._backgroundSprite);
    }
 
})();
