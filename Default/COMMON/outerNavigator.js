sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/m/library",
], function (
	URIParameters,
	MobileLibrary
) {
	"use strict";
	/* 2023 Tayyib Bayram: Used for link navigations where you need to pass data. 
		You can pass data by local/session storage or using link parameter.
	*/
	const separator = "-.-";
	const idPrefix = "OutNav";
	// Change this when project changes
	const MAIN_FOLDER_LOCATION = "/XMII/CM/ECZ_GEBZE_MES/";
	const URLHelper = MobileLibrary.URLHelper;
	return {

		/**
		 * 
		 * @param {string} folderPath finalProductOrderScreen/webapp
		 * @param {boolean} bNewWindow 
		 */
		redirect(folderPath, bNewWindow) {
			const url = window.location.origin + MAIN_FOLDER_LOCATION + folderPath + "/index.html";
			URLHelper.redirect(url, bNewWindow);
		},

		/**
		 * 
		 * @param {string} folderPath finalProductOrderScreen/webapp
		 * @param {object} params key value object
		 * @param {string} target _self, _blank, _parent, _top,
		 * @param {string} windowFeatures ex: "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400"
		 */

		open: function (folderPath, params = null, target = '_self', windowFeatures = '') {
			let url = window.location.origin + MAIN_FOLDER_LOCATION + folderPath + "/index.html";
			if (params) {
				let i = 0;
				for (const key in params) {
					if (i === 0) {
						url += "?";
					} else {
						url += "&";
					}
					url += key + '=' + params[key];
					i++;
				}
			}
			window.open(url, target, windowFeatures)
		},

		/**
		 * 
		 * @param {string} folderPath finalProductOrderScreen/webapp no slashed at the end or beggining
		 * @param {object} params key value object
		 */
		openSelf: function (folderPath, params = null) {
			this.open(folderPath, params, '_self')
		},

		/**
		 * 
		 * @returns gets datas in the link
		 */
		getURIData() {
			const query = URIParameters.fromQuery(window.location.search);
			const keys = query.keys();
			let data = {};
			for (const key of keys) {
				const values = query.getAll(key);
				if (values.length == 1) {
					data[key] = values[0];
				}
				else {
					data[key] = values;
				}
			}
			return data;
		},



		/**
		 * Every window can access this data
		 * @param {string} id 
		 * @param {string} sender semiProductOrder
		 * @param {string} receiver productionStoppageScreen
		 * @param {string} data 
		 */
		setLocalData(id, sender, receiver, data) {
			this._checkID();
			if (typeof data != 'string') {
				data = JSON.stringify(data);
			}
			localStorage.setItem(this._getKeyValue(id, sender, receiver), data);
		},

		/**
		 * 
		 * @param {string} id 
		 * @param {boolean} parse if true json parse
		 * @returns data
		 */
		getLocalData(id, sender, receiver, parse = false) {
			this._checkID();
			const item = localStorage.getItem(this._getKeyValue(id, sender, receiver));
			return parse ? JSON.parse(item) : item;
		},


		/**
		 * Only this window can access this data (If you duplicate the window the storage will be copied)
		 * @param {string} id 
		 * @param {string} sender semiProductOrder
		 * @param {string} receiver productionStoppageScreen
		 * @param {string} data 
		 */
		setData(id, sender, receiver, data) {
			this._checkID();
			if (typeof data != 'string') {
				data = JSON.stringify(data);
			}
			sessionStorage.setItem(this._getKeyValue(id, sender, receiver), data);
		},


		/**
		 * 
		 * @param {string} id 
		 *  @param {boolean} parse if true json parse
		 * @returns data
		 */
		getData(id, sender, receiver, parse = false) {
			this._checkID();
			const item = sessionStorage.getItem(this._getKeyValue(id, sender, receiver));
			return parse ? JSON.parse(item) : item;
		},


		/**
		 * Every window can access this data if they know the tab id (couldnt find use for this)
		 * @param {string} id 
		 * @param {string} data 
		 */
		setPrivateData(id, data) {
			this._checkID();
			if (typeof data != 'string') {
				data = JSON.stringify(data);
			}
			localStorage.setItem(idPrefix + this.id + id, data);
		},

		getPrivateData(id, parse = false) {
			this._checkID();
			return parse ? JSON.parse(localStorage.getItem(idPrefix + this.id + id)) : localStorage.getItem(idPrefix + this.id + id);
		},


		_getKeyValue(id, sender, receiver) {
			return idPrefix + id + separator + sender + separator + receiver;
		},

		/**
		 * @private
		 */
		_checkID: function () {
			if (this.id) return;
			this.id = sessionStorage.getItem("tabID");
			if (this.id == null) {
				let localID = localStorage.getItem("lastTabID");
				this.id = (localID == null) ? 1000 : new Number(localID) + 1;
				localStorage.setItem("lastTabID", this.id);
				sessionStorage.setItem("tabID", this.id);
			}
		},
	}
});
