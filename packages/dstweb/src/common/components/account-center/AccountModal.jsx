import { Form, Button, Modal, Input } from 'antd';
import { Row, Col } from 'yxyweb/common/components/basic';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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

const FormItem = Form.Item;
class AccountModalControl extends Component {
  constructor(props) {
    super(props);
    let { forget } = this.props;
  }
  hideModal = () => {
    let { forgetactions } = this.props;
    this.setState({
      visible: false,
    });
    forgetactions.setMsg({
      visible: false,
      phoneNumber: '',
      phoneMsg: false,
      smsCodeMsg: '',
      smsCodeStatus: ActionStatus.READY,
    });
  }
  hideModalAndPost = () => {
    let { form, forgetactions, forget } = this.props;
    let formValue = {}, isError = false;
    form.validateFieldsAndScroll((err, values) => {
      if (err) isError = true;
      formValue = values;
    });
    if (forget.phoneMsg) isError = true;
    if (isError) return;
    forgetactions.checkResetPhoneSmsCode(formValue);
  }
  isValidPhone(str) {
    const pattern = /^1[3|4|5|7|8][0-9]{9}$/;
    return pattern.test(str) ? true : false;
  }
  handlePhoneChangeMsg(e) {
    let { forgetactions } = this.props;
    if (this.isValidPhone(e.target.value)) {
      forgetactions.setPhoneNumber(e.target.value);
      forgetactions.setMsg({ phoneMsg: false });
    } else {
      forgetactions.setPhoneNumber('');
      forgetactions.setMsg({ phoneMsg: true })
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
  handleSmsCode() {
    let { form, forgetactions } = this.props;
    let formValue = {}, isError = false;
    form.validateFieldsAndScroll(['phone'], (err, values) => {
      if (err) isError = true;
      formValue = values;
    });
    if (isError) return;
    forgetactions.getResetPhoneSmsCode(formValue);
  }
  handleTickClear() {
    let { forgetactions } = this.props;
    forgetactions.setSmsCodeStatus(ActionStatus.READY);
  }

  render() {
    const { forget, form, account } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 5 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 16 },
        sm: { span: 16 },
      },
    };

    const smsCodeValidation = {
      validateStatus: forget.smsCodeMsg ? 'error' : null,
      help: forget.smsCodeMsg ? forget.smsCodeMsg : null
    };
    const phoneValidation = {
      validateStatus: forget.phoneMsg ? 'error' : null,
      help: forget.phoneMsg ? '手机号码格式不对' : null
    };
    const disabled = forget.phoneNumber === '' || forget.smsCodeStatus === ActionStatus.ING || forget.smsCodeStatus === ActionStatus.SUCCESS;
    const tickCom = forget.smsCodeStatus === ActionStatus.SUCCESS ? <Tick clear={() => this.handleTickClear()} /> : '获取验证码';
    return (
      <Modal
        title="修改手机"
        visible={forget.visible}
        onOk={this.hideModalAndPost}
        onCancel={this.hideModal}
        okText='确认'
        cancelText='取消'
        style={{ top: '30%' }}
        width='420'
      >

        <Form className='phone-modify'>
          <p className='phone-txt'>手机号每天只能修改一次哦！</p>
          <FormItem label="新手机" {...formItemLayout} {...phoneValidation}>
            {getFieldDecorator('phone', {
              rules: [
                { message: '', },
              ],
            })(
              <Input size="small" onChange={e => this.handlePhoneChangeMsg(e)} placeholder="请输入新手机号" />
              )}
          </FormItem>
          <FormItem
            {...formItemLayout} {...smsCodeValidation}
            label="验证码"
          >
            <Row style={{ marginRight: '20' }}>
              <Col span={16}>
                {getFieldDecorator('smsCode', {
                  rules: [
                    { message: '' },
                  ]
                })(
                  <Input size="small" onChange={(e) => this.handleSmsCodeChange(e)} />
                  )}
              </Col>
              <Col span={8}>
                <Button style={{ marginLeft: '10' }} type="primary" size="small" disabled={disabled} onClick={() => this.handleSmsCode()}>{tickCom}</Button>
              </Col>
            </Row>
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

const AccountModal = Form.create({})(AccountModalControl);

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

export default connect(mapStateToProps, mapDispatchToProps)(AccountModal)
