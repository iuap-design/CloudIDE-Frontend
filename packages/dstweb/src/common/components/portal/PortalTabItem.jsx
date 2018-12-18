import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Tabs } from 'antd';
import Meta from 'yxyweb/common/components/meta-runner';
import Iframe from './Iframe';

import * as portalactions from 'yxyweb/common/redux/portal';

const TabPane = Tabs.TabPane;

class PortalTabItem extends Component {
  constructor(props) {
    super(props);
    this.list = [];
    this.newmetaid = 0;
  }

  componentDidMount() {
    const { needInit, portalactions, index, title, content, params } = this.props;
    if (needInit === false) return;
    portalactions.metaInit(index);
    portalactions.addItem(index, { title, content, params });
  }

  componentWillUnmount() {
    const { portalactions, index } = this.props;
    portalactions.destroy(index);
  }

  render() {
    const { portal, index, width, height } = this.props;
    const current = portal.tabs[index];
    if (!current || !current.panes.length)
      return null;
    const length = current.panes.length;
    let i;
    for (i = 0; i < length; i++) {
      const pane = current.panes[i];
      let tabContent;
      if (pane.content.vm) {
        tabContent = <Meta
          index={index}
          width={width}
          height={height}
          title={pane.title}
          viewModel={pane.content.vm}
          metaData={pane.content.metaData}
          id={`meta${this.newmetaid++}`} />
      } else if (pane.content.type && pane.content.url) {
        let { url } = pane.content;
        let search = null;
        const queryStringIndex = url.indexOf('?');
        if (queryStringIndex > -1) {
          search = url.substr(queryStringIndex);
          url = url.substr(0, queryStringIndex);
        }
        const extraProps = {};
        if (search)
          Object.assign(extraProps, new cb.utils.queryString(search).query);
        const items = url.split('/');
        let req, path, indexCom, ComName;
        try {
          if (pane.content.type === 'platform') {
            path = ['.', items[0], 'index'].join('/');
            req = require.context('..', true, /^\.\/(account-center|home|system-setting|update-log)\//);
            try {
              indexCom = req(path);
            } catch (e) {

            }
            if (!indexCom)
              req = require.context('yxyweb/common/components', true, /^\.\/(bill-design|print-design|role|user-define-archives|platform-management)\//);
            indexCom = req(path);
            ComName = (items.length === 2 ? indexCom[items[1]] : indexCom.default);
            tabContent = <ComName index={index} width={width} height={height} data={pane.content.data} caption={pane.caption} callback={pane.callback} {...extraProps} />;
          } else if (pane.content.type === 'iframe') {
            tabContent = <Iframe index={index} url={pane.content.url} width={width} height={height} />
          }
        } catch (e) {
          console.error(e.message);
        }
      }
      if (tabContent) {
        if (this.list[i]) {
          this.list[i] = <TabPane key={pane.key}>{tabContent}</TabPane>
        } else {
          this.list.push(<TabPane key={pane.key}>{tabContent}</TabPane>);
        }
      }
    }
    if (this.list[i])
      this.list.splice(i, 1);
    return <Tabs className="meta-container height-100" hideAdd activeKey={current.activeKey} type="editable-card" animated={false}>{this.list}</Tabs>
  };

}

function mapStateToProps(state) {
  return {
    portal: state.portal.toJS()
  }
}

function mapDispatchToProps(dispatch) {
  return {
    portalactions: bindActionCreators(portalactions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PortalTabItem);
