//==============================================================================
// dsGainLpResult01.js
// Copyright (c) 2016 Douraku
// Released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//==============================================================================

/*:
 * @plugindesc LP獲得リザルト画面01プラグイン ver1.00
 * @author 道楽
 *
 * @param Left Side Width
 * @desc 左側の表示領域の横幅
 * @default 260
 *
 * @param Skill Disp Time
 * @desc スキル習得の表示時間
 * @default 10
 */

var Imported = Imported || {};
Imported.dsGainLpResult01 = true;

var dsGainLpResult01 = {};

(function(ns) {

	ns.Param = (function() {
		var ret = {};
		var parameters = PluginManager.parameters('dsGainLpResult01');
		ret.LeftSideWidth = Number(parameters['Left Side Width']);
		ret.SkillDispTime = Number(parameters['Skill Disp Time']);
		return ret;
	})();

	if ( Imported.YEP_VictoryAftermath &&
	     Imported.dsEquipmentSkillLearning &&
	     dsEquipmentSkillLearning.Param.LpAftermathEnable )
	{
		//--------------------------------------------------------------------------
		/** Window_VictoryExp */
		var _Window_VictoryExp_initialize = Window_VictoryExp.prototype.initialize;
		Window_VictoryExp.prototype.initialize = function()
		{
			_Window_VictoryExp_initialize.call(this);
			this.setupMaxSkills();
		};

		Window_VictoryExp.prototype.setupMaxSkills = function(index)
		{
			this._maxSkills = 0;
			$gameParty.battleMembers().forEach(function(actor) {
				var skillNum = actor._victorySkills.length;
				skillNum += actor.victoryLpSkills().length;
				this._maxSkills = Math.max(skillNum, this._maxSkills);
			}, this);
		};

		Window_VictoryExp.prototype.updateTicks = function()
		{
			var tickMax = Yanfly.Param.VAGaugeTicks + ns.Param.SkillDispTime * this._maxSkills;
			if ( this._tick >= tickMax )
			{
				return;
			}
			if ( Graphics.frameCount % 4 !== 0 )
			{
				return;
			}
			if ( Input.isPressed('ok') || TouchInput.isPressed() )
			{
				this._tick = tickMax;
			}
			else
			{
				this._tick += 1;
			}
			this.drawAllGauges();
		};

		Window_VictoryExp.prototype.gaugeRect = function(index)
		{
			var rect = this.itemRect(index);
			var fw = Window_Base._faceWidth;
			rect.x += fw + this.standardPadding() * 2;
			rect.width -= fw + this.standardPadding() * 2;
			return rect;
		};

		var _Window_VictoryExp_drawActorGauge = Window_VictoryExp.prototype.drawActorGauge;
		Window_VictoryExp.prototype.drawActorGauge = function(actor, index)
		{
			_Window_VictoryExp_drawActorGauge.call(this, actor, index);
			var rect = this.gaugeRect(index);
			this.drawLpGained(actor, rect);
		};

		Window_VictoryExp.prototype.actorExpRate = function(actor)
		{
			var actorLv = actor._preVictoryLv;
			if ( actorLv === actor.maxLevel() )
			{
				return 1.0;
			}
			var tick = Math.min(this._tick, Yanfly.Param.VAGaugeTicks);
			var bonusExp = 1.0 * actor._expGained * tick / Yanfly.Param.VAGaugeTicks;
			var nowExp = actor._preVictoryExp - actor.expForLevel(actorLv) + bonusExp;
			var nextExp = actor.expForLevel(actorLv + 1) - actor.expForLevel(actorLv);
			return (1.0 * nowExp / nextExp).clamp(0.0, 1.0);
		};

		Window_VictoryExp.prototype.drawExpGauge = function(actor, rect)
		{
			var wx = rect.x + ns.Param.LeftSideWidth + 2;
			var wy = rect.y + this.lineHeight();
			var ww = rect.width - ns.Param.LeftSideWidth;
			var rate = this.actorExpRate(actor);
			if ( rate >= 1.0 )
			{
				var color1 = this.textColor(Yanfly.Param.ColorLv1);
				var color2 = this.textColor(Yanfly.Param.ColorLv2);
			}
			else
			{
				var color1 = this.textColor(Yanfly.Param.ColorExp1);
				var color2 = this.textColor(Yanfly.Param.ColorExp2);
			}
			this.drawGauge(wx, wy, ww, rate, color1, color2);
		};

		Window_VictoryExp.prototype.drawExpValues = function(actor, rect)
		{
			var wx = rect.x + ns.Param.LeftSideWidth + 2;
			var wy = rect.y + this.lineHeight();
			var ww = rect.width  - ns.Param.LeftSideWidth - 4;
			var actorLv = actor._preVictoryLv;
			var tick = Math.min(this._tick, Yanfly.Param.VAGaugeTicks);
			var bonusExp = 1.0 * actor._expGained * tick / Yanfly.Param.VAGaugeTicks;
			var nowExp = actor._preVictoryExp - actor.expForLevel(actorLv) + bonusExp;
			var nextExp = actor.expForLevel(actorLv + 1) - actor.expForLevel(actorLv);
			if ( actorLv === actor.maxLevel() )
			{
				var text = Yanfly.Param.VAMaxLv;
			}
			else if ( nowExp >= nextExp )
			{
				var text = Yanfly.Param.VALevelUp;
			}
			else
			{
				var text = Yanfly.Util.toGroup(parseInt(nextExp - nowExp));
			}
			this.changeTextColor(this.normalColor());
			this.drawText(text, wx, wy, ww, 'right');
		};

		Window_VictoryExp.prototype.drawExpGained = function(actor, rect)
		{
			var wx = rect.x + 2;
			var wy = rect.y + this.lineHeight() * 1;
			var ww = ns.Param.LeftSideWidth - 4;
			if ( wy < rect.y + rect.height )
			{
				var tick = Math.min(this._tick, Yanfly.Param.VAGaugeTicks);
				var bonusExp = 1.0 * actor._expGained * tick / Yanfly.Param.VAGaugeTicks;
				var expParse = Yanfly.Util.toGroup(parseInt(bonusExp));
				var expText = Yanfly.Param.VAGainedExpfmt.format(expParse);
				this.changeTextColor(this.systemColor());
				this.drawText(Yanfly.Param.VAGainedExp, wx, wy, ww, 'left');
				this.changeTextColor(this.normalColor());
				this.drawText(expText, wx, wy, ww, 'right');
			}
		};

		Window_VictoryExp.prototype.drawLpGained = function(actor, rect)
		{
			var value = actor.battleLp();
			var text = dsEquipmentSkillLearning.Param.LpAftermathFormat.format(value, dsEquipmentSkillLearning.Param.Lp);
			var textWidth = this.textWidthEx(text);
			var wx = rect.x;
			var wy = rect.y + this.lineHeight() * 2;
			var ww = ns.Param.LeftSideWidth - 4;
			this.changeTextColor(this.systemColor());
			this.drawText(dsEquipmentSkillLearning.Param.LpAftermathEarned, wx + 2, wy, ww - 4, 'left');
			this.resetTextColor();
			this.drawTextEx(text, wx + ww - textWidth, wy);
		};

		Window_VictoryExp.prototype.drawGainedSkills = function(actor, rect)
		{
			var skills = actor._victorySkills.concat(actor.victoryLpSkills());
			if ( skills.length <= 0 )
			{
				return;
			}
			if ( !this.meetDrawGainedSkillsCondition(actor) )
			{
				return;
			}
			var wx = rect.x + ns.Param.LeftSideWidth + 2;
			var wy = rect.y + this.lineHeight() * 2;
			var ww = rect.width - ns.Param.LeftSideWidth - 4;
			var dispIndex = Math.floor((this._tick - Yanfly.Param.VAGaugeTicks) / ns.Param.SkillDispTime);
			dispIndex = Math.min(dispIndex, skills.length - 1);
			var skillId = skills[dispIndex];
			var skill = $dataSkills[skillId];
			if ( skill )
			{
				var text = '\\i[' + skill.iconIndex + ']' + skill.name;
				text = TextManager.obtainSkill.format(text);
				this.drawTextEx(text, wx, wy);
			}
		};

		var _Window_VictoryExp_meetDrawGainedSkillsCondition = Window_VictoryExp.prototype.meetDrawGainedSkillsCondition;
		Window_VictoryExp.prototype.meetDrawGainedSkillsCondition = function(actor)
		{
			if ( this._tick < Yanfly.Param.VAGaugeTicks )
			{
				return false;
			}
			return _Window_VictoryExp_meetDrawGainedSkillsCondition.call(this, actor);
		};

		Window_VictoryExp.prototype.isReady = function()
		{
			var tickMax = Yanfly.Param.VAGaugeTicks + ns.Param.SkillDispTime * this._maxSkills;
			return this._tick >= tickMax;
		};

		//--------------------------------------------------------------------------
		/** Window_VictorySkill */
		ns.Window_VictorySkill = (function() {

			function Window_VictorySkill()
			{
				this.initialize.apply(this, arguments);
			}

			Window_VictorySkill.prototype = Object.create(Window_VictoryExp.prototype);
			Window_VictorySkill.prototype.constructor = Window_VictorySkill;

			Window_VictorySkill.prototype.drawActorGauge = function(actor, index)
			{
				var rect = this.gaugeRect(index);
				this.clearGaugeRect(index);
				this.resetTextColor();
				this.drawActorName(actor, rect.x + 2, rect.y);
				this.drawLevel(actor, rect);
				this.drawGainedSkills(actor, rect);
			};

			Window_VictorySkill.prototype.drawGainedSkills = function(actor, rect)
			{
				if ( !this.meetDrawGainedSkillsCondition(actor) )
				{
					return;
				}
				var victorySkills = actor.victoryLpSkills();
				if ( victorySkills )
				{
					var wy = rect.y;
					victorySkills.forEach(function(skillId) {
						if ( wy + this.lineHeight() <= rect.y + rect.height )
						{
							var skill = $dataSkills[skillId];
							if ( skill )
							{
								var text = '\\i[' + skill.iconIndex + ']' + skill.name;
								text = TextManager.obtainSkill.format(text);
								var ww = this.textWidthEx(text);
								var wx = rect.x + (rect.width - ww) / 2;
								this.drawTextEx(text, wx, wy);
								wy += this.lineHeight();
							}
						}
					}, this);
				}
			};

			Window_VictorySkill.prototype.meetDrawGainedSkillsCondition = function(actor)
			{
				return true;
			};

			Window_VictorySkill.prototype.actorExpRate = function(actor)
			{
				return 1.0;
			};

			return Window_VictorySkill;
		})();

		//--------------------------------------------------------------------------
		/** Scene_Battle */
		var _Scene_Battle_addCustomVictorySteps = Scene_Battle.prototype.addCustomVictorySteps;
		Scene_Battle.prototype.addCustomVictorySteps = function(array)
		{
			array = _Scene_Battle_addCustomVictorySteps.call(this, array);
			var stepLpIdx = array.indexOf("LP");
			if ( stepLpIdx >= 0 )
			{
				array.splice(stepLpIdx, 1);
			}
			return array;
		};
	}

})(dsGainLpResult01);

