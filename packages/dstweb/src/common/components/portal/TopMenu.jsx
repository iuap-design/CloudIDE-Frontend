import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Icon, Badge, Menu, Button, Popover, Tabs, Select, Input} from 'antd';
import SvgIcon from 'SvgIcon';
import SpinBar from 'yxyweb/common/components/common/SpinBar'
import {toggleLoadingStatus} from 'yxyweb/common/redux/loading'
import {ExpireInfo} from 'src/common/containers/user/Expire'

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
const TabPane = Tabs.TabPane;
const Option = Select.Option;

import ActionStatus from 'yxyweb/common/constants/ActionStatus';

import * as tabsactions from 'yxyweb/common/redux/tabs';
import * as portalactions from 'yxyweb/common/redux/portal';
import * as useractions from '../../redux/modules/user';

class TopMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      trigger: process.env.__CLIENT__ && cb.rest.device === 'android' ? 'click' : 'hover'
    };
  }

  componentDidMount() {
    const {toggleLoadingStatus} = this.props;
    cb.utils.loading = function (status) {
      toggleLoadingStatus(status);
    }
    cb.events.on('personInfo', () => {
      this.handlePersonalInfo();
    });
    cb.events.on('redirectLogin', () => {
      this.handleLogout();
    });
  }

  handleAccountCenter() {
    const accountCenterKey = 'accountCenter';
    const {tabsactions, tabs} = this.props;
    const index = tabs.panes.findIndex(pane => {
      return pane.key === accountCenterKey;
    });
    if (index > -1) {
      tabsactions.activateItem(accountCenterKey);
      return;
    }
    tabsactions.addItem({
      key: accountCenterKey,
      title: '账号中心',
      content: {
        type: 'platform',
        url: 'account-center'
      }
    });
  }

  handlePersonalInfo() {
    this.handleAccountCenter();
    const {useractions} = this.props;
    useractions.setAccountActiveKey('personalInfo');
  }

  handleUpdateLogInfo = () => {
    const key = 'update-log'
    const {tabsactions, tabs} = this.props;
    const index = tabs.panes.findIndex(pane => {
      return pane.key === key
    });
    if (index > -1) {
      tabsactions.activateItem(key);
      return;
    }
    tabsactions.addItem({
      key,
      title: '更新日志',
      content: {
        type: 'platform',
        url: 'update-log'
      }
    });


    // useractions.setAccountActiveKey('updateLogInfo');
  }

  handleChangePsd() {
    this.handleAccountCenter();
    const {useractions} = this.props;
    useractions.setAccountActiveKey('changePsd');
  }

  handleLogout() {
    cb.route.redirectLoginPage(false);
    // this.props.tabsactions.clear();
  }

  onChange = (activeKey) => {
    const {tabsactions} = this.props;
    tabsactions.activateItem(activeKey);
  }
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  }
  remove = (key) => {
    const {tabsactions, portalactions, portal} = this.props;
    const current = portal.tabs[key];
    if (!current || !current.panes.length) return;
    const currentPanes = current.panes;
    const activeContent = currentPanes[currentPanes.length - 1].content;
    if (activeContent.vm) {
      activeContent.vm.promiseExecute('return', '关闭', function () {
        tabsactions.deleteItem(key);
      });
    } else if (activeContent.type && activeContent.url) {
      if (activeContent.checkReturn) {
        portalactions.refreshItem(key, '关闭', function () {
          tabsactions.deleteItem(key);
        });
      } else {
        tabsactions.deleteItem(key);
      }
    }
  }
  handleRefresh = () => {
    const {tabs, portalactions, portal} = this.props;
    const {activeKey} = tabs;
    const current = portal.tabs[activeKey];
    if (!current || !current.panes.length) return;
    portalactions.delItem(activeKey);
    const currentPanes = current.panes;
    if (currentPanes.length === 1) {
      const callback = (returnData) => {
        const {title, content, params} = returnData;
        portalactions.addItem(activeKey, {title, content, params});
      };
      cb.loader.runCommandLine('menu', currentPanes[0].params, null, callback);
    } else {
      const {title, content, params, parent} = currentPanes[currentPanes.length - 1];
      if (content.vm) {
        cb.loader.runCommandLine('bill', params, parent);
      } else {
        portalactions.addItem(activeKey, {title, content, params, parent});
      }
    }
  }
  closeOther = () => {
    const {tabsactions, tabs} = this.props;
    tabsactions.closeOther(tabs.activeKey);
  }
  closeAll = () => {
    this.props.tabsactions.closeAll();
  }

  renderTabs(dataSource, titles, activeKey) {
    if (!dataSource || !dataSource.length) return;
    const operations = (
      <Popover trigger={this.state.trigger} content={<div className='title-setting top-right-title'>
        <p><a onClick={this.handleRefresh}>刷新当前页面</a></p>
        <p><a onClick={this.closeOther}>关闭其他页面</a></p>
        <p><a onClick={this.closeAll}>关闭全部页面</a></p></div>}>
        <span className='title-name'><Icon type='shuaxin'/></span>
      </Popover>
    );
    const {tabs} = this.props;
    let width = 0;
    if (tabs.width - 400 > 0) {
      width = tabs.width - 400;
      if (this.rightElement)
        width = width + 400 - this.rightElement.clientWidth + 30;
    }
    let headTitle = '友零售－';
    const items = [];
    dataSource.forEach(item => {
      const title = titles[item.key] && titles[item.key].activeTitle || item.title;
      items.push(<TabPane tab={title} key={item.key} closable={item.closable}></TabPane>);
      if (item.key === activeKey)
        document.title = headTitle + title;
    });
    return (
      <Tabs style={{width: width, float: 'left'}}
            hideAdd
            onChange={this.onChange}
            activeKey={activeKey}
            type="editable-card"
            onEdit={this.onEdit}
            animated={false}
            tabBarExtraContent={operations}>
        {items}
      </Tabs>
    );
  }

  handleOrgChange(value, name) {
    this.props.useractions.changeOrg(value, name);
  }

  renderOrgs() {
    const {showOrg, userOrgs, orgId, defaultOrgName} = this.props.user;
    if (!showOrg)
      return null;
    const items = [];
    if (userOrgs && userOrgs.length) {
      userOrgs.forEach(org => {
        items.push(<p className={orgId === org.org ? 'topMenu_checked' : ''}><a
          onClick={() => this.handleOrgChange(org.org, org.org_name)}>{org.org_name}{orgId === org.org ?
          <SvgIcon type="xuanzhong1"/> : null}</a></p>);
      });
    }
    return items.length ? <Popover trigger={this.state.trigger} content={items}>
      <span className='orgOrStore'><b>{defaultOrgName}</b><Icon type='rowBottom'/></span>
    </Popover> : null;
  }

  handleStoreChange(value, name) {
    this.props.useractions.changeStore(value, name);
  }

  searchStores = (e) => {
    const {userStores} = this.props.user;
    if (!userStores || !userStores.length) return;
    const filterStores = userStores.filter(item => {
      return item.store_name.indexOf(e.target.value) > -1;
    });
    this.setState({filterStores});
  }

  renderStores() {
    const {showStore, userStores, storeId, defaultStoreName} = this.props.user;
    if (!showStore)
      return null;
    const displayStores = this.state.filterStores || userStores;
    const content = [];
    const items = [];
    if (userStores && userStores.length) {
      if (userStores.length > 10)
        content.push(<Input onChange={this.searchStores} suffix={<Icon type='search'/>}/>);
      displayStores.forEach(store => {
        items.push(<p className={storeId === store.store ? 'topMenu_checked' : ''}><a
          onClick={() => this.handleStoreChange(store.store, store.store_name)}>{store.store_name}{storeId === store.store ?
          <SvgIcon type="xuanzhong1"/> : null}</a></p>);
      });
      content.push(<div>{items}</div>);
    }
    return content.length ? <Popover trigger={this.state.trigger} content={content}>
      <span className='orgOrStore'><b>{defaultStoreName}</b><Icon type='rowBottom'/></span>
    </Popover> : null;
  }

  handleGradeChange(value, name) {
    this.props.useractions.changeGrade(value, name);
  }

  renderGrades() {
    const {showStore, userGrades, gradeId, defaultGradeName} = this.props.user;
    if (!showStore)
      return null;
    const items = [];
    if (userGrades && userGrades.length) {
      userGrades.forEach(grade => {
        items.push(<p className={gradeId === grade.id ? 'topMenu_checked' : ''}><a
          onClick={() => this.handleGradeChange(grade.id, grade.name)}>{grade.name}{gradeId === grade.id ?
          <SvgIcon type="xuanzhong1"/> : null}</a></p>);
      });
    }
    return items.length ? <Popover trigger={this.state.trigger} content={items}>
      <span className='orgOrStore'><b>{defaultGradeName}</b><Icon type='rowBottom'/></span>
    </Popover> : null;
  }

  switchInterMode = () => {
    this.props.useractions.switchInterMode('touch');
  }

  render() {
    const {tabs, portal, user, loading} = this.props;
    let logo = user.logo ? user.logo : '';
    let logoStyle = {};
    if (logo) {
      logoStyle = {backgroundImage: `url(${logo})`}
    }
    return (
      <div>
        {logo ? <div className="logo">
            <div style={logoStyle}></div>
          </div>
          : <div className="logo"><SvgIcon type="logojiawenzi"/></div>}
        {this.renderTabs(tabs.panes, portal.tabs, tabs.activeKey)}
        <div ref={node => this.rightElement = node} className='top-right'>
          {this.renderOrgs()}
          {this.renderStores()}
          {this.renderGrades()}

          <Popover trigger={this.state.trigger} content={<div className='title-setting top-right-title'>

            <p><a onClick={() => this.handlePersonalInfo()}><Icon type='user'/>个人信息</a></p>
            <p><a onClick={() => this.handleChangePsd()}><Icon type='lock'/>修改密码</a></p>
            <p><a onClick={() => this.handleLogout()}><Icon type="poweroff"/>退出登录</a></p></div>}>
            <span className='title-name'><em>{user.avatar ? <img src={user.avatar}/> : null}</em>HI，{user.name}<Icon type='rowBottom'/></span>
          </Popover>

          {/*<span  className="TopMenu-gengxinrizhi"><SvgIcon type='gengxinrizhi' onClick={this.handleUpdateLogInfo}/></span>*/}


          <Popover trigger={this.state.trigger}
                   placement="bottom"
                   content={<div className='title-setting top-right-title'>
                     {/*先去掉 <p><a onClick={() => {
                       window.open('https://ticket.yonyoucloud.com/ticket/create/YLS')
                       //cb.utils.alert('敬请期待')
                     }}><Icon type='wentifankui'/>问题反馈</a></p> */}
                     <p><a onClick={this.handleUpdateLogInfo}><Icon type="gengxinrizhi"/>更新日志</a></p>
                     <div className="title-setting-telephone">
                       <div className="telephone-number">010-86393388/转5</div>
                       <div className="telephone-infor">客服热线</div>
                     </div>
                   </div>}>
            <span className="TopMenu-gengxinrizhi"><SvgIcon type='bangzhuzhongxin'/></span>
          </Popover>


          <span className='TopMenu-qiehuanchuping'><SvgIcon type='qiehuanchuping'
                                                            onClick={this.switchInterMode}/></span>
        </div>
        <div className='TopMenu-loading'>
          <ExpireInfo user={user} dispatch={this.props.dispatch}/>
          <SpinBar loading={loading}/>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    tabs: state.tabs.toJS(),
    portal: state.portal.toJS(),
    user: state.user.toJS(),
    loading: state.loading
  }
}

function mapDispatchToProps(dispatch) {
  return {
    tabsactions: bindActionCreators(tabsactions, dispatch),
    portalactions: bindActionCreators(portalactions, dispatch),
    useractions: bindActionCreators(useractions, dispatch),
    toggleLoadingStatus: bindActionCreators(toggleLoadingStatus, dispatch),
    dispatch
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TopMenu);
