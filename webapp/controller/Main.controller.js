sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/MessageToast",
    "sap/ui/table/TreeTable",
    "sap/ui/table/Column",
    "sap/m/Text",
    "sap/ui/Device"
], function (
    Controller, Dialog, Button, Label, MessageToast,
    TreeTable, Column, Text, Device
) {
    "use strict";

    return Controller.extend("ehs.ehs141.matrizcumplimiento.app.controller.Main", {
        onInit() {
            this._oAppModel = this.getOwnerComponent().getModel("AppJsonModel");
            this._onGetArbol();
            this.getDominios();
            this.getTiposRequisito();
        },

        _onGetArbol: async function () {
            try {
                this._oAppModel.setProperty("/busyTree", true);
                const oResp = await this._readService("/locationSet");
                const aFlat = oResp.results;
                const aTree = this._buildTree(aFlat);
                this._oAppModel.setProperty("/registros", aFlat);
                this._oAppModel.setProperty("/arbol", aTree);
            } catch (err) {
                const sMsg = err?.responseText
                    ? JSON.parse(err.responseText).error.message.value
                    : "Error de comunicación";
                MessageToast.show(sMsg);
            } finally {
                this._oAppModel.setProperty("/busyTree", false);
            }
        },

        getDominios: async function () {
            try {
                const oModel = this.getOwnerComponent().getModel("Matriz");
                const oAppModel = this._oAppModel;
                oAppModel.setProperty("/busyTree", true);

                const oResp = await this._readService("/DomainSet");
                const aDominios = oResp.results;

                oAppModel.setProperty("/dominios", aDominios);
                oAppModel.setProperty("/dominiosSeleccionados", []);
            } catch (err) {
                const sMsg = err?.responseText
                    ? JSON.parse(err.responseText).error.message.value
                    : "Error al obtener dominios";
                MessageToast.show(sMsg);
            } finally {
                this._oAppModel.setProperty("/busyTree", false);
            }
        },

        getTiposRequisito: async function () {
            try {
                const oModel = this.getOwnerComponent().getModel("Matriz");
                const oAppModel = this._oAppModel;
                oAppModel.setProperty("/busyTree", true);

                const oResp = await this._readService("/ReqTypeSet");
                const aTipos = oResp.results;

                oAppModel.setProperty("/tiposRequisito", aTipos);
                oAppModel.setProperty("/tiposRequisitoSeleccionados", []);
            } catch (err) {
                const sMsg = err?.responseText
                    ? JSON.parse(err.responseText).error.message.value
                    : "Error al obtener tipos de requisito";
                MessageToast.show(sMsg);
            } finally {
                this._oAppModel.setProperty("/busyTree", false);
            }
        },

        _buildTree(aFlat) {
            const oIndex = Object.create(null);
            const aRoots = [];

            aFlat.forEach(o => {
                o.Son = [];
                oIndex[o.LocationKey] = o;
            });

            aFlat.forEach(o => {
                const bRaiz =
                    o.ParentKey === "00000000-0000-0000-0000-000000000000" ||
                    !oIndex[o.ParentKey];

                if (bRaiz) {
                    aRoots.push(o);
                } else {
                    oIndex[o.ParentKey].Son.push(o);
                }
            });

            return aRoots;
        },

        _readService(sEntity) {
            return new Promise((res, rej) => {
                this.getOwnerComponent().getModel("Matriz").read(sEntity, {
                    success: res,
                    error: rej
                });
            });
        },

        onValueHelpRequest() {
            if (!this._oVHDialog) {
                this._createValueHelpDialog();
            }
            this._oVHDialog.open();
        },

        _createValueHelpDialog() {
            this._oVHDialog = new Dialog({
                title: "Seleccionar ubicación",
                contentWidth: "700px",
                contentHeight: "500px",
                resizable: true,
                draggable: true,
                stretch: Device.system.phone,
                buttons: [
                    new Button({
                        text: "Aceptar",
                        type: "Emphasized",
                        enabled: false,
                        press: this._onConfirmUbicacion.bind(this)
                    }),
                    new Button({
                        text: "Cancelar",
                        press: () => this._oVHDialog.close()
                    })
                ]
            });

            this.getView().addDependent(this._oVHDialog);

            const oTree = new TreeTable({
                rows: {
                    path: "AppJsonModel>/arbol",
                    parameters: { arrayNames: ["Son"] }
                },
                selectionMode: "Single",
                visibleRowCount: 15,
                enableSelectAll: false
            });

            oTree.addColumn(new Column({
                label: new Label({ text: "Ubicación" }),
                template: new Text({ text: "{AppJsonModel>LocationName}" }),
                width: "17rem"
            }));

            oTree.addColumn(new Column({
                label: new Label({ text: "ID" }),
                template: new Text({ text: "{AppJsonModel>LocationId}" }),
                width: "7rem"
            }));

            oTree.attachRowSelectionChange(() => {
                const bHasSel = oTree.getSelectedIndex() >= 0;
                this._oVHDialog.getButtons()[0].setEnabled(bHasSel);
            });

            this._oVHDialog.addContent(oTree);
            this._oTreeTable = oTree;
        },

        _onConfirmUbicacion() {
            const iSel = this._oTreeTable.getSelectedIndex();
            if (iSel < 0) {
                MessageToast.show("Seleccione una ubicación");
                return;
            }

            const oCtx = this._oTreeTable.getContextByIndex(iSel),
                oRow = oCtx.getObject();

            this._oAppModel.setProperty("/ubicaciones", oRow.LocationName);
            this._oAppModel.setProperty("/ubicacionKey", oRow.LocationKey);

            this._oVHDialog.close();
        }
    });
});
