import {
  SideNavigation,
  SideNavigationItem,
} from "@ui5/webcomponents-react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();
    const handlenavigation = (e) =>{
      navigate(e)
    }
  
    return (
      <div>
        <SideNavigation
          fixedItems={<><SideNavigationItem href="https://wiki.one.int.sap/wiki/display/HECOPS/Microsoft+Support%3A+Support+and+Escalation+Contacts#MicrosoftSupport:SupportandEscalationContacts-AzureBRBsupport" icon="chain-link" target="_blank" text="External Link"></SideNavigationItem></>}
        >
          <SideNavigationItem text="Create Ticket" icon="home" onClick={()=>{handlenavigation('/create-ticket')}}/>
          <SideNavigationItem text="View History" icon="history" onClick={()=>{handlenavigation('/view-history')}}/>
          <SideNavigationItem text="Update Template" icon="history" onClick={()=>{handlenavigation('/update-template')}}/>
          <SideNavigationItem href="https://wiki.one.int.sap/wiki/display/HECOPS/Microsoft+Support%3A+Support+and+Escalation+Contacts#MicrosoftSupport:SupportandEscalationContacts-AzureBRBsupport" icon="chain-link" target="_blank" text="Wiki Link"></SideNavigationItem>
        </SideNavigation>
      </div>
    );
  };
  
export default Sidebar;
