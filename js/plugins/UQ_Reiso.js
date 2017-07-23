//
//  霊術、霊素構成、強制憑依、の実装
//

/*:
 * @plugindesc 霊素濃度を使用するスキル関連の実装を追加します。
 * @author UQ
 *
 * @param Original Skill ID
 * @desc スキル「固有術技」のID指定
 * @default 1
 *
 * @param Soul Magic Skill ID
 * @desc スキル「霊術」のID指定
 * @default 2
 *
 * @param Soul Constitute Skill ID
 * @desc スキル「霊素構成」のID指定
 * @default 3
 *
 * @param Forcing Possession Skill ID
 * @desc スキル「強制憑依」のID指定
 * @default 4
 *
 * @param reloadSkillStartIdOfTiany
 * @desc ティアニーのリロードスキルIDの始まり
 * @default 54
 *
 * @param reloadSkillEndIdOfTiany
 * @desc ティアニーのリロードスキルIDの終わり
 * @default 59
 *
 * @param offsetReloadSkillIdToSwitchNoOfTiany
 * @desc ティアニーのリロードスキルIDからスイッチ変数番号へのオフセット
 * @default 7
 *
 * @param reisoSkillStartIdOfTiany
 * @desc ティアニーの霊素構成弾用スキルIDの始まり
 * @default 38
 *
 * @param reisoSkillEndIdOfTiany
 * @desc ティアニーの霊素構成弾用スキルIDの終わり
 * @default 43
 *
 * @param offsetSkillIdToSwitchNoOfTiany
 * @desc ティアニーの霊素構成用スキルIDからスイッチ変数番号へのオフセット
 * @default 23
 *
 * @param forcingPossesionArmorIdStart
 * @desc 強制憑依用の防具IDの始まり
 * @default 52
 *
 * @param forcingPossesionArmorIdEnd
 * @desc 強制憑依用の防具IDの終わり
 * @default 100
 *
 * @param offsetforcingPossesionArmorIdToStateId
 * @desc 強制憑依用の防具IDから強制憑依ステートIDへのオフセット
 * @default −39
 *
 * @param offsetforcingPossesionArmorIdToSkillId
 * @desc 強制憑依用の防具IDから強制憑依スキルIDへのオフセット
 * @default 99
 *
 * @param releasePossesionSkillId
 * @desc 憑依解除スキルID
 * @default 15
 *
 */

