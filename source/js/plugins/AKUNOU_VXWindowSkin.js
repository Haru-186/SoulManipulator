//=============================================================================
// AKUNOU_VXWindowSkin.js
// Version: 1.00
// ----------------------------------------------------------------------------
// 河原 つつみ
// 連絡先 ：『アクマの脳髄』http://www.akunou.com/
//=============================================================================

/*:
 * @plugindesc RPGツクールVX系サイズのウィンドウスキン画像がMVで使えるようになります。
 * @author Tsutumi Kawahara
 * @help
 * プラグインコマンド:
 *   必要なし
 * プラグイン ON にするだけで適用されるスクリプトです。
 * 
 * ウィンドウカラーの変更にも対応していますが、
 * エディタ上では色が変わって見えませんので注意して下さい。
 */

(function() {

    //-------------------------------------------------------------------------
    // Window
    //-------------------------------------------------------------------------
    
    /**
    * @method _refreshBack
    * @private
    */
    Window.prototype._refreshBack = function() {
        var m = this._margin;
        var w = this._width - m * 2;
        var h = this._height - m * 2;
        var bitmap = new Bitmap(w, h);
    
        this._windowBackSprite.bitmap = bitmap;
        this._windowBackSprite.setFrame(0, 0, w, h);
        this._windowBackSprite.move(m, m);
    
        if (w > 0 && h > 0 && this._windowskin) {
            var p = 64;
            bitmap.blt(this._windowskin, 0, 0, p, p, 0, 0, w, h);
            for (var y = 0; y < h; y += p) {
                for (var x = 0; x < w; x += p) {
                    bitmap.blt(this._windowskin, 0, p, p, p, x, y, p, p);
                }
            }
            var tone = this._colorTone;
            bitmap.adjustTone(tone[0], tone[1], tone[2]);
        }
    };
    
    /**
    * @method _refreshFrame
    * @private
    */
    Window.prototype._refreshFrame = function() {
        var w = this._width;
        var h = this._height;
        var m = 16;
        var bitmap = new Bitmap(w, h);
    
        this._windowFrameSprite.bitmap = bitmap;
        this._windowFrameSprite.setFrame(0, 0, w, h);
    
        if (w > 0 && h > 0 && this._windowskin) {
            var skin = this._windowskin;
            var p = 64;
            var q = 64;
            bitmap.blt(skin, p+m, 0+0, p-m*2, m, m, 0, w-m*2, m);
            bitmap.blt(skin, p+m, 0+q-m, p-m*2, m, m, h-m, w-m*2, m);
            bitmap.blt(skin, p+0, 0+m, m, p-m*2, 0, m, m, h-m*2);
            bitmap.blt(skin, p+q-m, 0+m, m, p-m*2, w-m, m, m, h-m*2);
            bitmap.blt(skin, p+0, 0+0, m, m, 0, 0, m, m);
            bitmap.blt(skin, p+q-m, 0+0, m, m, w-m, 0, m, m);
            bitmap.blt(skin, p+0, 0+q-m, m, m, 0, h-m, m, m);
            bitmap.blt(skin, p+q-m, 0+q-m, m, m, w-m, h-m, m, m);
        }
    };
    
    /**
    * @method _refreshCursor
    * @private
    */
    Window.prototype._refreshCursor = function() {
        var pad = this._padding;
        var x = this._cursorRect.x + pad - this.origin.x;
        var y = this._cursorRect.y + pad - this.origin.y;
        var w = this._cursorRect.width;
        var h = this._cursorRect.height;
        var m = 2;
        var x2 = Math.max(x, pad);
        var y2 = Math.max(y, pad);
        var ox = x - x2;
        var oy = y - y2;
        var w2 = Math.min(w, this._width - pad - x2);
        var h2 = Math.min(h, this._height - pad - y2);
        var bitmap = new Bitmap(w2, h2);
    
        this._windowCursorSprite.bitmap = bitmap;
        this._windowCursorSprite.setFrame(0, 0, w2, h2);
        this._windowCursorSprite.move(x2, y2);
    
        if (w > 0 && h > 0 && this._windowskin) {
            var skin = this._windowskin;
            var p = 64;
            var q = 32;
            bitmap.blt(skin, p+m, p+m, q-m*2, q-m*2, ox+m, oy+m, w-m*2, h-m*2);
            bitmap.blt(skin, p+m, p+0, q-m*2, m, ox+m, oy+0, w-m*2, m);
            bitmap.blt(skin, p+m, p+q-m, q-m*2, m, ox+m, oy+h-m, w-m*2, m);
            bitmap.blt(skin, p+0, p+m, m, q-m*2, ox+0, oy+m, m, h-m*2);
            bitmap.blt(skin, p+q-m, p+m, m, q-m*2, ox+w-m, oy+m, m, h-m*2);
            bitmap.blt(skin, p+0, p+0, m, m, ox+0, oy+0, m, m);
            bitmap.blt(skin, p+q-m, p+0, m, m, ox+w-m, oy+0, m, m);
            bitmap.blt(skin, p+0, p+q-m, m, m, ox+0, oy+h-m, m, m);
            bitmap.blt(skin, p+q-m, p+q-m, m, m, ox+w-m, oy+h-m, m, m);
        }
    };
    
    /**
    * @method _refreshArrows
    * @private
    */
    Window.prototype._refreshArrows = function() {
        var w = this._width;
        var h = this._height;
        var p = 16;
        var q = p/2;
        var sx = 64+p;
        var sy = 0+p;
        this._downArrowSprite.bitmap = this._windowskin;
        this._downArrowSprite.anchor.x = 0.5;
        this._downArrowSprite.anchor.y = 0.5;
        this._downArrowSprite.setFrame(sx+q, sy+q+p, p, q);
        this._downArrowSprite.move(w/2, h-q);
        this._upArrowSprite.bitmap = this._windowskin;
        this._upArrowSprite.anchor.x = 0.5;
        this._upArrowSprite.anchor.y = 0.5;
        this._upArrowSprite.setFrame(sx+q, sy, p, q);
        this._upArrowSprite.move(w/2, q);
    };
    
    /**
    * @method _refreshPauseSign
    * @private
    */
    Window.prototype._refreshPauseSign = function() {
        var sx = 96;
        var sy = 64;
        var p = 16;
        this._windowPauseSignSprite.bitmap = this._windowskin;
        this._windowPauseSignSprite.anchor.x = 0.5;
        this._windowPauseSignSprite.anchor.y = 1;
        this._windowPauseSignSprite.move(this._width / 2, this._height);
        this._windowPauseSignSprite.setFrame(sx, sy, p, p);
        this._windowPauseSignSprite.alpha = 0;
    };
    
    /**
    * @method _updatePauseSign
    * @private
    */
    Window.prototype._updatePauseSign = function() {
        var sprite = this._windowPauseSignSprite;
        var x = Math.floor(this._animationCount / 16) % 2;
        var y = Math.floor(this._animationCount / 16 / 2) % 2;
        var sx = 96;
        var sy = 64;
        var p = 16;
        if (!this.pause) {
            sprite.alpha = 0;
        } else if (sprite.alpha < 1) {
            sprite.alpha = Math.min(sprite.alpha + 0.1, 1);
        }
        sprite.setFrame(sx+x*p, sy+y*p, p, p);
        sprite.visible = this.isOpen();
    };
    
    //-------------------------------------------------------------------------
    // Window_Base
    //-------------------------------------------------------------------------
    
    Window_Base.prototype.textColor = function(n) {
        var px = 64 + (n % 8) * 8 + 4;
        var py = 96 + Math.floor(n / 8) * 8 + 4;
        return this.windowskin.getPixel(px, py);
    };
    
    Window_Base.prototype.pendingColor = function() {
        return this.windowskin.getPixel(80, 80);
    };

})();
