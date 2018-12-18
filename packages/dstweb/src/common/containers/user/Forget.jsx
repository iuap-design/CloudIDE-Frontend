import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Form, Input, Button, Checkbox, Card, Row, Col, Icon, Popover, Steps } from 'antd';
import Cookies from 'cookies-js';
import uuid from 'uuid';

import ActionStatus from 'yxyweb/common/constants/ActionStatus'

import * as forgetactions from '../../redux/modules/forget';

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
    }
    this.validPhone = false;
    this.smsCode = false;
  }
  isValidPhone(str) {
    const pattern = /^1[3|4|5|7|8][0-9]{9}$/;
    return pattern.test(str) ? true : false;
  }
  handlePhoneChangeMsg = (rule, value, callback) => {
    let { forgetactions } = this.props;
    if (this.isValidPhone(value)) {
      callback();
      forgetactions.setPhoneNumber(value);
    } else {
      callback('手机号码格式不对');
      forgetactions.setPhoneNumber('');
    }
  }
  handleSmsCodeChange(e) {
    let { forgetactions } = this.props;
    if (e.target.value) {
      forgetactions.setSmsCodeValue(e.target.value);
    } else {
      forgetactions.setSmsCodeValue('');
    }
  }
  handleSmsCodeChangeMsg = (rule, value, callback) => {
    let { forgetactions } = this.props;
    if (!value) {
      callback('验证码不能为空');
    } else {
      callback();
    }
  }
  handleSmsCode() {
    let { form, forgetactions } = this.props;
    let formValue = {}, isError = false;
    form.validateFieldsAndScroll(['phone'], (err, values) => {
      if (err) isError = true;
      formValue = values;
    });
    if (isError) return;
    forgetactions.getSmsCode(formValue);
  }
  handleTickClear() {
    let { forgetactions } = this.props;
    forgetactions.setSmsCodeStatus(ActionStatus.READY);
  }
  render() {
    const FormItem = Form.Item;
    const { forget, form } = this.props;
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
    const disabled = forget.phoneNumber === '' || forget.smsCodeStatus === ActionStatus.ING || forget.smsCodeStatus === ActionStatus.SUCCESS;
    const tickCom = forget.smsCodeStatus === ActionStatus.SUCCESS ? <Tick clear={() => this.handleTickClear()} /> : '获取验证码';
    const validCodeValidation = {
      validateStatus: forget.validCodeMsg ? 'error' : null,
      help: forget.validCodeMsg ? forget.validCodeMsg : null
    };
    const smsCodeValidation = {
      validateStatus: forget.smsCodeMsg ? 'error' : null,
      help: forget.smsCodeMsg ? forget.smsCodeMsg : null
    };
    return <Form className='register-list'>
      <FormItem label="手机号" {...formItemLayout}>
        {getFieldDecorator('phone', {
          rules: [
            { message: '', },
            { validator: this.handlePhoneChangeMsg }
          ],
        })(
          <Input placeholder="请输入手机号" />
          )}
      </FormItem>
      <FormItem
        {...formItemLayout} {...smsCodeValidation}
        label="验证码"
      >
        <Row gutter={12}>
          <Col span={16}>
            {getFieldDecorator('smsCode', {
              rules: [
                { message: '' },
                { validator: this.handleSmsCodeChangeMsg }
              ]
            })(
              <Input size="large" onChange={(e) => this.handleSmsCodeChange(e)} />
              )}
          </Col>
          <Col span={8}>
            <Button type="primary" size="large" disabled={disabled} onClick={() => this.handleSmsCode()}>{tickCom}</Button>
          </Col>
        </Row>
      </FormItem>
    </Form>
  }
}
const FirstStep = Form.create({})(FirstComponent);

class SecondComponent extends Component {
  constructor(props) {
    super(props);
    this.validPsd = false;//有效密码
    this.validConfirmPsd = false;//有效确认密码
    this.validAntdFields = false;//antd的验证
  }
  handlePsdIsOpen() {
    let { forgetactions } = this.props;
    const { forget } = this.props;
    var flag;
    if (!forget.psdIsOpen) flag = true;
    if (forget.psdIsOpen) flag = false;
    forgetactions.setPsdIsOpen(flag)
  }
  psdIconType() {
    let { forget } = this.props;
    if (forget.psdIsOpen) {
      return 'password-show';
    } else {
      return 'password-hide';
    }
  }
  inputType() {
    let { forget } = this.props;
    if (forget.psdIsOpen) {
      return 'text';
    } else {
      return 'password';
    }
  }
  isValidPsd(val) {
    // const forgets = /^[\w]{6,20}$/;
    const forgets = /^[!@#$%\^&*\(\)\{\}\[\];.,\/\|+\-=:"'<>?\w]{6,20}$/;
    return forgets.test(val) ? true : false;
  }
  handlePsdChange(e) {
    let { form, forget, forgetactions } = this.props;
    if (this.isValidPsd(e.target.value)) {
      const middle = e.target.value;
      if (forget.confirmPsd == middle) {
        this.confirmPsdMsg = true;
        forgetactions.setConfirmPsdMsg('');
      } else {
        if (forget.confirmPsd !== '') {
          this.confirmPsdMsg = false;
          forgetactions.setConfirmPsdMsg(1);
        }
      }
      this.validPsd = true;
      forgetactions.setValidPsd(e.target.value);
    } else {
      this.validPsd = false;
      forgetactions.setValidPsd('')
      forgetactions.setPsdErrorMsg(e.target.value)//发送密码不合格时的错误信息
    }
  }
  handleConfirmPsdChange(e) {
    let { forget, forgetactions } = this.props;
    if (e.target.value == forget.validPsd) {
      this.validConfirmPsd = true;
      forgetactions.setConfirmPsdMsg('');
    } else {
      this.validConfirmPsd = false;
      forgetactions.setConfirmPsdMsg(1);
    }
    forgetactions.setConfirmPd(e.target.value);
  }
  render() {
    const FormItem = Form.Item;
    const { forget, form } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 6 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 16 },
        sm: { span: 16 },
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
    const passwordValidation = {
      validateStatus: forget.psdErrorMsg ? 'error' : null,
      help: forget.psdErrorMsg ? '密码不符合格式要求(6-20位数字或字母,不允许有空格)' : null
    };
    const confirmPsdValidation = {
      validateStatus: forget.confirmPsdMsg ? 'error' : null,
      help: forget.confirmPsdMsg ? '两次密码输入不一致' : null
    };
    return <Form className='forgetister-list'>
      <FormItem label="新密码" {...formItemLayout} {...passwordValidation}>
        {getFieldDecorator('password', {
          rules: [{
            message: '',
          }],
        })(
          <div className='register-password'>
            <Input size='large' onChange={e => this.handlePsdChange(e)} type={this.inputType()} placeholder="请输入6~20位数字和字母组合" />
            <Icon onClick={() => this.handlePsdIsOpen()} type={this.psdIconType()} />
          </div>
          )}
      </FormItem>
      <FormItem label="确认密码" {...formItemLayout} {...confirmPsdValidation}>
        {getFieldDecorator('password_confirm', {
          rules: [{
            message: '',
          }],
        })(
          <Input type="password" onChange={e => this.handleConfirmPsdChange(e)} placeholder="请确认密码" />
          )}
      </FormItem>
    </Form>
  }
}
const SecondStep = Form.create({})(SecondComponent);

