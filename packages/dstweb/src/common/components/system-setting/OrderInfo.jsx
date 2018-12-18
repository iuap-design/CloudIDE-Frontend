import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Form, Modal, Input, Row } from 'antd';
import SvgIcon from 'SvgIcon';

import * as systemSettingactions from '../../redux/modules/systemSetting';
const FormItem = Form.Item;
const CollectionActCodeForm = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      if (process.env.__CLIENT__) {
        this.validCodeUrl = '/register/validcode';
        this.state = {
          url: this.getValidCodeUrl(),
          activateInfo: null,
          activeErrMsg: null,
          validErrMsg: null,
        }
      } else {
        this.state = {
        }
      }
      this.validCode = null;
    }
    getValidCodeUrl() {
      return this.validCodeUrl + '?_=' + new Date().valueOf() + '&token=' + cb.rest.AppContext.token;
    }
    handleRefresh() {
      this.setState({ url: this.getValidCodeUrl() });
    }
    getActivationInfo() {
      let activeErrMsg, validErrMsg;
      let formData = this.props.form.getFieldsValue()
      if (!formData.activeCode) {
        activeErrMsg = "请输入激活码"

      }
      if (!formData.validCode) {
        validErrMsg = "请输入验证码"

      }
      if (activeErrMsg || validErrMsg) {
        this.setState({
          activateInfo:null,
          activeErrMsg: activeErrMsg,
          validErrMsg: validErrMsg,
        })
        return
      }
      this.setState({ activeErrMsg: null, validErrMsg: null })
      const proxy = cb.rest.DynamicProxy.create({ activate: { url: '/register/openApp', method: 'POST' } });
      proxy.activate(formData, (err, result) => {
        if (err) {
          this.setState({ activateInfo: err.message, url: this.getValidCodeUrl() })
        } else {
          cb.utils.alert('恭喜，激活成功啦！'),
            setTimeout(() => {
              window.location.reload()
            }, 2000)
        }
      })
    }

    innerModalCancel = () => {
      this.props.form.setFieldsValue({ activeCode: '', validCode: '' })
      this.setState({
        activateInfo: null,
        activeErrMsg: null, validErrMsg: null, url: this.getValidCodeUrl()
      })    
      if (this.props.callBackCancel) {
        this.props.callBackCancel({ visible: false })
      }
    }

    render() {
      const imgCom = process.env.__CLIENT__ ? <img src={this.state.url} /> : null;
      const { visible, form, user } = this.props;
      const { getFieldDecorator, resetFields } = form;
      const formItemLayout = {

        wrapperCol: { span: 12, offset: 6 },
      };
      const buttonLayout = {
        wrapperCol: { span: 4, offset: 10 },
      }

      return (
        <Modal
          visible={visible}
          footer={null}
          onCancel={this.innerModalCancel}
          wrapClassName="activeModalInner"
          className="activeModalInner_common"
        >
          <Form className='activation-list' layout="vertical" >
            <FormItem>
              {getFieldDecorator('activeCode'
              )(
                <Input placeholder="请输入激活码" />
              )}
              {this.state.activeErrMsg ? <div className='expire_Err_Msg'>{this.state.activeErrMsg}</div> : null}
            </FormItem>
            <FormItem>
              <Row className="valid-code">
                {getFieldDecorator('validCode')(
                  <Input size="large" placeholder='请输入验证码' />
                )}
                <a className='verify-img' size="large" onClick={() => this.handleRefresh()}>{imgCom}</a>
              </Row>
              {this.state.activateInfo ? <div className="expire_Err_Msg">{this.state.activateInfo}</div> : null}
              {this.state.validErrMsg ? <div className='expire_Err_Msg'>{this.state.validErrMsg}</div> : null}
            </FormItem>

            <Button type='primary' onClick={() => this.getActivationInfo()}>立即激活</Button>
          </Form>
        </Modal>
      );
    }
  }
);

class OrderInfo extends Component {

  constructor(props) {
    super(props)
    this.state={
      
      visible:false,
    }
  }
  showModal = () => {
    this.setState({
      visible: true,
    });
  }
  handleCancel = (obj) => {
    this.setState({ visible: obj.visible });

  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  shouldComponentUpdate(nextProps) {
    // todo
    return true
  }
  componentDidMount() {
    // cookie未过期但是租约已到期, 跳转页面
    if (this.props.leftTime == -1) {
      // 跳转过期页面
      this.context.router.history.push('/expire')
    }
  }
  render() {   
    return (
      <div className="open_order_service">
        <div className="u_service_icon">
          <div className="uretail-logo"></div>
        </div>
        <div className="u_service_right">
    <div className="u_service_h1">友零售{this.props.startTime?<span className="official">正式版</span>:<span className="try">试用版</span>}</div>
          <div className="u_service_p1">开通时间<strong>{this.props.startTime && moment(this.props.startTime).format('YYYY-MM-DD')}</strong></div>

          <div className="u_service_p1">到期时间<strong>{this.props.overTime && moment(this.props.overTime).format('YYYY-MM-DD')}</strong>{this.props.leftTime < 30 ? <span><em>(还有{this.props.leftTime}天到期)</em></span>:null}<Button type='primary'  onClick={this.showModal}>立即激活</Button> 
          <CollectionActCodeForm
          visible={this.state.visible}
          callBackCancel={this.handleCancel}
        />

          </div>
        </div>
      </div>
    )
  }
}



export default OrderInfo
