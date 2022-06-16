import React from "react";
const Debug = ({ debugValue, debugLabel, children, ...props } = {}) => {
  return (
    <div {...props}>
      {children}
      {debugValue && Object.keys(debugValue).length > 0 && (<div className="card" id="debug">
        <div className="card-header">
          <h2>{debugLabel}</h2>
        </div>
        {(debugValue !== undefined && debugLabel !== undefined) && <div className="card-body">
          <pre>{JSON.stringify(debugValue, null, 2)}</pre>
        </div>}
      </div>)}
    </div>
  );
}

export default Debug;