(function() {
    
    var parameters = PluginManager.parameters('Reiso');
    var OriginalSkillID = Number(parameters['Original Skill ID'] || 1);
    var soulMagicSkillID = Number(parameters['Soul Magic Skill ID'] || 2);
    var soulConstituteSkillID = Number(parameters['Soul Constitute Skill ID'] || 3);
    var forcingPossessionSkillID = Number(parameters['Forcing Possession Skill ID'] || 4);

    var reloadSkillStartIdOfTiany = Number(parameters['reloadSkillStartIdOfTiany'] || 54);
    var reloadSkillEndIdOfTiany = Number(parameters['reloadSkillEndIdOfTiany'] || 59);
    var offsetReloadSkillIdToSwitchNoOfTiany = Number(parameters['offsetReloadSkillIdToSwitchNoOfTiany'] || 7);    
    var reisoSkillStartIdOfTiany = Number(parameters['reisoSkillStartIdOfTiany'] || 38);
    var reisoSkillEndIdOfTiany = Number(parameters['reisoSkillEndIdOfTiany'] || 43);
    var offsetSkillIdToSwitchNoOfTiany = Number(parameters['offsetSkillIdToSwitchNoOfTiany'] || 23);
    
    var forcingPossesionArmorIdStart = Number(parameters['forcingPossesionArmorIdStart'] || 52);
    var forcingPossesionArmorIdEnd = Number(parameters['forcingPossesionArmorIdEnd'] || 100);
    var offsetforcingPossesionArmorIdToStateId = Number(parameters['offsetforcingPossesionArmorIdToStateId'] || -39);
    var offsetforcingPossesionArmorIdToSkillId = Number(parameters['offsetforcingPossesionArmorIdToSkillId'] || 99);
    
    var releasePossesionSkillId = Number(parameters['releasePossesionSkillId'] || 15);
    
    var parameters = PluginManager.parameters('TurnWindow');
    var variableNoOfSoulPoint = Number(parameters['Soul Point'] || 2);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////スキルの消費コスト関連の実装 start/////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    //体術、霊術、霊素構成、強制憑依の使用可能判定
    Game_BattlerBase.prototype.canPaySkillCost = function(skill) {
        //スキルのノートを取得し<None SP Cost>のコメントがあればコスト消費なし
        console.log($dataSkills);
        console.log("skill");
        console.log(skill);
        var note = skill.note;
        var match = note.search(/None SP Cost/);

        if(((skill.stypeId == soulMagicSkillID) || 
            (skill.stypeId == soulConstituteSkillID) ||
            (skill.stypeId == forcingPossessionSkillID) ||
            (skill.stypeId == OriginalSkillID)) &&
            (match != true))
        {
            //console.log("actorId");
            //console.log(this);
            //console.log(this._actorId);
            //console.log("skill.id");
            //console.log(skill);
            
            //ティアニーの霊素構成用の霊術の使用可否判定
            //霊素構成したかのスイッチ変数をみて判断している
            //ティアニーのアクターIDは1(バトル中のみかは未確認)
            if(this._actorId == 1 &&
               skill.id >= reisoSkillStartIdOfTiany &&
               skill.id <= reisoSkillEndIdOfTiany)
            {
            	console.log($dataSkills[skill.id]);
                //console.log(skill.id + offsetSkillIdToSwitchNoOfTiany);
                //console.log($gameSwitches.value(skill.id + offsetSkillIdToSwitchNoOfTiany));
                return $gameSwitches.value(skill.id + offsetSkillIdToSwitchNoOfTiany) &&
                       this._tp >= this.skillTpCost(skill) && 
                       this._mp >= this.skillMpCost(skill) &&
                       $gameVariables.value(variableNoOfSoulPoint) >= this.skillMpCost(skill);
                       //console.log($gameSystem._sharedSkillPoint);
            }
            else if(this._actorId == 1 &&
                    skill.id >= reloadSkillStartIdOfTiany &&
                    skill.id <= reloadSkillEndIdOfTiany)
            {
            	return !($gameSwitches.value(skill.id + offsetReloadSkillIdToSwitchNoOfTiany)) &&
                       this._tp >= this.skillTpCost(skill) && 
                       this._mp >= this.skillMpCost(skill) &&
                       $gameVariables.value(variableNoOfSoulPoint) >= this.skillMpCost(skill);
            }
            else
            {
                return this._tp >= this.skillTpCost(skill) && 
                       this._mp >= this.skillMpCost(skill) &&
                       $gameVariables.value(variableNoOfSoulPoint) >= this.skillMpCost(skill);
                       //console.log($gameSystem._sharedSkillPoint);
            }
        }
        else
        {
            return this._tp >= this.skillTpCost(skill) && 
                   this._mp >= this.skillMpCost(skill);
        }
    };
    
    //体術、霊術、霊素構成、強制憑依のコスト消費
    Game_BattlerBase.prototype.paySkillCost = function(skill) {
        console.log(this);

        this._mp -= this.skillMpCost(skill);
        this._tp -= this.skillTpCost(skill);

        //スキルのノートを取得し<None SP Cost>のコメントがあればコスト消費なし
        var note = skill.note;
        var match = note.search(/None SP Cost/);

        if(((skill.stypeId == soulMagicSkillID) || 
            (skill.stypeId == soulConstituteSkillID) ||
            (skill.stypeId == forcingPossessionSkillID) ||
            (skill.stypeId == OriginalSkillID)) &&
            (match != true))
        {
            //霊素濃度の消費処理
            $gameVariables.setValue(variableNoOfSoulPoint, $gameVariables.value(variableNoOfSoulPoint) - this.skillMpCost(skill));
        }
        //console.log($gameSystem._sharedSkillPoint);

    };

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////スキルの消費コスト関連の実装 end///////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////「強制憑依」用の実装 start///////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Window_ActorCommand.prototype.makeCommandList = function() {
    if (this._actor) {
    	
    	//var note = skill.note;
    	
        //「通常攻撃」コマンドを削除
        if(this._actor._actorId == 7)
        {
            this.addAttackCommand();
        }
        
        this.addSkillCommands();
        
        //強制憑依中かを判断
        var flgOfPossesion = false;
        for(var i=0;i<(this._actor._states.length);i++)
        {
            if ( this._actor._states[0] >= (forcingPossesionArmorIdStart + offsetforcingPossesionArmorIdToStateId)
            &&   this._actor._states[0] <= (forcingPossesionArmorIdEnd + offsetforcingPossesionArmorIdToStateId) )
            {
                flgOfPossesion = true;
            }
        }
        
        //強制憑依用アイテムを装備している、かつ強制憑依中でないなら、「強制憑依」コマンドを追加
        if ( this._actor._equips[2]._itemId >= forcingPossesionArmorIdStart
        &&   this._actor._equips[2]._itemId <= forcingPossesionArmorIdEnd 
        &&   flgOfPossesion != true)
        {
          this.addForcingPossesionCommnad();
        }
        
        //強制憑依中であれば、  「憑依解除」コマンドを追加
        if ( flgOfPossesion == true )
        {
            this.addReleasePossesionCommnad();
        }
        
        this.addGuardCommand();
        this.addItemCommand();
        //console.log(this._actor._equips[3]._itemId);
        console.log("item");
        console.log(this);
    }
};

//「強制憑依」コマンド追加
Window_ActorCommand.prototype.addForcingPossesionCommnad = function() {
    this.addCommand('強制憑依', 'possession', true);
    //TextManager.possession
};

//「憑依解除」コマンド追加
Window_ActorCommand.prototype.addReleasePossesionCommnad = function() {
    this.addCommand('憑依解除', 'release', true);
    //TextManager.possession
};

//「強制憑依」、「憑依解除」のスキルを選択された際の処理ハンドラを登録
Scene_Battle.prototype.createActorCommandWindow = function() {
    this._actorCommandWindow = new Window_ActorCommand();
    this._actorCommandWindow.setHandler('attack', this.commandAttack.bind(this));
    this._actorCommandWindow.setHandler('skill',  this.commandSkill.bind(this));
    this._actorCommandWindow.setHandler('guard',  this.commandGuard.bind(this));
    this._actorCommandWindow.setHandler('item',   this.commandItem.bind(this));
    this._actorCommandWindow.setHandler('possession',  this.commandForcingPossession.bind(this));
    this._actorCommandWindow.setHandler('release',   this.commandReleasePossession.bind(this));
    this._actorCommandWindow.setHandler('cancel', this.selectPreviousCommand.bind(this));
    this.addWindow(this._actorCommandWindow);
};

//「強制憑依」コマンドを押された際に発動するスキルのIDをセット start
//装備している「装飾品」のIDと順番が同じようにしているため、
//オフセットの値を足した値がスキルIDとなる
Scene_Battle.prototype.commandForcingPossession = function() {
    BattleManager.inputtingAction().setForcingPossession();
    this.selectNextCommand();
};

Game_Action.prototype.setForcingPossession = function() {
    this.setSkill(this.subject().forcingPossessionSkillId());
};

Game_BattlerBase.prototype.forcingPossessionSkillId = function() {
    //console.log("forcingPossessionSkillId");
    //console.log(this);
    return (this._equips[2]._itemId + offsetforcingPossesionArmorIdToSkillId);
};
//「強制憑依」コマンドを押された際に発動するスキルのIDをセット end

//「憑依解除」コマンドを押された際に発動するスキルのIDをセット start
Scene_Battle.prototype.commandReleasePossession = function() {
    BattleManager.inputtingAction().setReleasePossession();
    this.selectNextCommand();
};

Game_Action.prototype.setReleasePossession = function() {
    this.setSkill(this.subject().releasePossessionSkillId());
};

Game_BattlerBase.prototype.releasePossessionSkillId = function() {
    return releasePossesionSkillId;
};
//「憑依解除」コマンドを押された際に発動するスキルのIDをセット end

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////「強制憑依」用の実装 end////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////「霊素構成」用の実装 start//////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Game_Actor.prototype.initMembers = function() {
    Game_Battler.prototype.initMembers.call(this);
    this._actorId = 0;
    this._name = '';
    this._nickname = '';
    this._classId = 0;
    this._level = 0;
    this._characterName = '';
    this._characterIndex = 0;
    this._faceName = '';
    this._faceIndex = 0;
    this._battlerName = '';
    this._exp = {};
    this._skills = [];
    this._equips = [];
    this._actionInputIndex = 0;
    this._lastMenuSkill = new Game_Item();
    this._lastBattleSkill  = new Game_Item();
    this._lastCommandSymbol = '';
    //初期装備の武器IDを保存しておく変数を追加 start
    this._initWeaponNo = 0;
    //初期装備の武器IDを保存しておく変数を追加 end
};

