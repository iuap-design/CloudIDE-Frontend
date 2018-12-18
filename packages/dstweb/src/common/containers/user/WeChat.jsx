import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Form, Input, Button, Checkbox, Row, Col, Icon } from 'antd';
import Cookies from 'cookies-js';
import uuid from 'uuid';

import ActionStatus from 'yxyweb/common/constants/ActionStatus';

import * as regactions from '../../redux/modules/wechat';

class Tick extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seconds: 60
    }
  }
  componentDidMount() {
    this.setInterval(() => this.tick(), 1000);
  }
  componentWillMount() {
    this.intervals = [];
  }
  setInterval() {
    this.intervals.push(setInterval.apply(null, arguments));
  }
  clearInterval() {
    this.intervals.forEach(clearInterval);
  }
  componentWillUnmount() {
    this.clearInterval();
  }
  tick() {
    let seconds = this.state.seconds - 1;
    if (seconds === 0) {
      this.clearInterval();
      if (this.props.clear)
        this.props.clear();
    }
    this.setState({ seconds });
  }
  render() {
    return (
      <p>{this.state.seconds}s</p>
    )
  }
}

class FirstComponent extends Component {
  constructor(props) {
    super(props);
    if (process.env.__CLIENT__) {
      Cookies.set('uretailsessionid', uuid());
      this.validCodeUrl = '/register/validcode';
      this.state = {
        url: this.getValidCodeUrl()
      }
    }
    this.validPhone = false;
    this.validCode = null;
    this.smsCode = null;
    this.phoneFisrtOnBlur = false // phone触发onblur
  }
  isValidPhone(str) {
    const pattern = /^1[3|4|5|7|8][0-9]{9}$/;
    return pattern.test(str) ? true : false;
  }
  getValidCodeUrl() {
    return this.validCodeUrl + '?_=' + new Date().valueOf();
  }
  setButtonEnabled() {
    let { regactions, reg } = this.props;
    const getSmsCodeButtonEnabled = this.validPhone && this.validCode && !reg.checkRepeat_mobile;
    const firstStepButtonEnabled = getSmsCodeButtonEnabled && this.smsCode;
    regactions.setButtonEnabled({
      getSmsCodeButtonEnabled,
      firstStepButtonEnabled
    });
  }
  handlePhoneChange(e) {
    this.phoneFisrtOnBlur = true
    let { regactions } = this.props;
    this.validPhone = this.isValidPhone(e.target.value);
    if (this.validPhone) {
      regactions.setPhoneNumber(e.target.value);
      // regactions.checkRepeat('mobile', e.target.value)
    } else {
      regactions.setPhoneNumber('');
    }
    this.setButtonEnabled();
  }
  handlePhoneChangeMsg() {
    let status = null, text = null;
    if (!this.phoneFisrtOnBlur) return { status, text }
    let { checkRepeat_mobile, phoneNumber } = this.props.reg;
    if (phoneNumber) {
      if (checkRepeat_mobile) {
        status = 'error';
        text = checkRepeat_mobile;
      }
    } else {
      status = 'error';
      text = '手机号码格式不对';
    }
    return { status, text }
  }
  handleValidCodeChange(e) {
    this.validCode = e.target.value;
    this.setButtonEnabled();
  }
  handleSmsCodeChange(e) {
    this.smsCode = e.target.value;
    this.setButtonEnabled();
  }
  handleRefresh() {
    this.setState({ url: this.getValidCodeUrl() });
  }
  handleSmsCode() {
    let { form, regactions } = this.props;
    let formValue = {}, isError = false;
    form.validateFieldsAndScroll((err, values) => {
      if (err) isError = true;
      formValue = values;
    });
    if (isError) return;
    regactions.getSmsCode(formValue);
  }
  handleTickClear() {
    let { regactions } = this.props;
    regactions.setSmsCodeStatus(ActionStatus.READY);
  }
  handleChecked(e) {
    let { regactions } = this.props;
    regactions.setOptionChecked(e.target.checked);
  }
  render() {
    const FormItem = Form.Item;
    const { reg, form } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 6 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 18 },
        sm: { span: 18 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 11,
          offset: 6,
        },
      },
    };
    const imgCom = process.env.__CLIENT__ ? <img src={this.state.url} /> : null;
    const disabled = !reg.getSmsCodeButtonEnabled || reg.smsCodeStatus === ActionStatus.ING || reg.smsCodeStatus === ActionStatus.SUCCESS;
    const tickCom = reg.smsCodeStatus === ActionStatus.SUCCESS ? <Tick clear={() => this.handleTickClear()} /> : '获取验证码';
    const validCodeValidation = {
      validateStatus: reg.validCodeMsg ? 'error' : null,
      help: reg.validCodeMsg ? reg.validCodeMsg : null
    };
    const smsCodeValidation = {
      validateStatus: reg.smsCodeMsg ? 'error' : null,
      help: reg.smsCodeMsg ? reg.smsCodeMsg : null
    };
    const agreeValidation = {
      validateStatus: reg.agreeMsg ? 'error' : null,
      help: reg.agreeMsg ? reg.agreeMsg : null
    };
    const phoneValidation = {
      validateStatus: this.handlePhoneChangeMsg().status,
      help: this.handlePhoneChangeMsg().text
    }
    return <Form className='register-list'>
      <FormItem label="手机号" {...formItemLayout} {...phoneValidation}>
        {getFieldDecorator('phone', {
          rules: [
            { message: '', },
            {/*{ validator: this.handlePhoneChangeMsg }*/ }
          ],
          validateTrigger: 'onBlur'
        })(
          <Input placeholder="请输入手机号" onBlur={e => this.handlePhoneChange(e)} />
          )}
      </FormItem>
      <FormItem
        {...formItemLayout} {...validCodeValidation}
        label="图片验证码"
      >
        <Row gutter={12}>
          <Col span={16}>
            {getFieldDecorator('validCode')(
              <Input size="large" onChange={e => this.handleValidCodeChange(e)} />
            )}
          </Col>
          <Col span={8}>
            <a className='verify-img' size="large" onClick={() => this.handleRefresh()}>{imgCom}</a>
          </Col>
        </Row>
      </FormItem>
      <FormItem
        {...formItemLayout} {...smsCodeValidation}
        label="手机验证码"
      >
        <Row gutter={12}>
          <Col span={16}>
            {getFieldDecorator('smsCode')(
              <Input size="large" onChange={e => this.handleSmsCodeChange(e)} />
            )}
          </Col>
          <Col span={8}>
            <Button type="primary" size="large" disabled={disabled} onClick={() => this.handleSmsCode()}>{tickCom}</Button>
          </Col>
        </Row>
      </FormItem>
      <FormItem {...tailFormItemLayout} className='checkbox-txt' {...agreeValidation}>
        {getFieldDecorator('agreement', {
          valuePropName: 'checked',
          initialValue: true,
        })(
          <Checkbox onChange={e => this.handleChecked(e)}>已阅读并同意<a className='active' href="http://www.yyuap.com/page/service/book/yonyou_cloud/index.html#/yonyou_cloud/articles/yycloud/4-/fuwuxieyi.html ">用友云平台服务协议</a></Checkbox>
          )}
      </FormItem>
    </Form>
  }
}
const FirstStep = Form.create({})(FirstComponent);

