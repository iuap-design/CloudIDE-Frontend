import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Form, Input, Button, Checkbox, Card, Row, Col, Icon, Popover, Steps } from 'antd';
import * as forgetactions from '../../redux/modules/forget';

class ChangePassWordControl extends Component {
  constructor(props) {
    super(props);
    this.validPsd = false;//有效密码
    this.validConfirmPsd = false;//有效确认密码
    this.validAntdFields = false;//antd的验证
  }
  handlePsdIsOpen() {
    /*<Icon onClick={() => this.handlePsdIsOpen()} type={this.psdIconType()} />*/
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
  handleOkClick() {
    let { form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return
      if(values.password !== values.password_confirm) return
      // cb.utils.alert(JSON.stringify(values));
      this.props.forgetactions.save(values,form)
    })
  }
  render() {
    const FormItem = Form.Item;
    const { forget, form } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 3 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 8 },
        sm: { span: 8 },
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
    return (
      <div className="password-modify">

        <Form className=''>
          <FormItem label="旧密码"  {...formItemLayout} >
            {getFieldDecorator('old_password', {
              rules: [{
                message: '密码不能为空',
                required: true,
              }],
            })(
              <Input size='small' type="password" placeholder="请输入旧密码" />
              )}
          </FormItem>
          <FormItem label="新密码" {...formItemLayout} {...passwordValidation}>
            {getFieldDecorator('password', {
              rules: [{
                message: '',
                required: true
              }],
            })(
                <Input size='small' onChange={e => this.handlePsdChange(e)} type={this.inputType()} placeholder="6-20位数字或字母,不允许有空格" />
              )}
          </FormItem>
          <FormItem label="确认密码" {...formItemLayout} {...confirmPsdValidation}>
            {getFieldDecorator('password_confirm', {
              rules: [{
                message: '',
                required: true,
              }],
            })(
              <Input size='small' type="password" onChange={e => this.handleConfirmPsdChange(e)} placeholder="再次确认密码" />
              )}
          </FormItem>
          {forget.saveErrMsg ? <div className="change_psd_error">{forget.saveErrMsg}</div> : null}
        </Form>
        <Row className='btn-group-bottom' style={{ marginLeft: '0' }}>
          <Col offset={3}><Button type="primary" onClick={() => this.handleOkClick()}>保存</Button></Col>
        </Row>
      </div>
    )
  }
}
const ChangePassWord = Form.create({})(ChangePassWordControl);

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

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassWord)
