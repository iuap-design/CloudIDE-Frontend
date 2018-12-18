import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button } from 'antd';

import * as systemSettingactions from '../../redux/modules/systemSetting';

class ApiInfo extends Component {
  getApi = () => {
    const { systemSettingactions } = this.props;
    systemSettingactions.getApi();
  }
  render() {
    const { systemSetting } = this.props;
    let apiInfo = null;
    if (systemSetting.apiInfo) {
      const { secret, accessToken, appId } = systemSetting.apiInfo;
      apiInfo = (
        <div className="gettingParameters">
          <h3>Secret: {secret}</h3>
          <h3>Token: {accessToken}</h3>
          <h3>AppKey: {appId}</h3>
          {/* <span>Url示例: {cb.rest.AppContext.serviceUrl}/uniform/Controller名字/Action名字?appkey={appId}&参数&token={accessToken}&usign=xxxx</span> */}
        </div>
      );
    }
    return (
      <div className="p-l-20">
        <Button onClick={this.getApi}>获取API授权参数</Button>
        {apiInfo}
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

export default connect(mapStateToProps, mapDispatchToProps)(ApiInfo);
