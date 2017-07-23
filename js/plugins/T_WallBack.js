//=============================================================================
// T_WallBack.js
//=============================================================================
//Copyright (c) 2016 Trb
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//
//twitter https://twitter.com/Trb_surasura
/*:
 * @plugindesc 壁の後ろを歩けるプラグイン
 * @author Trb
 * @version 1.00 2016/5/22 初版
 *          1.01 2016/6/2  隙間補完機能の計算がおかしかった部分を修正しました。
 * 
 * @help 過去のツクールのように壁タイルの後ろを歩けるようになります。
 * パラメータの地形タグで設定した番号のタイルが、後ろを歩けるようになります。
 * ただしMVには天井の上を歩ける機能がありますが、壁の後ろを歩けるようにしたタイルは
 * 天井を歩けなくなります。
 * 
 * また、おまけ機能としてタイル画像の隙間補完機能というものがあります。
 * これについては文章で説明しにくいので解説ページをご覧になって下さい。
 * 
 * 
 * @param 地形タグ
 * @desc 壁の後ろを歩けるようにするタイルに設定する地形タグ
 * @default 1
 * 
 * 
 * @param 隙間補完
 * @desc タイルの隙間補間を行うかどうか(ON 又は OFF)
 * @default OFF
 * 
 */
(function () {
    var kabeura = Number(PluginManager.parameters('T_WallBack')['地形タグ']);
    var hokan = String(PluginManager.parameters('T_WallBack')['隙間補完']);
	
    
    //タイルの描画
    //中間部分に処理を追加しないといけないので大きく抜き出していますが
    //追加処理自体はそんなに多くないです
    Tilemap.prototype._paintTiles = function(startX, startY, x, y) {
        var tableEdgeVirtualId = 10000;
        var mx = startX + x;
        var my = startY + y;
        var dx = (mx * this._tileWidth).mod(this._layerWidth);
        var dy = (my * this._tileHeight).mod(this._layerHeight);
        var lx = dx / this._tileWidth;
        var ly = dy / this._tileHeight;
        var tileId0 = this._readMapData(mx, my, 0);
        var tileId1 = this._readMapData(mx, my, 1);
        var tileId2 = this._readMapData(mx, my, 2);
        var tileId3 = this._readMapData(mx, my, 3);
        var shadowBits = this._readMapData(mx, my, 4);
        var upperTileId1 = this._readMapData(mx, my - 1, 1);
        var lowerTiles = [];
        var upperTiles = [];
        
        //追加部分ここから
        if(hokan == 'ON'){
            var hokanTile = checkHokan(mx,my);
            if(hokanTile){
                lowerTiles.push(hokanTile);
            }
        }
        if(checkWallBack(mx,my) == 1){
            upperTiles.push(tileId0);
            upperTiles.push(tileId1);//タイル1だけupperTilesにするとその上にあるタイル1,2,3が
            upperTiles.push(tileId2);//隠れてしまうので全てupperTilesにpushしてますが、
            upperTiles.push(tileId3);//逆に1,2,3は壁の裏に描画したいという場合はこれを消せばいいです
        } else //ここまで

         if (this._isHigherTile(tileId0)) {
            upperTiles.push(tileId0);
        } else {
            lowerTiles.push(tileId0);
        }
        if (this._isHigherTile(tileId1)) {
            upperTiles.push(tileId1);
        } else {
            lowerTiles.push(tileId1);
        }

        lowerTiles.push(-shadowBits);

        if (this._isTableTile(upperTileId1) && !this._isTableTile(tileId1)) {
            if (!Tilemap.isShadowingTile(tileId0)) {
                lowerTiles.push(tableEdgeVirtualId + upperTileId1);
            }
        }

        if (this._isOverpassPosition(mx, my)) {
            upperTiles.push(tileId2);
            upperTiles.push(tileId3);
        } else {
            if (this._isHigherTile(tileId2)) {
                upperTiles.push(tileId2);
            } else {
                lowerTiles.push(tileId2);
            }
            if (this._isHigherTile(tileId3)) {
                upperTiles.push(tileId3);
            } else {
                lowerTiles.push(tileId3);
            }
        }

        var count = 1000 + this.animationCount - my;
        var frameUpdated = (count % 30 === 0);
        this._animationFrame = Math.floor(count / 30);

        var lastLowerTiles = this._readLastTiles(0, lx, ly);
        if (!lowerTiles.equals(lastLowerTiles) ||
                (Tilemap.isTileA1(tileId0) && frameUpdated)) {
            this._lowerBitmap.clearRect(dx, dy, this._tileWidth, this._tileHeight);
            for (var i = 0; i < lowerTiles.length; i++) {
                var lowerTileId = lowerTiles[i];
                if (lowerTileId < 0) {
                    this._drawShadow(this._lowerBitmap, shadowBits, dx, dy);
                } else if (lowerTileId >= tableEdgeVirtualId) {
                    this._drawTableEdge(this._lowerBitmap, upperTileId1, dx, dy);
                } else {
                    this._drawTile(this._lowerBitmap, lowerTileId, dx, dy);
                }
            }
            this._writeLastTiles(0, lx, ly, lowerTiles);
        }

        var lastUpperTiles = this._readLastTiles(1, lx, ly);
        if (!upperTiles.equals(lastUpperTiles)) {
            this._upperBitmap.clearRect(dx, dy, this._tileWidth, this._tileHeight);
            for (var j = 0; j < upperTiles.length; j++) {
                this._drawTile(this._upperBitmap, upperTiles[j], dx, dy);
            }
            this._writeLastTiles(1, lx, ly, upperTiles);
        }
    };
    
    
    //移動時の通行判定
    var _checkPassage = Game_Map.prototype.checkPassage;
    Game_Map.prototype.checkPassage = function(x, y, bit) {
        var check = checkWallBack(x,y);
        if(check == 1){
            return true;
        }else if(check == 2){
            return false;
        } else{
            return _checkPassage.call(this,x,y,bit);
        }
    };
    
    //指定マスと1マス上のタイルIDを調べる
    //指定マスが屋根・天井タイルじゃなかったら0、
    //指定マスが屋根・天井タイルで1マス上がそれ以外だったら1、(壁裏判定)
    //指定マスも1マス上も屋根・天井タイルだったら2（通行不可の屋根、天井判定）
    var checkWallBack = function(x,y){
        var y2 = $gameMap.roundY(y - 1);
        var tile1 = $gameMap.tileId(x,y,0);
        var tile2 = $gameMap.tileId(x,y2,0);
        if((Tilemap.isRoofTile(tile1) || Tilemap.isWallTopTile(tile1)) && $gameMap.terrainTag(x,y) == kabeura){
            if(!Tilemap.isRoofTile(tile2) && !Tilemap.isWallTopTile(tile2)){
                return 1;
            }else return 2;
        }else return 0;
    };


    //補完タイルの取得
    var checkHokan = function(x,y){
        var tile1 = $gameMap.tileId(x,y,0);
        var shape = Tilemap.getAutotileShape(tile1);
        //オートタイルの中で屋根、壁タイルと天井タイルはテーブルが違うので別々にします
        //屋根、壁タイル
        if(Tilemap.isRoofTile(tile1) || Tilemap.isWallSideTile(tile1)){
            if([0,1,4,5,8,9,12,13].indexOf(shape) >= 0){
                var y2 = $gameMap.roundY(y - 1);
                return hokanTile($gameMap.tileId(x,y2,0));
            }
            if([1,3,5,7,9,11,13,15].indexOf(shape) >= 0){
                var x2 = $gameMap.roundX(x - 1);
                return hokanTile($gameMap.tileId(x2,y,0));
            }
            if([4,5,6,7,12,13,14,15].indexOf(shape) >= 0){
                var x2 = $gameMap.roundX(x + 1);
                return hokanTile($gameMap.tileId(x2,y,0));
            }
        }
        //天井タイル
        if(Tilemap.isWallTopTile(tile1)){
            if([20,21,22,23,33,34,35,36,37,42,43,45,46].indexOf(shape) >= 0){
                var y2 = $gameMap.roundY(y - 1);
                return hokanTile($gameMap.tileId(x,y2,0));
            }
            if([16,17,18,19,32,40,41,44].indexOf(shape) >= 0){
                var x2 = $gameMap.roundX(x - 1);
                return hokanTile($gameMap.tileId(x2,y,0));
            }
            if([24,25,26,27,38,39].indexOf(shape) >= 0){
                var x2 = $gameMap.roundX(x + 1);
                return hokanTile($gameMap.tileId(x2,y,0));
            }
            if([1,3,5,7,9,11,13,15,29,31].indexOf(shape) >= 0){
                var x2 = $gameMap.roundX(x - 1);
                var y2 = $gameMap.roundY(y - 1);
                return hokanTile($gameMap.tileId(x2,y2,0));
            }
            if([2,10,14,30].indexOf(shape) >= 0){
                var x2 = $gameMap.roundX(x + 1);
                var y2 = $gameMap.roundY(y - 1);
                return hokanTile($gameMap.tileId(x2,y2,0));
            }
            if([8,12].indexOf(shape) >= 0){
                var x2 = $gameMap.roundX(x - 1);
                var y2 = $gameMap.roundY(y + 1);
                return hokanTile($gameMap.tileId(x2,y2,0));
            }
            if([4].indexOf(shape) >= 0){
                var x2 = $gameMap.roundX(x + 1);
                var y2 = $gameMap.roundY(y + 1);
                return hokanTile($gameMap.tileId(x2,y2,0));
            }
            return false;
        }
    };
    
    var hokanTile = function(tile){        
        return Tilemap.isAutotile(tile) ? Math.floor((tile - Tilemap.TILE_ID_A1) / 48) * 48 + Tilemap.TILE_ID_A1 : tile;
    };



    //コアスクリプトの不具合修正
    Tilemap.isWallSideTile = function(tileId) {
        return (this.isTileA3(tileId) || this.isTileA4(tileId)) &&
                this.getAutotileKind(tileId) % 16 >= 8;
    };        //↑ここのthis.が抜けていた

})();