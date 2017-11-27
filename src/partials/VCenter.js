import React from 'react';

import './VCenter.css';

class VCenter extends React.Component {
  render() {
    return (
      <div className="VCenter">
        {this.props.children}
      </div>
    );
  }
}

export default VCenter;
