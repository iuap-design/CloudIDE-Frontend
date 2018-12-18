import React, { Component } from 'react';
import { Tabs } from 'antd';
import PersonalInfo from './PersonalInfo';
import ChangePassWord from './ChangePassWord';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as accountactions from '../../redux/modules/user';

const TabPane = Tabs.TabPane;

class AccountCenter extends Component {
  handleChange(key) {
    const { accountactions } = this.props;
    accountactions.setAccountActiveKey(key);
  }
  render() {
    let { account } = this.props
    return (
      <div>
        <Tabs className='tab-list' activeKey={account.accountCurrentKey} type="card" animated={false} onChange={key => this.handleChange(key)}>
          <TabPane tab="个人信息" key="personalInfo">
            <PersonalInfo />
          </TabPane>
          <TabPane tab="修改密码" key="changePsd">
            <ChangePassWord />
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    account: state.user.toJS(),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    accountactions: bindActionCreators(accountactions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountCenter);