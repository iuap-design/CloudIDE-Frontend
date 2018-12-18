import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Tabs } from 'antd';
import CompanyInfo from './CompanyInfo';
import ApiInfo from './ApiInfo';
import UdhInfo from './UdhInfo';
import OrderInfo from './OrderInfo'

const TabPane = Tabs.TabPane;

class SystemSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }



  render() {
    let { account } = this.props
    return (
      <div>
        <Tabs className='tab-list' type="card" animated={false}>
          <TabPane tab="企业信息" key="companyInfo">
            <CompanyInfo />
          </TabPane>
          {/*<TabPane tab="财务信息" key="financeInfo">
                        financeInfo page
                    </TabPane>
                    <TabPane tab="发票管理" key="invoiceControl">
                        invoiceControlInfo page
                    </TabPane>
                    <TabPane tab="增值服务" key="addValueService">
                        addValueService page
                    </TabPane>
                    <TabPane tab="实名认证" key="nameCertification">
                        nameCertification page
                    </TabPane>
                    <TabPane tab="服务模式" key="servicePattern">
                        servicePattern page
                    </TabPane>*/}
          <TabPane tab="API授权" key="apiInfo">
            <ApiInfo />
          </TabPane>
          {account.userType === 0 ? <TabPane tab='开通U订货' key='udhInfo'><UdhInfo /></TabPane> : null}
          {account.userType === 0 ? <TabPane tab='订购信息' key='orderInfo'><OrderInfo overTime={account.tenant.overTime} startTime={account.tenant.startTime} leftTime={account.tenant.leftTime}/></TabPane> : null}
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
    // accountactions: bindActionCreators(accountactions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemSetting);
