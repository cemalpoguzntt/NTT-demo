$('head').append('<link rel="stylesheet" type="text/css" href="/XMII/CM/ECZ_GEBZE_MES/COMMON/css/simpleAnimations.css">');
sap.ui.define([
], function (
) {
	"use strict";
	/* 2023 Tayyib Bayram: 
	*/
	
	return {


		/**
		 * 
		 * @param {object} control control or domref
		 * @param {number} duration if set to 0 you must remove the class yourself
		 * @param {number} strength between 0-1, min opacity that it reaches
		 * @param {number} interval 
		 * @returns removingFunction 
		 */
		blink: function(control, duration, strength = 0.5, interval = 1){
			const cssClass = "simpleBlink";
			if(control.getDomRef) control = control.getDomRef();
			control.classList.add(cssClass);
			control.style.setProperty("--"+cssClass+"-strength", strength);
			control.style.setProperty("--"+cssClass+"-interval", interval+"s");
			
			return this._removeStyle(()=>{
				control.style.removeProperty("--"+cssClass+"-strength");
				control.style.removeProperty("--"+cssClass+"-interval");
				control.classList.remove(cssClass);
			}, duration);
		},

		/**
		 * 
		 * @param {object} control control or domref
		 * @param {number} duration if set to 0 you must remove the class yourself
		 * @param {string} color1 hex or color name
		 * @param {string} color2 hex or color name
		 * @param {number} interval 
		 * @returns removingFunction
		 */
		colorBlink: function(control, duration, color1="white", color2="#22a043", interval = 1){
			const cssClass = "colorBlink";
			if(control.getDomRef) control = control.getDomRef();
			control.classList.add(cssClass);
			control.style.setProperty("--"+cssClass+"-color1", color1);
			control.style.setProperty("--"+cssClass+"-color2", color2);
			control.style.setProperty("--"+cssClass+"-interval", interval+"s");
			
			return this._removeStyle(()=>{
				control.style.removeProperty("--"+cssClass+"-color1");
				control.style.removeProperty("--"+cssClass+"-color2");
				control.style.removeProperty("--"+cssClass+"-interval");
				control.classList.remove(cssClass);
			}, duration);
		},


		shake: function(control, duration, speed = 1, strength = 2){
			const cssClass = "shake";
			if(control.getDomRef) control = control.getDomRef();
			control.classList.add(cssClass);
			control.style.setProperty("--"+cssClass+"-speed", speed+"s");
			control.style.setProperty("--"+cssClass+"-strength", strength + "deg");
			control.style.setProperty("--"+cssClass+"-strengthStrong", strength*2+"deg");
			control.style.setProperty("--"+cssClass+"-strengthR", (-strength) + "deg");
			control.style.setProperty("--"+cssClass+"-strengthRStrong", (-strength*2)+"deg");
			
			return this._removeStyle(()=>{
				control.style.removeProperty("--"+cssClass+"-speed");
				control.style.removeProperty("--"+cssClass+"-strength");
				control.style.removeProperty("--"+cssClass+"-strengthStrong");
				control.style.removeProperty("--"+cssClass+"-strengthR");
				control.style.removeProperty("--"+cssClass+"-strengthRStrong");
				control.classList.remove(cssClass);
			}, duration);
		},




		_removeStyle(removingFunction, duration){
			let timeout = null;
			if(duration != 0){
				timeout = setTimeout(()=>{
					removeGeneral();
				}, duration * 1000);
			}

			function removeGeneral(){
				removingFunction();
				if(timeout) clearTimeout(timeout);
			}
			return removeGeneral;
		}
		
	}
});
