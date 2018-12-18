import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row, Col } from 'yxyweb/common/components/basic';
import { Card, Tag, Icon } from 'antd';
import * as common from './HomeCommon';
import SvgIcon from 'SvgIcon'

import { execHandler } from 'yxyweb/common/redux/tree';

class CommonFunctions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      title: props.title || '常用功能',
      style: this.props.style || {}
    }
  }
  componentDidMount() {
    const proxy = cb.rest.DynamicProxy.create({ getCommon: { url: 'commonfuctions/list', method: 'GET' } });
    proxy.getCommon((err, result) => {
      if (result)
        this.setState({ dataSource: result });
    });
  }
  handleClick(menuCode) {
    const { execHandler } = this.props;
    execHandler(menuCode);
  }
  getControl() {
    const { dataSource } = this.state;
    if (!dataSource.length)
      return null;
    const items = [];
    dataSource.forEach((item, index) => {
      const extraProps = {};
      if (index === 0)
        extraProps.color = 'red';
      items.push(<Col span={6}><Tag {...extraProps} onClick={() => this.handleClick(item.code)}>{item.name}</Tag></Col>)
    });
    return (
      <Row>{items}</Row>
    );
  }
  render() {
    let control = this.getControl();
    return <div className='home-panel-5 home-panel-6'>
      <Card title={this.state.title} bordered={false} style={this.state.style}>
        {control}
      </Card>
    </div>
  }
}

function mapStateToProps(state) {
  return {

  }
}

function mapDispatchToProps(dispatch) {
  return {
    execHandler: bindActionCreators(execHandler, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CommonFunctions);
