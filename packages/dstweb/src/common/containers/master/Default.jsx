import React, {Component} from 'react';
import {findDOMNode} from 'react-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import addEventListener from 'rc-util/lib/Dom/addEventListener';
import classname from 'classnames'
import {Layout, Spin, Modal, message, Icon} from 'antd';
import {LeftMenu, TopMenu, Tabs} from '../../components/portal';
import DynamicModal from 'yxyweb/common/components/basic/DynamicModal';

import * as tabsactions from 'yxyweb/common/redux/tabs';

const {Header, Content, Sider} = Layout;


class Page extends Component {
  constructor(props) {
    super(props);
    this.state = {
      push: props.location.action === 'PUSH',
      loading: false
    };
    // let {tabsactions} = this.props;
    // tabsactions.addItem({
    //   key: 'PORTAL',
    //   title: '首页',
    //   closable: false,
    //   content: {
    //     type: 'platform',
    //     url: 'home'
    //   }
    // });
  }

  handleResize() {
    const {tabsactions, tabs} = this.props;
    const contentEle = findDOMNode(this.content);
    const currentHeight = contentEle.clientHeight - 20;
    tabsactions.refreshHeight(currentHeight);
    const currentWidth = contentEle.clientWidth - 30;
    // 当宽度小于400时，不知为何，浏览器就会无响应，后续找原因
    if (currentWidth < 400 || currentWidth === tabs.width) return;
    tabsactions.refreshWidth(currentWidth);
  }

  componentDidMount() {
    this.handleResize();
    this.resizeHandler = addEventListener(window, 'resize', () => this.handleResize());
    this.loadingCount = 0;
    cb.utils.loadingControl = {
      start: () => {
        cb.utils.loading(true);
        this.loadingCount++;
        if (this.loadingCount === 1)
          this.setState({loading: true});
      },
      end: () => {
        cb.utils.loading(false);
        if (this.loadingCount > 0)
          this.loadingCount--;
        if (this.loadingCount === 0)
          this.setState({loading: false});
      }
    };
  }

  componentWillUnmount() {
    this.resizeHandler.remove();
    this.resizeHandler = null;
  }

  render() {
    const leftTimeShow = this.props.leftTime < 30 && this.props.leftTime != -1
    let minHeight = 60;
    const menuCount = this.props.tree.TreeData.length;
    if (menuCount)
      minHeight += 44 * menuCount;
    let loadingControl = null;
    if (this.state.loading)
      loadingControl = <div className="ant-modal-mask uretail-loading-bg">
        <Spin size='large' tip='加载中...'>
          <div></div>
        </Spin>
      </div>

    return (
      <Layout style={{minHeight}}>
        <Header className="header">
          <TopMenu/>
        </Header>
        <Layout style={{overflow: 'hidden'}}>
          <Sider className='left-menu'>
            <LeftMenu reload={this.state.push}/>
          </Sider>
          <Content ref={node => this.content = node} className="uretail-right-content"
                   style={{padding: `${leftTimeShow && 48 || 15}px 15px 0 15px`}}>
            <Tabs className="rootTabs height-100"/>
          </Content>





        </Layout>
        {loadingControl}
        <DynamicModal/>
      </Layout>
    )
  }
}

function mapStateToProps(state) {
  return {
    tree: state.tree.toJS(),
    tabs: state.tabs.toJS(),
    leftTime: state.user.get('leftTime')
  }
}

function mapDispatchToProps(dispatch) {
  return {
    tabsactions: bindActionCreators(tabsactions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Page);