class WeChat extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  next() {
    let { reg, regactions } = this.props;
    let formValue = null, isError = false;
    this.refs.first.validateFieldsAndScroll((err, values) => {
      if (err) isError = true;
      formValue = values;
    });
    if (isError) return;
    regactions.checkSmsCode(formValue);
  }

  handleLogin() {
    this.context.router.history.push('/login');
  }
  render() {
    const { reg, regactions } = this.props;
    let stepContent = <FirstStep ref="first" reg={reg} regactions={regactions} />;
    return (
      <div className='bg-gray'>
        <div className="login-nav">
          <div className="login-main">
            <div className="login-left"><span className="logo-img"></span><em>微信绑定</em></div>
            <ul className="login-right">
              <li>已有账号？ <a onClick={() => this.handleLogin()} className="btn-reg">立即登录</a></li>
            </ul>
          </div>
        </div>
        <div className="register-bg">
          <div className="img"></div>
          <div className='register-title'><span className='reg-pic'></span></div>
          <div className="register-main">
            <div className='register-box'>
              <div className="steps-content">
                <div className='wechat_register_tip'> <p> Hi，要先绑定手机号才能登录哦~</p></div>
                {stepContent}
              </div>
              <div className="steps-action">
                <div className='btn-block'>
                  <Button type="primary" disabled={!reg.firstStepButtonEnabled} onClick={() => this.next()}>绑定</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-new">©2018 用友网络科技股份有限公司.All rights reserved.</div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    reg: state.wechat.toJS()
  }
}

function mapDispatchToProps(dispatch) {
  return {
    regactions: bindActionCreators(regactions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WeChat)
