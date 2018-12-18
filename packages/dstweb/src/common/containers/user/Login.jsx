import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import { Form, Input, Button, Checkbox, DatePicker, Select, Card, Row, Col, Icon, Popover } from 'antd';

import * as logactions from '../../redux/modules/user';
import ActionStatus from 'yxyweb/common/constants/ActionStatus';
import addEventListener from 'rc-util/lib/Dom/addEventListener';

class LoginComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: true,
      username: null,
    };
    this.onDocumentClick = this.onDocumentClick.bind(this);
    this.rememberUser = process.env.__CLIENT__ ? (localStorage.getItem('rememberAccount') ? true : false) : false;
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleForget = () => {
    this.context.router.history.push('/forget')
  }
  onDocumentClick(e) {
    if (e.keyCode == 13) {
      this.handleLogin()
    }
  }
  removeEventListener() {
    if (this.handleEnterKeydown) {
      this.handleEnterKeydown.remove();
      this.handleEnterKeydown = null;
    }
  }
  componentDidMount() {
    if (!this.handleEnterKeydown) {
      this.handleEnterKeydown = addEventListener(document, 'keydown', this.onDocumentClick)
    }
    if (localStorage.getItem('rememberAccount')) {
      let account = JSON.parse(localStorage.getItem('rememberAccount'));
      this.setState({ username: account.username })
      //this.props.form.setFieldsValue({username:account.username, password:account.password});
      // this.props.form.setFieldsValue({password:account.password});
    }
  }
  componentWillUnmount() {
    this.removeEventListener()
  }
  handleUsernameChange(e) {
    let { logactions, user } = this.props;
    logactions.usernameChange(e.target.value, user.usernameMsg);
  }
  handlePasswordChange(e) {
    let { logactions, user } = this.props;
    logactions.passwordChange(e.target.value, user.passwordMsg);
  }
  handleLock() {
    let password = !this.state.password;
    this.setState({ password });
  }
  handleLogin() {
    let { form, logactions } = this.props;
    let formValue = {}, isError = false;
    form.validateFieldsAndScroll((err, values) => {
      if (err) isError = true;
      formValue = values;
    });
    if (isError) return;
    formValue.loginTime = moment().format('YYYY-MM-DD');
    formValue.rememberUser = this.rememberUser;
    logactions.login(formValue);
  }
  handleRemember(e) {
    if (e.target.checked === true) {
      this.rememberUser = true;
    } else {
      this.rememberUser = false;
    }
  }

  wechatLogin(){
    this.props.logactions.weChatLogin()
  }
  render() {
    const FormItem = Form.Item;
    const { form, user } = this.props;
    const { getFieldDecorator } = form;
    const pwdType = this.state.password ? 'password' : 'text';
    const pwdIcon = `password-${this.state.password ? 'hide' : 'show'}`;
    const usernameValidation = {
      validateStatus: user.usernameMsg ? 'error' : null,
      help: user.usernameMsg ? user.usernameMsg : null
    }
    const passwordValidation = {
      validateStatus: user.passwordMsg ? 'error' : null,
      help: user.passwordMsg ? user.passwordMsg : null
    }
    const validation = {
      validateStatus: user.errorMsg ? 'error' : null,
      help: user.errorMsg ? user.errorMsg : null
    }
    return <Form>
      <Card className="login-m-right" style={{ marginTop: '100px' }}>
        <div className='weChat_erweima'>
          <Popover overlayClassName="login_wechat_popover" placement="leftTop" content={<p className='weChat_erweima_tip'><Icon type="kuaisu"/>微信扫码登录更快捷</p>} trigger="hover">
            <Icon type='erweima' onClick={()=>this.wechatLogin()} />
          </Popover>
        </div>
        <div className="login-title">密码登录</div>
        <FormItem {...usernameValidation}>
          {getFieldDecorator('username', { initialValue: this.state.username })(
            <Input placeholder="账号/手机/邮箱"
              onChange={e => this.handleUsernameChange(e)}
              prefix={<Icon type="user" />}
            />
          )}
        </FormItem>
        <FormItem {...passwordValidation}>
          {getFieldDecorator('password')(
            <div className='login-password'>
              <Input type={pwdType} size='large' placeholder="密码" onChange={e => this.handlePasswordChange(e)}
                prefix={<Icon type="lock" />}
              />
              <span className='login-pas-icon'><Icon onClick={() => this.handleLock()} type={pwdIcon} /></span>
            </div>
          )}
        </FormItem>
        {user.errorMsg ? <div className="login_service_error">{user.errorMsg}</div> : null}
        <FormItem style={{ marginTop: -10, marginBottom: 15 }} >
          <span className="forget"><a onClick={this.handleForget}>忘记密码？</a></span><Checkbox defaultChecked={this.rememberUser} onChange={(e) => this.handleRemember(e)}>记住用户名</Checkbox>
        </FormItem>
        <div className="btn-block">
          <Button className="login-btn-lfrt"  onClick={() => this.handleLogin()}>登录</Button>
        </div>
        {/*<Button className="login-webchat" onClick={()=>this.wechatLogin()}>微信登录</Button>*/}
      </Card>
    </Form>
  }
}

const LoginForm = Form.create({})(LoginComponent);

const content = (
  <div className='tootip-txt'>
    <span></span>
    <p>扫码下载手机APP</p>
  </div>
);
class Login extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  handleRegister = () => {
    this.context.router.history.push('/register');
  }

  render() {
    const Option = Select.Option;
    const FormItem = Form.Item;
    const { user, logactions } = this.props;
    const formItemStyle = { width: '99%' };
    return (
      <div>
        <div className="login-nav header-bg">
          <div className="login-main">
            <div className="login-left"><span className="logo-img"></span><em className="header-left-color">欢迎登录</em></div>
            <ul className="login-right">
              <li></li><li><em className="header-color">还没有账号？</em> <a onClick={this.handleRegister} className="btn-red-wei">立即注册</a></li>
            </ul>
          </div>
        </div>
        <div className="login-bg" >
          <div className="login-bg-banner-top"></div>
          <div className="login-main">
            <Row>
              <Col span={12}>
                <div className="login-m-left"></div>
              </Col>
              <Col span={12}>
                <LoginForm user={user} logactions={logactions} />
              </Col>
            </Row>
          </div>
        </div>
        <div className="footer-new">©2018 用友网络科技股份有限公司.All rights reserved.</div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user.toJS()
  }
}

function mapDispatchToProps(dispatch) {
  return {
    logactions: bindActionCreators(logactions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
