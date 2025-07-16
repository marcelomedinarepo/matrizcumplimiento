sap.ui.define([
    "sap/ui/core/UIComponent",
    "ehs/ehs141/matrizcumplimiento/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("ehs.ehs141.matrizcumplimiento.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
        }
    });
});