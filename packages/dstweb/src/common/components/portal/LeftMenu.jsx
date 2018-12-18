import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Icon } from 'antd';
import Menu from 'yxyweb/common/components/basic/menu';

import * as treeactions from 'yxyweb/common/redux/tree';
import * as tabsactions from 'yxyweb/common/redux/tabs';
import * as portalactions from 'yxyweb/common/redux/portal';

class LeftMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keyField: 'code',
      titleField: 'name'
    };
    this.windows = {};
    // if (!props.reload) return;
    // let { treeactions } = this.props;
    // this.newtreeid = 0;
    // treeactions.treeload(() => {
    //   this.newtreeid++;
    // });
  }
  componentDidMount() {
    const { treeactions } = this.props;
    treeactions.setHandler(this.handleClick);
    window.onbeforeunload = this.onBeforeUnload;
  }
  componentWillUnmount() {
    this.onBeforeUnload();
  }
  onBeforeUnload = () => {
    for (var attr in this.windows)
      this.windows[attr].close();
  }
  windowOpen(menuId, fullscreen, callback) {
    let currentWindow = this.windows[menuId];
    if (currentWindow && !currentWindow.closed) {
      currentWindow.focus();
      if (fullscreen)
        currentWindow.resizeTo(screen.availWidth, screen.availHeight)
      return;
    }
    const url = callback();
    if (url === false) return;
    const features = fullscreen ? 'fullscreen=yes' : null;
    currentWindow = window.open(url, menuId, features);
    this.windows[menuId] = currentWindow;
    if (fullscreen)
      currentWindow.resizeTo(screen.availWidth, screen.availHeight);
  }
  handleWindow(viewType, menuUrl, menuId, fullscreen) {
    if (!menuUrl) {
      cb.utils.alert('menuUrl为空', 'warning');
      return;
    }
    if (viewType === 'ajax') {
      this.windowOpen(menuId, fullscreen, function () {
        const proxy = cb.rest.DynamicProxy.create({ getUrl: { url: menuUrl, method: 'GET', options: { async: false } } });
        const data = proxy.getUrl();
        if (!data.error)
          return data.result;
        cb.utils.alert(data.error.message, 'error');
        return false;
      });
    } else if (menuId === 'RM0101') {
      this.windowOpen(menuId, fullscreen, function () {
        const { storeId, userStores } = cb.rest.AppContext.user;
        if (!storeId || !userStores.length) {
          cb.utils.alert('未登录到门店，不能开单', 'error');
          return false;
        }
        const proxy = cb.rest.DynamicProxy.create({ getUrl: { url: 'billTemplateSet/getEnterRetailAuth', method: 'GET', options: { async: false } } });
        const data = proxy.getUrl();
        if (!data.error)
          return menuUrl;
        cb.utils.alert(data.error.message, 'error');
        return false;
      });
    } else {
      this.windowOpen(menuId, fullscreen, function () {
        return menuUrl;
      });
    }
  }
  handleIframe(viewType, menuUrl, callback) {
    if (!menuUrl) {
      cb.utils.alert('menuUrl为空', 'warning');
      return;
    }
    if (viewType === 'ajax') {
      const proxy = cb.rest.DynamicProxy.create({ getUrl: { url: menuUrl, method: 'GET' } });
      proxy.getUrl(function (err, result) {
        if (err) {
          cb.utils.alert(err.message, 'error');
          return;
        }
        callback(result);
      });
    } else {
      callback(menuUrl);
    }
  }
  onClick = (selectedKeys) => {
    if (selectedKeys.length !== 1) return;
    this.props.treeactions.execHandler(selectedKeys[0]);
  }
  handleClick = (activeKey, selectedNode, filterCondition) => {
    const menuId = selectedNode[this.state.keyField];
    if (!menuId) {
      cb.utils.alert('menuId为空', 'warning');
      return;
    }
    const { tabsactions, portalactions, tabs, portal } = this.props;
    const index = tabs.panes.findIndex(pane => {
      return pane.key === activeKey;
    });
    const { viewType } = selectedNode;
    if (viewType === 'external' || viewType === 'ajax') {
      const { menuUrl, metaType } = selectedNode;
      let config = null;
      try {
        config = JSON.parse(metaType);
      } catch (e) {
        cb.utils.alert(e.message, 'warning');
        config = {};
      }
      if (config.type === 'window') {
        return this.handleWindow(viewType, menuUrl, menuId, config.mode === 'fullscreen');
      } else {
        if (index > -1)
          return tabsactions.activateItem(activeKey);
        return this.handleIframe(viewType, menuUrl, url => {
          tabsactions.addItem({
            key: menuId,
            title: selectedNode.name,
            content: { type: 'iframe', url },
            params: selectedNode
          });
        });
      }
    }
    if (index > -1) {
      tabsactions.activateItem(activeKey);
      const current = portal.tabs[activeKey];
      if (!current) return;
      const currentPanes = current.panes;
      if (!currentPanes || !currentPanes.length) return;
      if (filterCondition) {
        if (currentPanes.length === 1) {
          currentPanes[0].content.vm.execute('updateCondition', filterCondition);
          return;
        }
      } else {
        if (currentPanes.length === 1) return;
      }
      const activeContent = currentPanes[currentPanes.length - 1].content;
      if (!activeContent) return;
      if (activeContent.vm) {
        activeContent.vm.promiseExecute('return', '返回', function () {
          portalactions.firstItem(activeKey);
        });
      } else if (activeContent.type && activeContent.url) {
        if (activeContent.checkReturn) {
          portalactions.refreshItem(activeKey, '返回', function () {
            portalactions.firstItem(activeKey);
          });
        } else {
          portalactions.firstItem(activeKey);
        }
      }
      if (filterCondition)
        currentPanes[0].content.vm.execute('updateCondition', filterCondition);
      return;
    }
    let params = Object.assign({}, selectedNode, {
      userClick: true,
      menuId: menuId
    });
    let callback = (returnData) => {
      if (filterCondition) {
        var vm = returnData.content.vm;
        vm.getParams().condition = filterCondition;
      }
      tabsactions.addItem(returnData);
    };
    cb.loader.runCommandLine('menu', params, null, callback);
  }
  render() {
    let treeData = this.props.tree.TreeData;
    if (!treeData.length)
      return null;
    let trigger = 'hover';
    if (process.env.__CLIENT__) {
      cb.rest.AppContext.portalTreeData = treeData;
      if (cb.rest.device === 'android')
        trigger = 'click';
    }
    return (
      <div>
        <Menu trigger={trigger} defaultSelectedKeys={['PORTAL']} titleField={this.state.titleField} keyField={this.state.keyField}
          dataSource={treeData} onSelect={this.onClick}
          id={`menu${this.newtreeid}`} />
        {/*<div className="bottom-setting">
          <a><Icon type="help" /></a>
          <a><Icon type="service" /></a>
          <a><Icon type="setting" /></a>
        </div>*/}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    tree: state.tree.toJS(),
    tabs: state.tabs.toJS(),
    portal: state.portal.toJS()
  }
}

function mapDispatchToProps(dispatch) {
  return {
    treeactions: bindActionCreators(treeactions, dispatch),
    tabsactions: bindActionCreators(tabsactions, dispatch),
    portalactions: bindActionCreators(portalactions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LeftMenu);
