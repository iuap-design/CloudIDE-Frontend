import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button } from 'antd';
import SvgIcon from 'SvgIcon';

import * as systemSettingactions from '../../redux/modules/systemSetting';

class UdhInfo extends Component {
  openUdh = () => {
    const { systemSettingactions } = this.props;
    systemSettingactions.openUdh();
  }
  render() {
    const { systemSetting } = this.props;
    const element = systemSetting.hasOpenUdh ? <div className="already_service_btn">已开通</div> : <Button className="open_service_btn" onClick={this.openUdh}>立即开通</Button>
    return (
      <div className="open_order_service">
        <div className="u_service_icon">
          <div className="u_logo"></div>
        </div>
        <div  className="u_service_right">
          <div className="u_service_h1">U订货</div>
          <div className="u_service_p">U订货是一款企业级B2B订货平台，可实现企业的经销商在线下单、支付、收货、对账，与ERP实现无缝对接，让企业生意更快更简单！</div>
          {element}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    systemSetting: state.systemSetting.toJS()
  }
}

function mapDispatchToProps(dispatch) {
  return {
    systemSettingactions: bindActionCreators(systemSettingactions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UdhInfo);
