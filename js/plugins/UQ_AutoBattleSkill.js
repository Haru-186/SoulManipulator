//
//  自動戦闘中の使用スキル設定プラグン
//

/*:
 * @plugindesc 自動戦闘中の使用スキル設定の実装を追加します。
 * @author UQ
 *
 * @param Skill ID 1
 * @desc 1番目に使うスキルのID指定
 * @default 1
 *
 * @param Skill ID 2
 * @desc 2番目に使うスキルのID指定
 * @default 247
 *
 * @param Skill ID 3
 * @desc 3番目に使うスキルのID指定
 * @default 248
 *
  * @param Skill ID 4
 * @desc 4番目に使うスキルのID指定
 * @default 249
 *
 * @param Skill ID 5
 * @desc 5番目に使うスキルのID指定
 * @default 250
 *
 * @param Skill ID List
 * @desc 自動戦闘で使用するスキルのリスト
 * @default 1
 */

var Imported = Imported || {};
Imported.UQ_AutpBattleSkill = true;

var UQ_AutpBattleSkill = {};

(function() {
    
    var parameters = PluginManager.parameters('UQ_AutoBattleSkill');
    var skillID1 = Number(parameters['Skill ID 1'] || 247);
    var skillID2 = Number(parameters['Skill ID 2'] || 248);
    var skillID3 = Number(parameters['Skill ID 3'] || 249);
    var skillID4 = Number(parameters['Skill ID 4'] || 250);
    var skillID5 = Number(parameters['Skill ID 5'] || 251);
    //var skillIdList = String(parameters['Skill ID List'] || 1));

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////自動戦闘中の使用スキル設定の実装 start//////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var autoSkillIndex = 0;

Game_Actor.prototype.makeActions = function() {
    Game_Battler.prototype.makeActions.call(this);
    var skillArray = [skillID1, skillID2, skillID3, skillID4, skillID5];
    if (this.numActions() > 0) {
        this.setActionState('undecided');
    } else {
        this.setActionState('waiting');
    }
    if (this.isAutoBattle()) {
    	console.log("Game_Actor.prototype.makeActions");
    	console.log(this);
        this.makeAutoBattleActions();
        console.log("Game_Actor.prototype.makeActions");
    	console.log(this);
    	//this._actions[0]._item._dataclass = "skill";
    	//this._actions[0]._item._itemid = 1;
    	console.log(autoSkillIndex);
    	console.log(autoSkillIndex%5);
    	console.log(skillArray[autoSkillIndex%5]);
    	this._actions[0].setSkill(skillArray[autoSkillIndex%5]);
    	//this._actions[0].setSkill(Number(skillIdList));
    	this._actions[0]._targetIndex = 0;
    	//this._actions[0].decideRandomTarget;
    	autoSkillIndex++;
    } else if (this.isConfused()) {
        this.makeConfusionActions();
    }
};
	
})();
	