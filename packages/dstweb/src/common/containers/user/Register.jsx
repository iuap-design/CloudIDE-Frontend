import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Form, Input, Button, Checkbox, Card, Row, Col, Icon, Popover, Steps, Select } from 'antd';
import Cookies from 'cookies-js';
import uuid from 'uuid';
import moment from 'moment';

import ActionStatus from 'yxyweb/common/constants/ActionStatus'

import * as regactions from '../../redux/modules/register';
import * as useractions from '../../redux/modules/user';
import {getTaxNo} from '../../redux/modules/systemSetting'

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
      regactions.checkRepeat('mobile', e.target.value)
    } else {
      regactions.setPhoneNumber('');
    }
    this.setButtonEnabled();
  }
  handlePhoneChangeMsg() {
    let status = null, text = null;
    if(!this.phoneFisrtOnBlur) return { status, text }
    let { checkRepeat_mobile, phoneNumber } = this.props.reg;
    if (phoneNumber) {
      if(checkRepeat_mobile){
        status = 'error';
        text = checkRepeat_mobile;
      }
    }else{
      status = 'error';
      text = '手机号码格式不对';
    }
    return {status, text}
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
            {/*{ validator: this.handlePhoneChangeMsg }*/}
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
      {reg.agreeMsg ? <div className='register_agreeMsg'>{reg.agreeMsg}</div> : null }
      <FormItem {...tailFormItemLayout} className='checkbox-txt'>
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

class SecondComponent extends Component {
  constructor(props) {
    super(props);
    this.validPsd = false;//有效密码
    this.validConfirmPsd = false;//有效确认密码
    this.validCorpName = false;//有效公司名称
    this.validAntdFields = false;//antd的验证
    this.codeFisrtOnBlur = false
    this.emailFisrtOnBlur = false
    this.aliasFisrtOnBlur = false
  }
  componentWillReceiveProps(nextProps) {
    let err = nextProps.form.getFieldsError();
    let values = nextProps.form.getFieldsValue();
    this.validAntdFields = true;
    for (var item in err) {
      if (err[item]) this.validAntdFields = false;
    }
    for (var key in values) {
      if(key == 'contact') continue;
      if (values[key]===undefined) this.validAntdFields = false;
    }
    this.setSecondStepButton();
  }
  componentDidMount(){
    this.props.regactions.getIndustry();
  }
  handlePsdIsOpen() {
    let { regactions } = this.props;
    const { reg } = this.props;
    var flag;
    if (!reg.psdIsOpen) flag = true;
    if (reg.psdIsOpen) flag = false;
    regactions.setPsdIsOpen(flag)
  }
  psdIconType() {
    let { reg } = this.props;
    if (reg.psdIsOpen) {
      return 'password-show';
    } else {
      return 'password-hide';
    }
  }
  inputType() {
    let { reg } = this.props;
    if (reg.psdIsOpen) {
      return 'text';
    } else {
      return 'password';
    }
  }
  isValidPsd(val) {
    // const regs = /^[\w]{6,20}$/;
    const regs = /^[!@#$%\^&*\(\)\{\}\[\];.,\/\|+\-=:"'<>?\w]{6,20}$/;
    return regs.test(val) ? true : false;
  }
  handleCorpNameChange(e) {
    let { regactions } = this.props
    const pattern = /[\u4e00-\u9fa5a-zA-Z]{4,20}/;
    let isValidCorpName = true;
    if (isValidCorpName) {
      regactions.setErrorMsg({ corpNameMsg: '' });
      this.validCorpName = true;
      this.props.getTaxNo(e.target.value, (data)=>{
        this.props.form.setFieldsValue({ taxId: data})
      })
    } else {
      regactions.setErrorMsg({ corpNameMsg: '1' });
      this.validCorpName = false;
    }
  }
  corpNameChange(value){
    this.props.form.setFieldsValue({ taxId: ''})
  }
  handlePsdChange(e) {
    let { form, reg, regactions } = this.props;
    if (this.isValidPsd(e.target.value)) {
      const middle = e.target.value;
      if (reg.confirmPsd == middle) {
        this.confirmPsdMsg = true;
        regactions.setConfirmPsdMsg('');
      } else {
        if (reg.confirmPsd !== '') {
          this.confirmPsdMsg = false;
          regactions.setConfirmPsdMsg(1);
        }
      }
      this.validPsd = true;
      regactions.setValidPsd(e.target.value);
    } else {
      this.validPsd = false;
      regactions.setPsdErrorMsg(e.target.value)//发送密码不合格时的错误信息
    }
  }
  handleConfirmPsdChange(e) {
    let { reg, regactions } = this.props;
    if (e.target.value == reg.validPsd) {
      this.validConfirmPsd = true;
      regactions.setConfirmPsdMsg('');
    } else {
      this.validConfirmPsd = false;
      regactions.setConfirmPsdMsg(1);
    }
    regactions.setConfirmPd(e.target.value);
  }
  setSecondStepButton() {
    let { reg, regactions } = this.props;
    let flags = this.validCorpName && this.validPsd && this.validConfirmPsd && this.validAntdFields;//随时可加更多验证条目
    regactions.setSecondStepButtonEnabled(flags)
  }

  userNameBlur(e) {
    let { regactions, reg } = this.props;
    this.codeFisrtOnBlur = true;
    regactions.setOptions({userName: e.target.value})
    if(e.target.value){
      regactions.checkRepeat('code', e.target.value)
    }
  }

  handleUserNameMsg() {
    let status = null, text = null;
    if(!this.codeFisrtOnBlur) return { status, text };
    let { checkRepeat_code, userName } = this.props.reg;
    if(userName){
      if(checkRepeat_code){
        status = 'error';
        text = checkRepeat_code
      }
    }else{
      status = 'error';
      text = '登录账号不能为空'
    }
    return { status, text };
  }

  emailBlur(e){
    let value = e.target.value;
    let { regactions, reg } = this.props;
    this.emailFisrtOnBlur = true;
    const pattern = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
    let isEmail =  pattern.test(reg.contact_email) ? true : false;
    regactions.setOptions({contact_email: value})
    if(isEmail){
      regactions.checkRepeat('email', value)
    }
  }

  handleEmailMsg(){
    let { reg, regactions } = this.props;
    const pattern = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
    let isEmail =  pattern.test(reg.contact_email) ? true : false;
    let text = null, status = null;
    if(!this.emailFisrtOnBlur) return { status, text};
    if(isEmail){
      if(reg.checkRepeat_email){
        status = 'error';
        text = reg.checkRepeat_email;
      }
    }else{
      if(reg.contact_email){
        status = 'error';
        text = '邮箱格式不合法'
      }else{
        status = 'error';
        text = '邮箱不能为空'
      }
    }
    return { status, text};
  }

  aliasBlur(e){
    let { regactions } = this.props;
    this.aliasFisrtOnBlur = true;
    const pattern = /^[\w]{4,18}$/;
    let isAlias =  pattern.test(e.target.value) ? true : false
    if(isAlias){
      regactions.checkRepeat('alias', e.target.value)
    }
    regactions.setOptions({corp_alias: e.target.value})
  }

  handleAliasMsg(){
    let { reg, regactions } = this.props;
    const pattern = /^[\w]{4,18}$/;
    let isAlias =  pattern.test(reg.corp_alias) ? true : false
    let text = null, status = null;
    if(!this.aliasFisrtOnBlur) return { status, text};
    if(isAlias){
      if(reg.checkRepeat_alias){
        status = 'error';
        text = reg.checkRepeat_alias;
      }
    }else{
      if(reg.corp_alias){
        status = 'error';
        text = '公司别名代码不合法'
      }else{
        status = 'error';
        text = '公司别名代码不能为空'
      }
    }
    return { status, text};
  }

  handleIndustryChange(key){
    this.props.regactions.setOptions({ industry: key})
  }

  getIndustryOptions(){
      let data = this.props.reg.industryDataSource;
      let arr = [];
      for(let attr in data){
          arr.push(<Select.Option key={attr}>{data[attr]}</Select.Option>)
      }
      return arr;
  }

  render() {
    const FormItem = Form.Item;
    const { reg, form } = this.props;
    const { getFieldDecorator } = form;
    let { industryDataSource, industry } = reg;
    let industry_data = industryDataSource ? this.getIndustryOptions() : null;
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
    const CorpNameValidation = {
      validateStatus: reg.corpNameMsg ? 'error' : null,
      help: reg.corpNameMsg ? '公司名称不合法' : null
    }
    const passwordValidation = {
      validateStatus: reg.psdErrorMsg ? 'error' : null,
      help: reg.psdErrorMsg ? '密码不符合格式要求(6-20位数字或字母,不允许有空格)' : null
    };
    const confirmPsdValidation = {
      validateStatus: reg.confirmPsdMsg ? 'error' : null,
      help: reg.confirmPsdMsg ? '两次密码输入不一致' : null
    };
    const userNameValidation = {
      validateStatus: this.handleUserNameMsg().status,
      help: this.handleUserNameMsg().text
    };
    const emailValidation = {
      validateStatus: this.handleEmailMsg().status,
      help: this.handleEmailMsg().text
    };
    const aliasValidation = {
      validateStatus: this.handleAliasMsg().status,
      help: this.handleAliasMsg().text
    };
    return <Form className='register-list'>
      <FormItem label="登录账号" {...formItemLayout} {...userNameValidation}>
        {getFieldDecorator('username', {
          rules: [{
            message: '', required: true
          }],
        })(
          <Input onBlur={(e)=>this.userNameBlur(e)} placeholder="请输入账号" />
          )}
      </FormItem>
      <FormItem label="登录密码" {...formItemLayout} {...passwordValidation}>
        {getFieldDecorator('password', {
          rules: [{
            message: '登录密码必输', required: true
          }],
        })(
          <div className='register-password'>
            <Input size='large' onBlur={e => this.handlePsdChange(e)} type={this.inputType()} placeholder="请输入6~20位数字和字母组合" />
            <Icon onClick={() => this.handlePsdIsOpen()} type={this.psdIconType()} />
          </div>
          )}
      </FormItem>
      <FormItem label="确认密码" {...formItemLayout} {...confirmPsdValidation}>
        {getFieldDecorator('password_confirm', {
          rules: [{
            message: '确认密码必输', required: true
          }],
        })(
          <Input type="password" onBlur={e => this.handleConfirmPsdChange(e)} placeholder="请输入密码" />
          )}
      </FormItem>
        <FormItem label="邮箱" {...formItemLayout} {...emailValidation}>
        {getFieldDecorator('contact_email', {
          rules: [{
            message: '', required: true
          }],
        })(
          <Input onBlur={(e)=>this.emailBlur(e)} placeholder="请输入邮箱" />
          )}
      </FormItem>
      <FormItem label="公司名称" {...CorpNameValidation} {...formItemLayout}>
        {getFieldDecorator('corp_name', {
          rules: [
            { message: '公司名称必输', required: true}
          ],
        })(
          <Input onChange={value => this.corpNameChange(value)} onBlur={(e) => this.handleCorpNameChange(e)} placeholder="请输入公司名称 " />
          )}
      </FormItem>
      <FormItem label="公司税号" {...formItemLayout}>
        {getFieldDecorator('taxId', {
          rules: [
            { message: ''}
          ],
        })(
          <Input placeholder="公司税号" />
          )}
      </FormItem>
      <FormItem label="别名代码" {...formItemLayout} {...aliasValidation}>
        {getFieldDecorator('corp_alias', {
          rules: [{
            message: '', required: true
          }],
        })(
          <Input onBlur={(e)=>this.aliasBlur(e)} placeholder="请输入4~18位数字和字母组合" />
          )}
      </FormItem>
      <FormItem label="所属行业" {...formItemLayout}>
        {getFieldDecorator('industry', {
          rules: [{
            message: '所属行业必输', required: true
          }],
        })(
          <Select setFieldsValue={industry ? industry : ''} onChange={key=>this.handleIndustryChange(key)} placeholder='请选择行业'>{industry_data}</Select>
          )}
      </FormItem>

      <FormItem label="联系人姓名" {...formItemLayout}>
        {getFieldDecorator('contact', {
          rules: [{
            message: '',
          }],
        })(
          <Input placeholder="请输入联系人姓名" />
          )}
      </FormItem>
    </Form>
  }
}
const SecondStep = Form.create({})(SecondComponent);

class ThirdStep extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let { reg } = this.props;
    return <div className='register-list register-list-03' >
      <h3>恭喜 {reg.userName}</h3>
      <p>注册成功啦!</p>
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
  '#icon-gerenxinxi',
  '#icon-zuzhi',
  '#icon-chenggong'
];
const steps = [{
  title: '个人信息'
}, {
  title: '企业信息'
}, {
  title: '注册成功'
}];

class Register extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  next() {
    let { reg, regactions } = this.props;
    let formValue = null, isError = false;
    if (reg.current === 0) {
      this.refs.first.validateFieldsAndScroll((err, values) => {
        if (err) isError = true;
        formValue = values;
      });
      if (isError) return;
      regactions.checkSmsCode(formValue);
    } else if (reg.current === 1) {
      this.refs.second.validateFieldsAndScroll((err, values) => {
        if (err) isError = true;
        formValue = values;
        formValue.phoneNumber = reg.phoneNumber;
      });
      if (isError) return;
      regactions.setErrorMsg({ userName: formValue.username });
      regactions.setOptions({ buttonLoading: true })
      regactions.saveCorp(formValue);
    }
  }
  checkPassowrd(rule, value, callback) {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('pwd')) {
      callback('两次密码输入不一致');
    } else {
      callback();
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
  immediateExperience() {
    let { reg, useractions, regactions } = this.props;
    regactions.clear();
    this.context.router.history.push('/login');
    let loginData = {};
    loginData.username = reg.userName;
    loginData.password = reg.validPsd;
    loginData.loginTime = moment().format('YYYY-MM-DD');
    useractions.login(loginData);
  }

  render() {
    const { reg, regactions, getTaxNo } = this.props;
    this.fillIcon(reg.current);
    let stepContent = null;
    switch (reg.current) {
      case 0:
        stepContent = <FirstStep ref='first' reg={reg} regactions={regactions} />;
        break;
      case 1:
        stepContent = <SecondStep ref='second' reg={reg} getTaxNo={getTaxNo} regactions={regactions} />;
        break;
      case 2:
        stepContent = <ThirdStep reg={reg} regactions={regactions} />;
        break;
    }
    return (
      <div className='bg-gray'>
        <div className="login-nav">
          <div className="login-main">
            <div className="login-left"><span className="logo-img"></span><em>企业注册</em></div>
            <ul className="login-right">
              <li>我已注册？ <a onClick={() => this.handleLogin()} className="btn-reg">立即登录</a></li>
            </ul>
          </div>
        </div>

        <div className="register-bg">
          <div className="img"></div>
          <div className='register-title'><span className='reg-pic'></span></div>
          <div className="register-main">
            <div className='register-box'>
              <Steps current={reg.current}>
                {steps.map(item => <Step key={item.title} title={item.title} icon={<svg className="icon" aria-hidden="true"><use href={item.icon}></use></svg>} />)}
              </Steps>
              <div className="steps-content">{stepContent}</div>
              <div className="steps-action">
                <div className='btn-block'>
                  {
                    reg.current === 0
                    &&
                    <Button type="primary" disabled={!reg.firstStepButtonEnabled} onClick={() => this.next()}>下一步</Button>
                  }
                </div>

                {
                  reg.current === steps.length - 1
                  &&
                  <div className='btn-inline'>
                    <Button type="primary" onClick={() => this.immediateExperience()}>立即登录</Button></div>
                }

                <div className='btn-block' style={{ marginTop: '40px' }}>
                  {
                    reg.current === 1
                    &&
                    <Button type="primary" loading={reg.buttonLoading ? true : false} disabled={!reg.secondStepButtonAnabled} onClick={() => this.next()}>{reg.buttonLoading ? '注册中...' : '下一步'}</Button>

                  }
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
    reg: state.register.toJS()
  }
}

function mapDispatchToProps(dispatch) {
  return {
    regactions: bindActionCreators(regactions, dispatch),
    useractions: bindActionCreators(useractions, dispatch),
    getTaxNo: bindActionCreators(getTaxNo, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Register)