BattleManager.startBattle = function() {
    //console.log("battle start");
    //console.log(this);
    //初期装備の武器IDを保存 start
    for(var i=0;i<(($gameActors._data.length)-1);i++)
    {
        //console.log($gameActors._data);
        //console.log( i + "回目");
        //$gameActors._data[i+1]._initWeaponNo = $gameActors._data[i+1]._equips[0]._itemId;
        //console.log($gameActors._data[i+1]._initWeaponNo);
    }
    $gameActors._data[2]._initWeaponNo = $gameActors._data[2]._equips[0]._itemId;
    //初期装備の武器IDを保存 end
    
    this._phase = 'start';
    $gameSystem.onBattleStart();
    $gameParty.onBattleStart();
    $gameTroop.onBattleStart();
    this.displayStartMessages();
};

BattleManager.updateBattleEnd = function() {
    //console.log("updateBattleEnd");
    //console.log(this);
    //初期装備に戻す start
    for(var i=0;i<(($gameActors._data.length)-1);i++)
    {
        //console.log("battle end init weapon");
        //console.log(i);
        //console.log($gameActors._data);
        //$gameActors._data[i+1]._equips[0]._itemId = $gameActors._data[i+1]._initWeaponNo;
        //console.log($gameActors._data[i+1]._initWeaponNo);
    }
    $gameActors._data[2]._equips[0]._itemId = $gameActors._data[2]._initWeaponNo;
    //初期装備に戻す end   
    
    //console.log("battle end flag ON");
    if (this.isBattleTest()) {
        AudioManager.stopBgm();
        SceneManager.exit();
    } else if ($gameParty.isAllDead()) {
        if (this._canLose) {
            $gameParty.reviveBattleMembers();
            SceneManager.pop();
        } else {
            SceneManager.goto(Scene_Gameover);
        }
    } else {
        SceneManager.pop();
    }
    this._phase = null;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////「霊素構成」用の実装 end//////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//「かばう」の発動条件を「HP 1/4」 -> 「HP 1/2」に変更
//「かばう」の発動条件が、「瀕死となった味方へ」なので、
//瀕死の条件を「HP 1/4」 -> 「HP 1/2」に変更
Game_BattlerBase.prototype.isDying = function() {
    return this.isAlive() && this._hp < this.mhp / 2;
};
    
})();
    