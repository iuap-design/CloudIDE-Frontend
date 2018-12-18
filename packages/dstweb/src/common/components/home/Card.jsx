import React from 'react';
import { Card } from 'antd';
import { Row, Col } from 'yxyweb/common/components/basic';
import * as common from './HomeCommon';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as format from 'yxyweb/common/helpers/formatDate';
import * as tabsactions from 'yxyweb/common/redux/tabs';
import * as portalactions from 'yxyweb/common/redux/portal';

export class CardControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: props.title || "通知公告",
      extra: props.extra || <a onClick={(e) => this.onClick(e, 'more')}>更多</a>,
      dataSource: props.dataSource || [],
      style: props.style
    };
    // this.getData(props.type);

    this.onClick = this.onClick.bind(this);
  }
  onClick(e) {
    // let activeKey = (this.props.type == 'notice') ? "AABS07" : "KL02";
    // var _props = this.props,
    //   tabsactions = _props.tabsactions,
    //   portalactions = _props.portalactions,
    //   tabs = _props.tabs,
    //   portal = _props.portal;
    // var index = tabs.panes.findIndex(function (pane) {
    //   return pane.key === activeKey;
    // });
    // if (index > -1) {
    //   tabsactions.activateItem(activeKey);
    //   var current = portal.tabs[activeKey];
    //   if (!current || !current.panes.length || current.panes.length === 1) return;
    //   var currentPanes = current.panes;
    //   var activeContent = currentPanes[currentPanes.length - 1].content;
    //   if (activeContent.vm) {
    //     activeContent.vm.promiseExecute('return', '返回', function () {
    //       portalactions.firstItem(activeKey);
    //     });
    //   } else if (activeContent.type && activeContent.url) {
    //     if (activeContent.checkReturn) {
    //       portalactions.refreshItem(activeKey, '返回', function () {
    //         portalactions.firstItem(activeKey);
    //       });
    //     } else {
    //       portalactions.firstItem(activeKey);
    //     }
    //   }
    //   return;
    // }
    // var params = {};
    // if (this.props.type == 'notice')
    //   params = { "level": 1, "name": "公告列表", "code": "AABS07", "isEnd": true, "parentCode": "AABS", "metaKey": "aa_noticelist", "id": 827, "subId": "AA", "authLevel": 1, "metaType": "voucherlist", "viewType": "meta", "userClick": true, "menuId": "AABS07" };
    // if (this.props.type == 'knowledge')
    //   params = { "level": 1, "name": "知识库", "code": "KL02", "isEnd": true, "parentCode": "KLB", "metaKey": "aa_informationlist", "id": 818, "subId": "KL", "authLevel": 3, "metaType": "voucherlist", "viewType": "meta", "userClick": true, "menuId": "KL02" };

    // cb.loader.runCommandLine('menu', params, null, tabsactions.addItem);
  }
  onRowClick(e, data) {
    // let activeKey = (this.props.type == 'notice') ? "AABS07" : "KL02";
    // let title = (this.props.type == 'notice') ? "公告详情" : "文档详情";
    // let type = this.props.type;
    // var _props = this.props,
    //   tabsactions = _props.tabsactions,
    //   portalactions = _props.portalactions,
    //   tabs = _props.tabs,
    //   portal = _props.portal;
    // var index = tabs.panes.findIndex(function (pane) {
    //   return pane.key === activeKey;
    // });
    // if (index > -1) {
    //   tabsactions.activateItem(activeKey);
    //   let content = { title: title, type: 'platform', url: 'knowledgeBase/browseKnowledge', data: { params: { mode: 'browse', dataSource: data }, parentViewModel: tabs.panes[index].content.vm } };
    //   if (type == 'notice') content.url = 'noticeBase/browseNotice';
    //   portalactions.addItem(activeKey, { title: title, content: content });
    // } else {
    //   var callback = function (callbackData) {
    //     tabsactions.addItem(callbackData);
    //     let content = { title: title, type: 'platform', url: 'knowledgeBase/browseKnowledge', data: { params: { mode: 'browse', dataSource: data }, parentViewModel: callbackData.content.vm } };
    //     if (type == 'notice') content.url = 'noticeBase/browseNotice';
    //     portalactions.addItem(activeKey, { title: title, content: content });
    //   }
    //   var params = {};
    //   if (type == 'notice')
    //     params = { "level": 1, "name": "公告列表", "code": "AABS07", "isEnd": true, "parentCode": "AABS", "metaKey": "aa_noticelist", "id": 827, "subId": "AA", "authLevel": 1, "metaType": "voucherlist", "viewType": "meta", "userClick": true, "menuId": "AABS07" };
    //   if (type == 'knowledge')
    //     params = { "level": 1, "name": "知识库", "code": "KL02", "isEnd": true, "parentCode": "KLB", "metaKey": "aa_informationlist", "id": 818, "subId": "KL", "authLevel": 3, "metaType": "voucherlist", "viewType": "meta", "userClick": true, "menuId": "KL02" };

    //   cb.loader.runCommandLine('menu', params, null, callback);
    // }
  }
  // getData(type) {
  //   let renderData = {};
  //   var proxy = cb.rest.DynamicProxy.create({
  //     getlist: { url: 'bill/list.do', method: 'POST', options: { token: true } }
  //   });
  //   if (type == 'knowledge')
  //     renderData = { "page": { "pageSize": 8, "pageIndex": 1 }, "condition": { "commonVOs": [{ "itemName": "schemeName", "value1": "AA_aa_informationlist" }], "filtersId": "241490", "solutionId": 612 }, "billnum": "aa_informationlist" };
  //   if (type == 'notice')
  //     renderData = { "page": { "pageSize": 8, "pageIndex": 1 }, "condition": { "commonVOs": [{ "itemName": "schemeName", "value1": "AA_aa_noticelist" }], "filtersId": "248647", "solutionId": 640 }, "billnum": "aa_noticelist" };
  //   proxy.getlist(renderData, function (err, result) {
  //     if (err) {
  //       console.error(err.message);
  //       return;
  //     }
  //     if (!result) return
  //     this.setState({ dataSource: result.recordList });
  //   }, this);
  // }
  getCardContent() {
    let dataSource = this.state.dataSource;
    let cardControl = [];
    dataSource.forEach(data => {
      let date = data.createTime;
      date = common.Format(new Date(date), 'MM-dd');
      cardControl.push(
        <Row key={data.id}>
          <Col className={'textCol'} span={20}><a onClick={(e) => this.onRowClick(e, data)} title={data.name}>[ 公告 ]{data.name}</a></Col>
          <Col span={4} style={{ textAlign: 'right', color: '#999' }}>{date}</Col>
        </Row>
      )
    }, this);
    return (
      <div>{cardControl}</div>
    )
  }
  render() {
    // let content = this.getCardContent();
    let date = format.Format(new Date(),'MM-dd')
    return (
      <div className='home-panel-5 home-notice'>
        <Card title={this.state.title} bordered={false} extra={this.state.extra} style={this.state.style}>
          <Row key='1'>
            <Col className={'textCol'} span={24}><a>[公告] 关于十一促销活动的说明</a><div>{date}</div></Col>
          </Row>
          <Row key='2'>
            <Col className={'textCol'} span={24}><a>[公告] 关于门店美观陈设的说明</a><div>{date}</div></Col>
          </Row>
          <Row key='3'>
            <Col className={'textCol'} span={24}><a>[公告] 门店新员工培训学习</a><div>{date}</div></Col>
          </Row>
          <Row key='4'>
            <Col className={'textCol'} span={24}><a>[公告] 门店销售业绩大PK的说明</a><div>{date}</div></Col>
          </Row>
        </Card>
      </div>
    )
  }
}
function mapStateToProps(state) {
  return {
    tabs: state.tabs.toJS(),
    portal: state.portal.toJS()
  }
}

function mapDispatchToProps(dispatch) {
  return {
    tabsactions: bindActionCreators(tabsactions, dispatch),
    portalactions: bindActionCreators(portalactions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardControl);
