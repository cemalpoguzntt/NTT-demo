sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Label",
    "sap/m/Text",
    "sap/m/Button",
    "sap/m/Dialog",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "common/transactionCaller",
    "sap/ui/comp/smartvariants/PersonalizableInfo"
  ],
  function (
    Controller,
    JSONModel,
    Label,
    Text,
    Button,
    Dialog,
    Filter,
    FilterOperator,
    TransactionCaller,
    PersonalizableInfo
  ) {
    "use strict";

    return Controller.extend("MES/CustomActivity/ProductionConfirm/logScreen", {
      onInit: function () {
        this.getTrx();
        this.getKey();
        this.getLogs({}, this);

        this.applyData = this.applyData.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.getFiltersWithValues = this.getFiltersWithValues.bind(this);

        //   this.oSmartVariantManagement = this.getView().byId("svm");
        this.oExpandedLabel = this.getView().byId("expandedLabel");
        this.oSnappedLabel = this.getView().byId("snappedLabel");
        this.oFilterBar = this.getView().byId("filterbar");
        this.oTable = this.getView().byId("table");

        this.oFilterBar.registerFetchData(this.fetchData);
        this.oFilterBar.registerApplyData(this.applyData);
        this.oFilterBar.registerGetFiltersWithValues(this.getFiltersWithValues);

        var oPersInfo = new PersonalizableInfo({
          type: "filterBar",
          keyName: "persistencyKey",
          dataSource: "",
          control: this.oFilterBar
        });
        //   this.oSmartVariantManagement.addPersonalizableControl(oPersInfo);
        //   this.oSmartVariantManagement.initialise(function () {},
        //   this.oFilterBar);
      },

      onExit: function () {
        //   this.oSmartVariantManagement = null;
        this.oExpandedLabel = null;
        this.oSnappedLabel = null;
        this.oFilterBar = null;
        this.oTable = null;
      },

      fetchData: function () {
        var aData = this.oFilterBar
          .getAllFilterItems()
          .reduce(function (aResult, oFilterItem) {
            aResult.push({
              groupName: oFilterItem.getGroupName(),
              fieldName: oFilterItem.getName(),
              fieldData: oFilterItem.getControl().getSelectedKeys()
            });

            return aResult;
          }, []);

        return aData;
      },

      applyData: function (aData) {
        aData.forEach(function (oDataObject) {
          var oControl = this.oFilterBar.determineControlByName(
            oDataObject.fieldName,
            oDataObject.groupName
          );
          oControl.setSelectedKeys(oDataObject.fieldData);
        }, this);
      },

      getFiltersWithValues: function () {
        var aFiltersWithValue = this.oFilterBar
          .getFilterGroupItems()
          .reduce(function (aResult, oFilterGroupItem) {
            var oControl = oFilterGroupItem.getControl();

            if (
              oControl &&
              oControl.getSelectedKeys &&
              oControl.getSelectedKeys().length > 0
            ) {
              aResult.push(oFilterGroupItem);
            }

            return aResult;
          }, []);

        return aFiltersWithValue;
      },

      onSelectionChange: function (oEvent) {
        //   this.oSmartVariantManagement.currentVariantSetModified(true);
        this.oFilterBar.fireFilterChange(oEvent);
      },

      onSearch: function () {
        let params = {};
        this.oFilterBar
          .getFilterGroupItems()
          .reduce(function (aResult, oFilterGroupItem) {
            var oControl = oFilterGroupItem.getControl();
            if (oControl.getSelectedKey) {
              params[
                oControl.getId().split("--")[
                  oControl.getId().split("--").length - 1
                ]
              ] = oControl.getSelectedKey() || oControl.getValue();
            } else if (oControl.getValue) {
              params[
                oControl.getId().split("--")[
                  oControl.getId().split("--").length - 1
                ]
              ] = oControl.getValue() || "";
            }
            return aResult;
          }, []);
        params.I_ROW_LIMIT = params.I_ROW_LIMIT || 100;
        for (const key in params) {
          if (isNaN(params[key])) {
            params[key] = params[key].replace(/%/g, "%25").toUpperCase();
          }
        }
        this.getLogs(params, this);
      },
      getLogs: function (params, _this) {
        TransactionCaller.async(
          "ECZ_GEBZE_MES/LOG_SCREEN/T_GET_LOGS",
          params,
          "O_JSON",
          _this.getLogsCB,
          _this,
          "GET"
        );
      },
      getLogsCB: function (iv_data, iv_scope) {
        var myModel = new sap.ui.model.json.JSONModel(),
          dataArray;
        if (iv_data[1] == "E") {
          MessageBox.error(iv_data[0]);
          iv_scope.getView().byId("idLogTable").setModel(myModel);
        } else {
          if (Array.isArray(iv_data[0].Rowsets?.Rowset?.Row)) {
            dataArray = iv_data[0].Rowsets.Rowset.Row;
          } else if (!iv_data[0].Rowsets?.Rowset?.Row) {
            dataArray = [];
          } else {
            var dummyData = [];
            dummyData.push(iv_data[0].Rowsets.Rowset.Row);
            dataArray = dummyData;
          }
          for (let i = 0; i < dataArray.length; i++) {
            const element = dataArray[i];
            element.MESSAGE = element.MESSAGE?.replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&amp;/g, "&");
          }
          myModel.setData(dataArray);
          myModel.setSizeLimit(1000);
          iv_scope.getView().byId("idLogTable").setModel(myModel);
        }
      },
      getTrx: function () {
        TransactionCaller.async(
          "ECZ_GEBZE_MES/LOG_SCREEN/T_GET_TRX",
          {},
          "O_JSON",
          this.getTrxCB,
          this,
          "GET"
        );
      },
      getTrxCB: function (iv_data, iv_scope) {
        var myModel = new sap.ui.model.json.JSONModel(),
          dataArray;
        if (iv_data[1] == "E") {
          MessageBox.error(iv_data[0]);
          iv_scope.getView().byId("I_PATH").setModel(myModel);
        } else {
          if (Array.isArray(iv_data[0].Rowsets?.Rowset?.Row)) {
            dataArray = iv_data[0].Rowsets.Rowset.Row;
          } else if (!iv_data[0].Rowsets?.Rowset?.Row) {
            dataArray = [];
          } else {
            var dummyData = [];
            dummyData.push(iv_data[0].Rowsets.Rowset.Row);
            dataArray = dummyData;
          }
          myModel.setData(dataArray);
          myModel.setSizeLimit(1000);
          iv_scope.getView().byId("I_PATH").setModel(myModel);
        }
      },
      getKey: function () {
        TransactionCaller.async(
          "ECZ_GEBZE_MES/LOG_SCREEN/T_GET_KEY",
          {},
          "O_JSON",
          this.getKeyCB,
          this,
          "GET"
        );
      },
      getKeyCB: function (iv_data, iv_scope) {
        var myModel = new sap.ui.model.json.JSONModel(),
          dataArray;
        if (iv_data[1] == "E") {
          MessageBox.error(iv_data[0]);
          iv_scope.getView().byId("I_KEY").setModel(myModel);
        } else {
          if (Array.isArray(iv_data[0].Rowsets?.Rowset?.Row)) {
            dataArray = iv_data[0].Rowsets.Rowset.Row;
          } else if (!iv_data[0].Rowsets?.Rowset?.Row) {
            dataArray = [];
          } else {
            var dummyData = [];
            dummyData.push(iv_data[0].Rowsets.Rowset.Row);
            dataArray = dummyData;
          }
          myModel.setData(dataArray);
          myModel.setSizeLimit(1000);
          iv_scope.getView().byId("I_KEY").setModel(myModel);
        }
      },
      showDetail: function (oEvent) {
        let tableData = oEvent.getSource().getModel().oData,
          sPath = oEvent.getSource().getBindingContext().sPath,
          index = sPath.split("/")[sPath.split("/").length - 1];
        this.dialog = new Dialog({
          title: "Mesaj içeriği",
          content: new Text({
            text: tableData[index].MESSAGE,
            renderWhitespace: true
          }),
          endButton: new Button({
            text: "Kapat",
            press: function () {
              this.dialog.destroy();
            }.bind(this)
          })
        });

        // to get access to the controller's model
        //this.getView().addDependent(this.dialog);

        this.dialog.open();
      },
      onFilterChange: function () {
        this._updateLabelsAndTable();
      },

      onAfterVariantLoad: function () {
        this._updateLabelsAndTable();
      },

      getFormattedSummaryText: function () {
        var aFiltersWithValues = this.oFilterBar.retrieveFiltersWithValues();

        if (aFiltersWithValues.length === 0) {
          return "No filters active";
        }

        if (aFiltersWithValues.length === 1) {
          return (
            aFiltersWithValues.length +
            " filter active: " +
            aFiltersWithValues.join(", ")
          );
        }

        return (
          aFiltersWithValues.length +
          " filters active: " +
          aFiltersWithValues.join(", ")
        );
      },

      getFormattedSummaryTextExpanded: function () {
        var aFiltersWithValues = this.oFilterBar.retrieveFiltersWithValues();

        if (aFiltersWithValues.length === 0) {
          return "No filters active";
        }

        var sText = aFiltersWithValues.length + " filters active",
          aNonVisibleFiltersWithValues =
            this.oFilterBar.retrieveNonVisibleFiltersWithValues();

        if (aFiltersWithValues.length === 1) {
          sText = aFiltersWithValues.length + " filter active";
        }

        if (
          aNonVisibleFiltersWithValues &&
          aNonVisibleFiltersWithValues.length > 0
        ) {
          sText += " (" + aNonVisibleFiltersWithValues.length + " hidden)";
        }

        return sText;
      },

      _updateLabelsAndTable: function () {
        this.oExpandedLabel.setText(this.getFormattedSummaryTextExpanded());
        this.oSnappedLabel.setText(this.getFormattedSummaryText());
        this.oTable.setShowOverlay(true);
      }
    });
  }
);