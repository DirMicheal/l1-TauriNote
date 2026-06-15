import { createReactStyleSpec } from "@blocknote/react";
 
// The Font style.
 const Font = createReactStyleSpec(
  {
    type: "font",
    propSchema: "string",
  },
  {
    render: (props) => (
      <span style={{ fontFamily: "DingTalkJinBuTi-Regular, sans-serif" }} ref={props.contentRef} />
    ),
  }

);

export default Font;
 