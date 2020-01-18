sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("yt.sample.reportpagingSAMPLE_REPORT_PAGING.controller.App", {
		_aTableData: [],
		_aTableFilters: [],
		_oTableSort: {},
		_devicePhone: false,
		_deviceTablet: false,
		_selectedCount: "",
		_reportData: [],
		pressButton: function (params) {
			// this._aTableData = oTable.getModel("modelProducts").getData().ProductCollection;
		},
		_sortAndFilterTable: function (aData) {

			if (!(aData.length > 0)) return aData;


			for (var i = 0; i < this._aTableFilters.length; i++) {

				var oTableFilters = this._aTableFilters[i];

				var fieldType = typeof aData[0][oTableFilters.filterProp];

				if (oTableFilters.filterValue !== null && oTableFilters.filterValue !== "") {
					for (var k = 0; k < aData.length; k++) {
						var tableRow = aData[k];

						if (oTableFilters.filterOperator === "Contains") {
							if (!((tableRow[oTableFilters.filterProp]).toString().includes(oTableFilters.filterValue))) {
								aData.splice(k, 1);
								k--;
							}

						}
						else if (oTableFilters.filterOperator === "EQ") {

							if (fieldType === "object") {

								var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
									pattern: "dd.M.yyyy"
								});

								var compValue = oDateFormat.format(tableRow[oTableFilters.filterProp])

								if (!(compValue === oTableFilters.filterValue)) {
									aData.splice(k, 1);
									k--;
								}
							}
							else {
								if (!((tableRow[oTableFilters.filterProp]).toString() === oTableFilters.filterValue)) {
									aData.splice(k, 1);
									k--;
								}
							}
						}
					}
				}
			}
			// }

			if (!(aData.length > 0)) return aData;

			if (this._oTableSort.sortProperty !== undefined) {
				aData.sort(function (a, b) {

					switch (fieldType) {
						case "string":
							var textA = a[this._oTableSort.sortProperty].toUpperCase();
							var textB = b[this._oTableSort.sortProperty].toUpperCase();

							if (this._oTableSort.sortOrder === "Ascending") {
								return textA.localeCompare(textB);
								// return (a[this._oTableSort.sortProperty] - b[this._oTableSort.sortProperty])
							}
							else if ((this._oTableSort.sortOrder === "Descending")) {
								return textB.localeCompare(textA);
								// return (b[this._oTableSort.sortProperty] - a[this._oTableSort.sortProperty])
							}
							// return textA.localeCompare(textB);
							// return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
							break;
						default:

							if (this._oTableSort.sortOrder === "Ascending") {

								if (a[this._oTableSort.sortProperty] > b[this._oTableSort.sortProperty]) {
									return 1;
								}
								if (b[this._oTableSort.sortProperty] > a[this._oTableSort.sortProperty]) {
									return -1;
								}
								return 0;

								// return (a[this._oTableSort.sortProperty] - b[this._oTableSort.sortProperty])
							}
							else if ((this._oTableSort.sortOrder === "Descending")) {
								if (a[this._oTableSort.sortProperty] > b[this._oTableSort.sortProperty]) {
									return -1;
								}
								if (b[this._oTableSort.sortProperty] > a[this._oTableSort.sortProperty]) {
									return 1;
								}
								return 0;
								// return (b[this._oTableSort.sortProperty] - a[this._oTableSort.sortProperty])
							}

					}

				}.bind(this));
			}

			return aData;


		},

		filterGlobally: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;

			var aTablex = this._reportData.slice(0);
			var foundKey = "";

			for (var k = 0; k < aTablex.length; k++) {
				var tableRow = aTablex[k];


				Object.keys(tableRow).forEach(function (key) {
					var value = tableRow[key];
					if (key !== "__metadata") {
						if (value.toString() !== "") {
							if (value.toString().includes(sQuery.toString())) {
								foundKey = key;
							}
						}
					}
				});
			}
			if (foundKey !== "") {
				var filterProp = foundKey;
				var filterValue = sQuery;
				var filterOperator = "Contains";
				this._aTableFilters.push(
					{
						filterProp: filterProp,
						filterValue: filterValue,
						filterOperator: filterOperator
					}
				);


				var aTable = this._sortAndFilterTable(aTablex);
			}

			else {
				aTable = [];
			}


			this.addPaginator("productTable", aTable);
		},
		clearAllFilters: function (oEvent) {
			var oTable = this.byId("productTable");

			// var oUiModel = this.getView().getModel("ui");
			// oUiModel.setProperty("/globalFilter", "");


			this.getView().byId("searchGlobal").setValue(null);

			// this._oGlobalFilter = null;
			// this._oPriceFilter = null;
			// this._filter();

			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				oTable.filter(aColumns[i], null);
			}

			this.addPaginator("productTable", this._reportData);
		},

		_setTableSettings: function (params) {

			var oTable = this.getView().byId("productTable");

			// var oTableModel = new sap.ui.model.json.JSONModel();
			var oTableModel = this.getView().getModel("tableItems");

			var aTableData = this.getView().getModel("modelProducts").getData().ProductCollection;
			oTableModel.setData(aTableData);
			// var oTableModel = new sap.ui.model.json.JSONModel();
			// this.getView().setModel(oTableModel, "tableItems");


			this._reportData = aTableData;
			this.addPaginator("productTable", aTableData);

			oTable.attachSort(null, function (params) {

				this._oTableSort = {
					sortOrder: params.getParameters().sortOrder,
					sortProperty: params.getParameters().column.getSortProperty()
				};

				var aTablex = this._reportData.slice(0);

				for (var k = 0; k < aTablex.length; k++) {
					var element = aTablex[k];
					console.log(element[this._oTableSort.sortProperty])
				}

				var aTable = this._sortAndFilterTable(aTablex);

				for (k = 0; k < aTable.length; k++) {
					element = aTable[k];
				}

				this.addPaginator("productTable", aTable);

			}.bind(this));

			oTable.attachFilter(null, function (params) {

				var filterValue = "";
				var filterOperator = "";

				var filterProp = params.getParameters().column.mProperties.filterProperty;
				if (typeof this._reportData[0][filterProp] === "object" || typeof this._reportData[0][filterProp] === "number") {
					filterValue = params.getParameters().value;
					filterOperator = "EQ";
				}
				else {
					filterValue = params.getParameters().value;
					filterOperator = "Contains";
				}

				for (var j = 0; j < this._aTableFilters.length; j++) {
					var element = this._aTableFilters[j];

					if (element.filterProp === filterProp) {
						this._aTableFilters.splice(j, 1)
						j--;
					}
				}

				this._aTableFilters.push(
					{
						filterProp: filterProp,
						filterValue: filterValue,
						filterOperator: filterOperator
					}
				);

				var aTablex = this._reportData.slice(0);

				var aTable = this._sortAndFilterTable(aTablex);

				this.addPaginator("productTable", aTable);

			}.bind(this));
		},
		onAfterRendering: function (params) {
		},
		onInit: function () {

			this._devicePhone = sap.ui.Device.system.phone;
			this._deviceTablet = sap.ui.Device.system.tablet && !sap.ui.Device.system.desktop;

			var oTableModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oTableModel, "tableItems");

			this.getOwnerComponent().getModel("modelProducts").dataLoaded().then(
				function (params) {
					this._setTableSettings();
				}.bind(this)
			)
		},
		oPagination: {
			container: {},
			init: function (properties) {
				this.Extend(properties);
				this.Start();
			},

			Extend: function (properties) {
				properties = properties || {};
				this.size = properties.size || 1;
				this.page = properties.page || 1;
				this.step = properties.step || 5;
				this.table = properties.table || {};
				this.countTable = properties.countTable || 0;
				this.countPerPage = properties.countPerPage || 10;
				this.tableData = properties.tableData || 10;
				this.devicePhone = properties.devicePhone;
				this.deviceTablet = properties.deviceTablet;
			},

			Start: function () {


				this.table.clearSelection();

				this.container.destroyItems();


				if (this.devicePhone || this.deviceTablet) {
					var oSelect = new sap.m.Select("selectPage", {
						change: this.SelectChange.bind(this),
					});
					this.container.addItem(oSelect);
				}


				if (this.size < this.step * 2 + 6) {
					this.AddNumber(1, this.size + 1);
				}

				else if (this.page < this.step * 2 + 1) {
					this.AddNumber(1, this.step * 2 + 4);
					this.AddLastNumber();
				}

				else if (this.page > this.size - this.step * 2) {
					this.AddFirstNumber();
					this.AddNumber(this.size - this.step * 2 - 2, this.size + 1);
				}
				else {
					this.AddFirstNumber();
					this.AddNumber(this.page - this.step, this.page + this.step + 1);
					this.AddLastNumber();
				}

				this.setFixedButtons();
				if (this.devicePhone || this.deviceTablet) {
					var aSelectItems = oSelect.getItems();

					for (var k = 0; k < aSelectItems.length; k++) {
						var item = aSelectItems[k];
						var r = item.getText();

						if (r === this.page.toString()) {
							oSelect.setSelectedItem(item);
						}
					}
				}

				else {
					var aButtons = this.container.getItems();
					for (var i = 0; i < aButtons.length; i++) {
						var oButton = aButtons[i];

						if (oButton.getText() === this.page.toString()) {
							oButton.setType("Emphasized");
						}
					}
				}

				this.filterTable();
			},

			AddNumber: function (s, f) {


				for (var i = s; i < f; i++) {

					if (this.devicePhone || this.deviceTablet) {
						sap.ui.getCore().byId("selectPage").addItem(
							new sap.ui.core.Item({
								key: i,
								text: i
							})
						);
					}
					else {

						var oButton = new sap.m.Button({
							text: i,
							press: this.ClickNumber.bind(this)
						});

						this.container.addItem(oButton);
					}
				}
			},

			AddFirstNumber: function () {
				if (this.devicePhone || this.deviceTablet) {
					sap.ui.getCore().byId("selectPage").insertItem(
						new sap.ui.core.Item({
							key: 1,
							text: 1
						}, 2)
					);
				}
				else {
					var oButton = new sap.m.Button({
						text: 1,
						press: this.ClickNumber.bind(this)
					});

					this.container.insertItem(oButton, 2);

					oButton = new sap.m.Button({
						text: "...",
						// press: this.Click.bind(this)
					});
					this.container.insertItem(oButton, 3);
				}
			},
			AddLastNumber: function () {
				if (this.devicePhone || this.deviceTablet) {
					sap.ui.getCore().byId("selectPage").insertItem(
						new sap.ui.core.Item({
							key: this.size,
							text: this.size
						}, this.size - 3)
					);
				}
				else {
					var oButton = new sap.m.Button({
						text: "...",
						// press: this.ClickNumber.bind(this)
					});

					this.container.insertItem(oButton, this.size - 4);

					oButton = new sap.m.Button({
						text: this.size,
						press: this.ClickNumber.bind(this)
					});

					this.container.insertItem(oButton, this.size - 3);
				}
			},
			SelectChange: function (oEvent) {
				this.page = parseInt(oEvent.getParameters().selectedItem.getText());
				this.Start();
			},
			ClickNumber: function (oEvent) {
				this.page = parseInt(oEvent.getSource().getText());
				this.Start();
			},

			ClickPrev: function () {
				this.page--;
				if (this.page < 1) {
					this.page = 1;
				}
				this.Start();
			},

			ClickNext: function () {
				this.page++;
				if (this.page > this.size) {
					this.page = this.size;
				}
				this.Start();
			},

			ClickFirst: function () {
				this.page = 1;
				if (this.page < 1) {
					this.page = 1;
				}
				this.Start();
			},

			ClickLast: function () {
				this.page = this.size;
				if (this.page > this.size) {
					this.page = this.size;
				}
				this.Start();
			},


			setFixedButtons: function (e) {
				if (this.devicePhone || this.deviceTablet) {
					var oButton = new sap.m.Button({
						icon: "sap-icon://close-command-field",
						press: this.ClickFirst.bind(this)
					});
					this.container.insertItem(oButton, 0);

					var oButton = new sap.m.Button({
						icon: "sap-icon://navigation-left-arrow",
						press: this.ClickPrev.bind(this)
					});

					this.container.insertItem(oButton, 1);

					oButton = new sap.m.Button({
						icon: "sap-icon://navigation-right-arrow",
						press: this.ClickNext.bind(this)
					});
					this.container.insertItem(oButton, this.size + 2);

					var oButton = new sap.m.Button({
						icon: "sap-icon://open-command-field",
						press: this.ClickLast.bind(this)
					});
					this.container.insertItem(oButton, this.size + 3);
				}
				else {

					var oButton = new sap.m.Button({
						text: "First",
						press: this.ClickFirst.bind(this)
					});
					this.container.insertItem(oButton, 0);

					oButton = new sap.m.Button({
						text: "Next",
						press: this.ClickNext.bind(this)
					});
					this.container.insertItem(oButton, 1);

					oButton = new sap.m.Button({
						text: "Previous",
						press: this.ClickPrev.bind(this)
					});
					this.container.insertItem(oButton, this.size + 2);

					oButton = new sap.m.Button({
						text: "Last",
						press: this.ClickLast.bind(this)
					});
					this.container.insertItem(oButton, this.size + 3);
				}
			},

			filterTable: function () {

				var aData = this.tableData;
				var aDatax = [];


				var indexes = {
					start: (this.page - 1) * this.countPerPage,
					end: (this.page - 1) * this.countPerPage + this.countPerPage - 1,
				};

				for (var index = 0; index < this.countTable; index++) {
					if (indexes.start <= index && indexes.end >= index) {
						var item = aData[index];
						aDatax.push(item);
					}
				}
				this.table.getModel("tableItems").setData(
					{ ProductCollection: aDatax });

			}
		},

		addPaginator: function (tableId, tableData) {


			var oTable = this.byId(tableId);
			var oContentHolder = oTable.getParent();



			this._destroyControl("selectPage");

			this._destroyControl("vbox1");
			var oVBox1 = new sap.m.VBox("vbox1", {
			});

			this._destroyControl("hbox1");
			var oHBox1 = new sap.m.HBox("hbox1", {
				justifyContent: "SpaceBetween",
				width: "90%"
			});


			this._destroyControl("hboxPagination");
			var oHBoxPagination = new sap.m.HBox("hboxPagination", {
				justifyContent: "Center",
				width: "75%"
			});


			this._destroyControl("hbox2");
			var oHBox2 = new sap.m.HBox("hbox2", {
				justifyContent: "SpaceBetween",
				width: "15%"
			});


			this._destroyControl("hbox3");
			var oHBox3 = new sap.m.HBox("hbox3", {
				alignItems: "Center",
				width: "45%"
			});

			this._destroyControl("label1");
			var oLabel1 = new sap.m.HBox("label1", {
				text: "Kalem Sayısı"
			});


			this._destroyControl("hbox4");
			var oHBox4 = new sap.m.HBox("hbox4", {
				width: "45%"
			});


			if (this._selectedCount === "") {
				this._selectedCount = "10";
			}

			this._destroyControl("comboboxCount");
			var oComboBoxCount = new sap.m.ComboBox("comboboxCount", {
				selectedKey: this._selectedCount,
				width: "10em",
				change: this.changeComboBoxCount.bind(this)
			});

			oComboBoxCount.addItem(new sap.ui.core.Item({ key: "10", text: "10" }));
			oComboBoxCount.addItem(new sap.ui.core.Item({ key: "25", text: "25" }));
			oComboBoxCount.addItem(new sap.ui.core.Item({ key: "50", text: "50" }));
			oComboBoxCount.addItem(new sap.ui.core.Item({ key: "100", text: "100" }));
			oComboBoxCount.addItem(new sap.ui.core.Item({ key: "150", text: "150" }));



			if (this._devicePhone) {
				oHBoxPagination.setWidth("");
				oHBox1.setJustifyContent("Center");
				oHBox1.addItem(oHBoxPagination);
				oHBox1.addItem(oLabel1);
				oComboBoxCount.setSelectedKey("5");
				// oHBox1.addItem(oComboBoxCount);
				oVBox1.addItem(oHBox1);
				oContentHolder.addContent(oVBox1);
			}

			else {
				oHBox3.addItem(oLabel1);
				oHBox4.addItem(oComboBoxCount);
				oHBox2.addItem(oHBox3);
				oHBox2.addItem(oHBox4);
				oHBox1.addItem(oHBoxPagination);
				oHBox1.addItem(oHBox2);
				oVBox1.addItem(oHBox1);
				oContentHolder.addContent(oVBox1);
			}

			this.generatePaginator(tableData);
			// oTable.addDelegate({
			// 	onAfterRendering: function () {
			// 		this.generatePaginator();
			// 	}.bind(this)
			// });
		},

		changeComboBoxCount: function (oEvent) {

			var aTablex = this._reportData.slice(0);
			var aTable = this._sortAndFilterTable(aTablex);

			this._selectedCount = oEvent.getSource().getSelectedKey();

			this.generatePaginator(aTable);
		},
		generatePaginator: function (tableData) {
			var oTablex = this.getView().byId("productTable");

			// var aData = oTablex.getModel("modelProducts").getData().ProductCollection;

			if (tableData === undefined)
				return;

			var countTable = tableData.length;
			var oComboBoxCount = sap.ui.getCore().byId("comboboxCount");

			if (oComboBoxCount === undefined) { count = undefined; }
			else {

				if (oComboBoxCount.getSelectedKey() !== undefined && oComboBoxCount.getSelectedKey() !== null) {
					var count = parseInt(oComboBoxCount.getSelectedKey());
				}
				else {
					count = undefined;
				}
			}

			if (count !== undefined) {
				var countPerPage = count;
			}
			else {

				if (this._devicePhone) {
					countPerPage = 5;
				}
				else {
					countPerPage = 10;
				}
			}


			oTablex.setVisibleRowCount(countPerPage);

			var size = parseInt(countTable / countPerPage);

			if (countTable % countPerPage !== 0) {
				size++;
			}

			this.oPagination.container = sap.ui.getCore().byId("hboxPagination");
			this.oPagination.container.destroyItems();
			this.oPagination.init({
				size: size,
				page: 1,
				step: 5,
				table: oTablex,
				countTable: countTable,
				countPerPage: countPerPage,
				tableData: tableData,
				devicePhone: this._devicePhone,
				deviceTablet: this._deviceTablet
			});
		},

		_destroyControl: function (id) {

			var oControl = this.getView().byId(id);
			if (oControl !== undefined) oControl.destroy();

			oControl = sap.ui.getCore().byId(id);
			if (oControl !== undefined) oControl.destroy();
		},

	});
});