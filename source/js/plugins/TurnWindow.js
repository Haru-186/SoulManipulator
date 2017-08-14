//
//  霊素濃度表示ゲージ
//
// author yana
//

var Imported = Imported || {};
Imported['TurnWindow'] = 1.03;

/*:
 * @plugindesc バトルウィンドウに霊素濃度表示ゲージを追加します。
 * @author UQ
 *
 * @param Turn Window X
 * @desc ターンウィンドウの表示値位置X座標です。
 * @default 712
 *
 * @param Turn Window Y
 * @desc ターンウィンドウの表示位置Y座標です。
 * @default 8
 * 
 * @param Turn Window Width
 * @desc ターンウィンドウの横幅です。
 * @default 96
 *
 * @param Turn Window Height
 * @desc ターンウィンドウの縦幅です。
 * @default 96
 *
 * @param Turn Window Name
 * @desc ターンウィンドウに表示する”ターン”の部分です。
 * @default Turn
 *
 * @param Turn Window Use Sprite
 * @desc ターンウィンドウに画像を使用するかどうかの設定です。
 * true/falseで指定してください。
 * @default true
 * 
 * @param Turn Window Sprite
 * @desc ターンウィンドウに表示する画像の名前です。
 * img/systemフォルダに画像を用意してください。
 * @default turn_window
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param Split LogWindow Back
 * @desc ログウィンドウのバックスプライトをウィンドウの横幅だけ切り詰めるかの設定です。true/falseで設定してください。
 * @default true
 * 
 * @param Turn Window Font Size Turn
 * @desc ターン表示の"ターン"部分の文字サイズです。
 * @default 24
 * 
 * @param Turn Window Font Size Count
 * @desc ターン表示の数値部分の文字サイズです。
 * @default 48
 * 
 * @param Turn Window TurnX
 * @desc ターン表示のX座標です。
 * @default 8
 *
 * @param Turn Window TurnY
 * @desc ターン表示のY座標です。
 * @default 0
 *
 * @param Turn Window Turn　NumX
 * @desc ターン表示の数字部分のX座標です。
 * @default 24
 *
 * @param Turn Window Turn　NumY
 * @desc ターン表示の数字部分のY座標です。
 * @default 38
 *
 * @param Soul Point
 * @desc 霊素濃度の変数番号指定
 * @default 2
 * 
 * @param Max Soul Point
 * @desc 霊素濃度の最大値
 * @default 500
 *
 * 
 * @help このプラグインにはプラグインコマンドはありません。
 * ------------------------------------------------------
 * 利用規約：特になし。素材利用は自己責任でお願いします。
 * ------------------------------------------------------
 * 更新履歴：
 * ver1.03:
 * 不要素材削除機能に対応しました。
 * 
 * ver1.02:
 * 全員が行動不能状態で戦闘開始した場合、ターンウィンドウが正常に表示されないバグを修正しました。
 * 特定の状況下でターン数が正常に表示されないバグを修正しました。
 * YEP_BattleEngineCoreとの併用化処理を追加しました。
 *
 * ver1.01:
 * ヘルプに規約関係の追記をしました。
 * 添付画像の透明度が正常でないのを修正しました。
 * 
 * ver1.00:
 * 公開
 */

