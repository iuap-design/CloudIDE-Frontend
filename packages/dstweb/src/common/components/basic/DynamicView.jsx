import React, { Component } from 'react';
import { Spin, Modal } from 'antd';
import { PortalTabItem } from '../portal';
import DynamicModal from 'yxyweb/common/components/basic/DynamicModal';

export default class DynamicView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.loadingCount = 0;
    cb.utils.loadingControl = {
      start: () => {
        cb.utils.loading(true);
        this.loadingCount++;
        if (this.loadingCount === 1)
          this.setState({ loading: true });
      },
      end: () => {
        cb.utils.loading(false);
        if (this.loadingCount > 0)
          this.loadingCount--;
        if (this.loadingCount === 0)
          this.setState({ loading: false });
      }
    };
    const { billtype, billno, billid } = this.props.match.params;
    const data = { billtype, billno };
    if (billid)
      data.params = billid === 'add' ? { mode: 'add' } : { mode: 'edit', id: billid };
    cb.loader.runCommandLine('bill', data, null, (vm, viewmeta) => {
      const content = { vm: vm, metaData: viewmeta };
      this.setState({ content });
    });
  }
  render() {
    if (!this.state.content)
      return <Spin className='portal-spin' size='large' tip='加载中...' />
    let loadingControl = null;
    if (this.state.loading)
      loadingControl = <Spin className='portal-spin' size='large' tip='加载中...' />
    return (<div className='meta-dynamic-view 222'>
      <PortalTabItem index={this.props.match.params.billno} content={this.state.content} width={document.body.clientWidth} />
      <DynamicModal />
      {loadingControl}
    </div>)
  }
}
