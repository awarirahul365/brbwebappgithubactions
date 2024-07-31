import { BusyIndicator, FlexBox } from "@ui5/webcomponents-react";
import React from "react";
export const Loadingcomponent = () => {
  const styles = {
    height: "100%",
    width: "100%",
  };
  return (
    <FlexBox
      style={styles}
      alignItems="Center"
      justifyContent="Center"
      wrap="NoWrap"
    >
      <BusyIndicator active />
    </FlexBox>
  );
};