(function() {

    var parameters = PluginManager.parameters('TurnWindow');
    var turnWindowX = Number(parameters['Turn Window X'] || 712);
    var turnWindowY = Number(parameters['Turn Window Y'] || 8);
    var turnWindowWidth = Number(parameters['Turn Window Width'] || 96);
    var turnWindowHeight = Number(parameters['Turn Window Height'] || 96);
    var turnWindowUseSprite = String(parameters['Turn Window Use Sprite'] || "true");
    var turnWindowSprite = String(parameters['Turn Window Sprite'] || "");
    var turnWindowTurn = String(parameters['Turn Window Name'] || "Turn");
    var turnWindowSplitLog = String(parameters['Split LogWindow Back'] || "true");
    var turnWindowFontSizeTurn = Number(parameters['Turn Window Font Size Turn'] || 24);
    var turnWindowFontSizeCount = Number(parameters['Turn Window Font Size Count'] || 48);
    var turnWindowTurnX = Number(parameters['Turn Window TurnX'] || 0);
    var turnWindowTurnY = Number(parameters['Turn Window TurnY'] || 0);
    var turnWindowTurnNumX = Number(parameters['Turn Window Turn NumX'] || 24);
    var turnWindowTurnNumY = Number(parameters['Turn Window Turn NumY'] || 38);
    var variableNoOfSoulPoint = Number(parameters['Soul Point'] || 2);
    var maxSoulPoint = Number(parameters['Max Soul Point'] || 500);

    function Window_Turn() {
        this.initialize.apply(this, arguments);
    };
    Window_Turn.prototype = Object.create(Window_Base.prototype);
    Window_Turn.prototype.constructor = Window_Turn;

    Window_Turn.prototype.initialize = function(x, y) {
        var width = this.windowWidth();
        var height = this.windowHeight();
        var opacity = 0
        if (!this.isWindowUse()){
            width += this.standardPadding() * 2;
            height += this.standardPadding() * 2;
            x -= this.standardPadding();
            y -= this.standardPadding();
            opacity = 0
        };
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.openness = 0
        this.opacity = opacity
        this.refresh();
    };

    Window_Turn.prototype.standardPadding = function() {
        return 8;
    };

    Window_Turn.prototype.windowWidth = function() {
        return turnWindowWidth;
    };

    Window_Turn.prototype.windowHeight = function() {
        return turnWindowHeight;
    };

    Window_Turn.prototype.isWindowUse = function() {
        return turnWindowUseSprite != "true";
    };

    Window_Turn.prototype.refresh = function() {
    /*
        var x = turnWindowTurnX;
        var y = turnWindowTurnY;
        var width = this.windowWidth() - this.standardPadding() * 2;
        this._turnCount = BattleManager.twTurnCount();
        this.contents.clear();
        if (!this.isWindowUse()){
            var bitmap = ImageManager.loadSystem(turnWindowSprite);
            this.contents.blt(bitmap,0,0,bitmap.width,bitmap.height,0,0);
        };
        
        this.contents.fontSize = turnWindowFontSizeTurn;
        this.drawText(turnWindowTurn, x, y, width);
        
        x = turnWindowTurnNumX;
        y = turnWindowTurnNumY;
        var text = ("0" + this._turnCount).substr(-2);
        
        this.contents.fontSize = turnWindowFontSizeCount;
        this.drawText(text, x, y, width);
    */

        //霊素濃度ゲージはスプライトで表示するようにしたため、不要
        /*
        var x = turnWindowTurnX;
        var y = turnWindowTurnY;
        var valueForRate = $gameVariables.value(variableNoOfSoulPoint);
        var rate = valueForRate / maxSoulPoint;
        var color1 = this.textColor(30);
        var color2 = this.textColor(31);
        this.drawGauge(x, y, (maxSoulPoint / 2), rate, color1, color2);
        */
    };

    var createUpper = Spriteset_Battle.prototype.createBattleField;
    var rFrame 		= new Sprite(ImageManager.loadSystem('reiso_frame'));
　　var rGauge 		= new Sprite(ImageManager.loadSystem('reiso_gauge'));
    var rLogo 		= new Sprite(ImageManager.loadSystem('reiso_logo'));
    var magicLogo 	= new Sprite(ImageManager.loadSystem('magic_circuit'));
    var magicLogo2 	= new Sprite(ImageManager.loadSystem('magic_circuit2'));

/*=============================================================
 *          霊素濃度ゲージフレームとゲージの表示（開始）       
 *=============================================================*/
    Spriteset_Battle.prototype.createBattleField = function() {
        //魔方陣を表示
        magicLogo.x = 470;
        magicLogo.y = 390;
        magicLogo.visible = true;
        magicLogo.blendMode = 1;
        this.addChild(magicLogo);
        //魔方陣を表示
        magicLogo2.x = -125;
        magicLogo2.y = -125;
        magicLogo2.visible = true;
        magicLogo2.blendMode = 1;
        this.addChild(magicLogo2);
        //霊素濃度フレームを表示
        rFrame.x = 511;
        rFrame.y = 408;
        rFrame.visible = true;
        this.addChild(rFrame);
        //霊素濃度ゲージを表示
        rGauge.x = 528;
        rGauge.y = 422;
        rGauge.visible = true;
        this.addChild(rGauge);
        createUpper.call(this);
        //霊素濃度ロゴを表示
        rLogo.x = 511;
        rLogo.y = 408;
        rLogo.visible = true;
        this.addChild(rLogo);
        console.log(rLogo);
    }

    var battleUp = Spriteset_Battle.prototype.update;
    Spriteset_Battle.prototype.update = function() {
        battleUp.call(this);
        //霊素濃度の割合を算出
　　　　var rate = $gameVariables.value(variableNoOfSoulPoint) / maxSoulPoint;
        
        //霊素濃度ゲージの更新
        rGauge.setFrame( 0, 0, (250 * rate), 16 );
    }
/*=============================================================
 *          霊素濃度ゲージフレームとゲージの表示（終了）       
 *=============================================================*/

    Window_Turn.prototype.open = function() {
        Window_Base.prototype.open.call(this);
        this.refresh();
    };

    Scene_Battle.prototype.createTurnWindow = function() {
        var x = turnWindowX;
        var y = turnWindowY;
        this._turnWindow = new Window_Turn(x,y);
        this.addWindow(this._turnWindow);
        this._turnWindow.refresh();
    };
    var _turnw_Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _turnw_Scene_Battle_createAllWindows.call(this);
        this.createTurnWindow();
    };
    
    var _turnw_Scene_Battle_onActorCancel = Scene_Battle.prototype.onActorCancel;
    Scene_Battle.prototype.onActorCancel = function() {
        _turnw_Scene_Battle_onActorCancel.call(this);
        switch (this._actorCommandWindow.currentSymbol()) {
        case 'skill':
        case 'item':
            this._turnWindow.hide();
            break;
        }
    };
    
    var _turnw_Scene_Battle_onEnemyCancel = Scene_Battle.prototype.onEnemyCancel;
    Scene_Battle.prototype.onEnemyCancel = function() {
        _turnw_Scene_Battle_onEnemyCancel.call(this);
        switch (this._actorCommandWindow.currentSymbol()) {
        case 'skill':
        case 'item':
            this._turnWindow.hide();
            break;
        default:
            this._turnWindow.show();
        }
    };
    
    var _turnw_Scene_Battle_commandSkill = Scene_Battle.prototype.commandSkill;
    Scene_Battle.prototype.commandSkill = function() {
        _turnw_Scene_Battle_commandSkill.call(this);
        this._turnWindow.hide();
    };
    
    var _turnw_Scene_Battle_commandItem = Scene_Battle.prototype.commandItem;
    Scene_Battle.prototype.commandItem = function() {
        _turnw_Scene_Battle_commandItem.call(this);
        this._turnWindow.hide();
    };
    
    var _turnw_Scene_Battle_onSkillOk = Scene_Battle.prototype.onSkillOk;
    Scene_Battle.prototype.onSkillOk = function() {
        _turnw_Scene_Battle_onSkillOk.call(this);
        this._turnWindow.show();
    };

    var _turnw_Scene_Battle_onSkillCancel = Scene_Battle.prototype.onSkillCancel;
    Scene_Battle.prototype.onSkillCancel = function() {
        _turnw_Scene_Battle_onSkillCancel.call(this);
        this._turnWindow.show();
    };

    var _turnw_Scene_Battle_onItemOk = Scene_Battle.prototype.onItemOk;
    Scene_Battle.prototype.onItemOk = function() {
        _turnw_Scene_Battle_onItemOk.call(this);
        this._turnWindow.show();
    };

    var _turnw_Scene_Battle_onItemCancel = Scene_Battle.prototype.onItemCancel;
    Scene_Battle.prototype.onItemCancel = function() {
        _turnw_Scene_Battle_onItemCancel.call(this);
        this._turnWindow.show();
    };
    
    var _turnw_Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _turnw_Scene_Battle_update.call(this);
        if (BattleManager.isInputting() && this._turnWindow.isClosed()) { this._turnWindow.open() };
        if (BattleManager.isInTurn() && this._turnWindow.isClosed()) { this._turnWindow.open() };
        if (BattleManager.isAborting() || BattleManager.isBattleEnd()) { this._turnWindow.close() };
        if (this._turnWindow._turnCount !== BattleManager.twTurnCount()) { this._turnWindow.refresh() };
    };
    /*
    var _turnw_Window_BattleLog_windowWidth = Window_BattleLog.prototype.windowWidth;
    Window_BattleLog.prototype.windowWidth = function() {
        var width = _turnw_Window_BattleLog_windowWidth.call(this);
        if (turnWindowSplitLog == "true" ) {  width -= turnWindowWidth };
        return width
    };
    */
    BattleManager.twTurnCount = function(){
        return this.isInputting() ? ($gameTroop._turnCount + 1) : $gameTroop._turnCount;
    };
    
    if (Imported.YEP_BattleEngineCore){
        Scene_Battle.prototype.onSkillOk = function() {
            _turnw_Scene_Battle_onSkillOk.call(this);
        };

        Scene_Battle.prototype.onItemOk = function() {
            _turnw_Scene_Battle_onItemOk.call(this);
        };
        
        var _turnw_Scene_Battle_commandAttack = Scene_Battle.prototype.commandAttack;
        Scene_Battle.prototype.commandAttack = function() {
            _turnw_Scene_Battle_commandAttack.call(this);
            this._turnWindow.hide();    
        };
        
        var _turnw_Scene_Battle_onEnemyOk = Scene_Battle.prototype.onEnemyOk;
        Scene_Battle.prototype.onEnemyOk = function() {
            _turnw_Scene_Battle_onEnemyOk.call(this);   
            this._turnWindow.show();
        };
        /*
        Window_BattleLog.prototype.windowWidth = function(){
            return Graphics.boxWidth - 144;
        }
        
        Window_BattleLog.prototype.drawSimpleActionLine = function(index) {
            var text = this._lines[index].replace('<SIMPLE>', '');
            var rect = this.itemRectForText(index);
            this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
            var tw = this.textWidth(text);
            var ix = (rect.width - tw) / 2 - 4;
            if (this._actionIcon) { 
                this.drawIcon(this._actionIcon, ix, rect.y + 2);
                ix += 32
            }
            this.drawText(text, ix, rect.y, Graphics.boxWidth);
        };
        */
    }

})();
