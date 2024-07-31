import React from 'react';
import "@ui5/webcomponents/dist/Avatar.js";
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents-fiori/dist/ShellBar.js";
import "@ui5/webcomponents-icons/dist/customer.js";
import "@ui5/webcomponents-icons/dist/nav-back.js";
const Header = () => {
    return (
        <ui5-shellbar primary-title="BRB Ticketing Tool">
            <ui5-avatar slot="profile" icon="customer"></ui5-avatar>
            <img slot="logo" src="https://sap.github.io/ui5-webcomponents/images/sap-logo-svg.svg" />
            <ui5-button icon="nav-back" slot="startButton"></ui5-button>
        </ui5-shellbar>
    );
};

export default Header;