class ThirdStep extends Component {
  render() {
    return <div className='register-list register-list-03' >
      <h3>恭喜 <span></span>重置成功啦!</h3>
      <p>请牢记新的登录密码!</p>
    </div>
  }
}

const content = (
  <div className='tootip-txt'>
    <span></span>
    <p>扫码下载手机APP</p>
  </div>
);
const Step = Steps.Step;
const icons = [
  '#icon-yanzhengshenfen',
  '#icon-zhongzhimima',
  '#icon-chenggong'
];
const steps = [{
  title: '身份验证'
}, {
  title: '重置密码'
}, {
  title: '找回成功'
}];

class forget extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  next() {
    let { forget, forgetactions } = this.props;
    let formValue = null, isError = false;
    if (forget.current === 0) {
      this.refs.first.validateFieldsAndScroll((err, values) => {
        if (err) isError = true;
        formValue = values;
      });
      if (isError) return;
      forgetactions.checkSmsCode(formValue);
    } else if (forget.current === 1) {
      this.refs.second.validateFieldsAndScroll(['password'], (err, values) => {
        if (err) isError = true;
        formValue = values;
        formValue.phone = forget.phoneNumber;
      });
      if (isError) return;
      forgetactions.saveCorp(formValue);
    }
  }
  handleDisabled = () => {
    let { forget, forgetactions } = this.props;
    if (forget.psdErrorMsg === '' && forget.confirmPsdMsg === '') {
      if (forget.validPsd && forget.confirmPsd !== '') return false;
      return true;
    } {
      return true
    }
  }
  handleLogin() {
    this.context.router.history.push('/login');
  }

  fillIcon(index) {
    for (var i = 0, len = steps.length; i < len; i++) {
      steps[i].icon = icons[i];
      if (i <= index)
        steps[i].icon += '_hover';
    }
  }

  render() {
    const { forget, forgetactions } = this.props;
    this.fillIcon(forget.current);
    let stepContent = null;
    switch (forget.current) {
      case 0:
        stepContent = <FirstStep ref='first' forget={forget} forgetactions={forgetactions} />;
        break;
      case 1:
        stepContent = <SecondStep ref='second' forget={forget} forgetactions={forgetactions} />;
        break;
      case 2:
        stepContent = <ThirdStep />;
        break;
    }
    return (
      <div className='bg-gray'>
        <div className="login-nav">
          <div className="login-main">
            <div className="login-left"><span className="logo-img"></span><em>欢迎登录</em></div>
            <ul className="login-right">
              <li>记住密码？ <a onClick={() => this.handleLogin()} className="btn-reg">直接登录</a></li>
            </ul>
          </div>
        </div>

        <div className="register-bg forget-bg">
          <div className="img"></div>
          <div className='register-title'><span className='forget-pic'></span></div>
          <div className="register-main">
            <div className='register-box'>
              <Steps current={forget.current}>
                {steps.map(item => <Step key={item.title} title={item.title} icon={<svg className="icon" aria-hidden="true"><use href={item.icon}></use></svg>} />)}
              </Steps>
              <div className="steps-content">{stepContent}</div>
              <div className="steps-action">
                <div className='btn-block'>
                  {
                    forget.current === 0
                    &&
                    <Button type="primary" disabled={forget.phoneNumber === '' || forget.smsCodeValue === ''} onClick={() => this.next()}>下一步</Button>
                  }
                </div>

                {
                  forget.current === steps.length - 1
                  &&
                  <div className='btn-inline'>
                    <Button type="primary" onClick={() => this.handleLogin()}>重新登录</Button>
                  </div>
                }

                <div className='btn-block' style={{ marginTop: '30px' }}>
                  {
                    forget.current === 1
                    &&
                    <Button type="primary" disabled={this.handleDisabled()} onClick={() => this.next()}>提交</Button>

                  }
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-new">版权所有信息</div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    forget: state.forget.toJS()
  }
}

function mapDispatchToProps(dispatch) {
  return {
    forgetactions: bindActionCreators(forgetactions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(forget)
