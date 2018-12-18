import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Tabs, Popover, Icon } from 'antd';
import PortalTabItem from "./PortalTabItem";

import * as tabsactions from 'yxyweb/common/redux/tabs';
import * as portalactions from 'yxyweb/common/redux/portal';

const TabPane = Tabs.TabPane;

class TabList extends Component {
  constructor(props) {
    super(props);
    this.list = [];//渲染队列
    this.keylist = [];//维护渲染队列时候便于比对key值
    this.newmetaid = 0;
  }

  // componentDidUpdate() {
  //   const { tabsactions } = this.props;
  //   tabsactions.disableUpdate();
  // }

  onChange = (activeKey) => {
    const { tabsactions } = this.props;
    tabsactions.activateItem(activeKey);
  }
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  }
  remove = (key) => {
    const { tabsactions, portalactions, portal } = this.props;
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
  handleRefresh() {
    debugger
  }
  handleCloseOther() {
    debugger
  }
  handleCloseAll() {
    debugger
  }

  render() {
    let { tabs } = this.props;
    if (tabs.needUpdate) {//只有更新时候进入此分支
      let length = tabs.panes.length,//this.keylist.length>?this.keylist.length:tabs.panes.length;
        i = 0, width = 0, height = 0;

      if (tabs.width)
        width = tabs.width;
      if (tabs.height)
        height = tabs.height;

      for (; i < length; i++) {//遍历panes数组，更新tabs渲染队列
        const { key, title, closable, content, params } = tabs.panes[i];
        const tabPaneProps = { tab: title, key, closable };
        const tabItemProps = { index: key, title, content, params, width, height };
        if (this.list[i]) {
          if (key !== this.keylist[i]) {//如果遍历到的渲染队列的元素跟panes的对不上，则认为是已经删除，就把其从渲染队列中删除
            this.list.splice(i, 1);
            this.keylist.splice(i, 1);
          } else {
            if (content.vm || content.type && content.url) {
              this.list[i] = <TabPane {...tabPaneProps}>
                <PortalTabItem {...tabItemProps} />
              </TabPane>
            }
          }
        } else {//如果渲染队列比panes短，则将长出的元素放入渲染队列
          if (content.vm || content.type && content.url) {
            this.list.push(<TabPane {...tabPaneProps}>
              <PortalTabItem {...tabItemProps} />
            </TabPane>);
            this.keylist.push(key);
          }
        }
      }
      if (this.list[i]) {//如果遍历完成后list内容比panes多，则删除多余的pane
        this.list.splice(i, 1);
        this.keylist.splice(i, 1);
      }
    }
    const operations = <Popover content={<div className='title-setting top-right-title'>
      <p><a onClick={() => this.handleRefresh()}><Icon type='user' />刷新</a></p>
      <p><a onClick={() => this.handleCloseOther()}><Icon type='lock' />关闭其他</a></p>
      <p><a onClick={() => this.handleCloseAll()}><Icon type="poweroff" />关闭全部</a></p></div>}>
      <span className='title-name'><Icon type='rowBottom' /></span>
    </Popover>;
    return (
      <div ref="container" className="height-100">
        <Tabs
          hideAdd
          onChange={this.onChange}
          activeKey={tabs.activeKey}
          type="editable-card"
          onEdit={this.onEdit}
          animated={false}
          className={this.props.className}
          tabBarExtraContent={operations}
        >
          {this.list}
        </Tabs>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    tabs: state.tabs.toJS(),
    portal: state.portal.toJS(),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    tabsactions: bindActionCreators(tabsactions, dispatch),
    portalactions: bindActionCreators(portalactions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TabList);
