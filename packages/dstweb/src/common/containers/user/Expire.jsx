import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Modal, Button, Form, Input, Radio, Row, Col } from 'antd'
import moment from 'moment'
import PropTypes from 'prop-types'
import SvgIcon from 'SvgIcon';
import classnames from 'classnames'
import { toJSON, genAction, genFetchOptions, proxy } from 'yxyweb/common/helpers/util';
import env from 'yxyweb/common/helpers/env';


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
    // componentWillReceiveProps(nextProps){
    //   if(nextProps.visible != this.props.visible && !nextProps.visible){
    //     this.setState({
    //       inputActCode: '',
    //       inputValidCode: ''
    //     })
    //   }
    // }
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
      const { visible, onCancel, form, user } = this.props;
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
              {getFieldDecorator('activeCode', {
                rules: [{
                  validator: this.validFunction
                }],
              }
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
export class ExpireInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      normalVisible: false,
      errorVisible: false,
    }
  }
  showModal = () => {
    this.setState({
      normalVisible: true,
    });
  }
  showErrorModal = () => {
    this.setState({
      errorVisible: true,
    })
  }
  handleCancel = (obj) => {
    this.setState({ normalVisible: obj.visible });

  }
  handleErrorCancel = () => {
    this.setState({ errorVisible: false });

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
    const { tenant } = this.props.user;
    const { leftTime } = tenant;
    if (leftTime == -1) {
      // 跳转过期页面
      this.context.router.history.push('/expire')
    }
  }
  render() {
    const { tenant, userType } = this.props.user;
    const { leftTime } = tenant;
    let isTouchMode = env.INTERACTIVE_MODE;
    return leftTime < 30 && leftTime != -1 && (
      <div className={classnames('billing-expireInfoWrap', this.props.className)}>
        <div className='billing-expireInfo'>
          <span>  <SvgIcon type="wenxintishi" /></span>
          <span>贵公司的租约将于<strong>{moment().add(leftTime, 'days').format('YYYY-MM-DD')}</strong>过期，还有<strong>{leftTime}</strong>天到期，如需继续使用，请联系客服续约！联系电话： <strong>010-86393388 / 转5</strong>&nbsp;&nbsp;&nbsp;&nbsp;
          {isTouchMode == 'pc' ? <Button type="primary" onClick={userType === 0 ? this.showModal : this.showErrorModal}>立即激活</Button> : null}
          </span></div>
        <CollectionActCodeForm
          visible={this.state.normalVisible}
          onCancel={this.handleCancel}
          callBackCancel={this.handleCancel}
        />
        <Modal
          wrapClassName='activeErrModal'
          className='activeErrModal_common'
          visible={this.state.errorVisible}
          onCancel={this.handleErrorCancel}
          footer={null}
        >
          <p><i className="anticon anticon-error"></i>只有超级管理员才可以激活哦！</p>
          <Button type='primary' onClick={this.handleErrorCancel}>我知道了</Button>
        </Modal>

      </div>)
  }
}


const CollectionActCodeForm_login = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      if (process.env.__CLIENT__) {
        this.validCodeUrl = '/register/validcode';
        this.state = {
          url: this.getValidCodeUrl(),
          activateInfo: null,
          userNameErrMsg: null,
          activeErrMsg: null,
          validErrMsg: null,
          psdErrMsg: null,
          disabled:false,
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
      let userNameErrMsg, psdErrMsg, activeErrMsg, validErrMsg;
      let formData = this.props.form.getFieldsValue()
      if (!formData.username) {
        userNameErrMsg = '请输入用户名'
      }
      if (!formData.password) {
        psdErrMsg = "请输入密码"
      }
      if (!formData.activeCode) {
        activeErrMsg = "请输入激活码"

      }
      if (!formData.validCode) {
        validErrMsg = "请输入验证码"

      }
      if (userNameErrMsg || psdErrMsg || activeErrMsg || validErrMsg) {
        this.setState({
          activateInfo:null,
          userNameErrMsg: userNameErrMsg,
          psdErrMsg: psdErrMsg,
          activeErrMsg: activeErrMsg,
          validErrMsg: validErrMsg,
        })
        return
      }
      this.setState({ userNameErrMsg:null,psdErrMsg: null, activeErrMsg: null, validErrMsg: null })
      const proxy = cb.rest.DynamicProxy.create({ activate: { url: '/register/openAppNoLogin', method: 'POST' } });
      proxy.activate(formData, (err, result) => {
        if (err) {
          this.setState({ activateInfo: err.message, url: this.getValidCodeUrl() })
        } else {
          cb.utils.alert('恭喜，激活成功啦！'),
          this.setState({disabled:true})
            setTimeout(() => {
              // window.location.reload()
              window.location.href = '/portal';
            }, 2000)
        }
      })
    }
    innerModalCancel = () => {
      this.props.form.setFieldsValue({ password: '', activeCode: '', validCode: '' })
      this.setState({
        activateInfo: null,
        userNameErrMsg:null,
        activeErrMsg: null, validErrMsg: null, psdErrMsg: null, url: this.getValidCodeUrl()
      })
      if (this.props.callBackCancel) {
        this.props.callBackCancel({ visible: false })
      }
    }
    render() {
      const imgCom = process.env.__CLIENT__ ? <img src={this.state.url} /> : null;
      const { visible, onCancel, form } = this.props;
      const { getFieldDecorator } = form;
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
          wrapClassName="activeModal_NoLogin"
          className="activeModal_NoLogincommon"
          onCancel={this.innerModalCancel}>
          <Form className='activation-list' layout="vertical" >
            <FormItem>
              {getFieldDecorator('username',
                { initialValue: this.props.userName })(
                  <Input placeholder='请输入用户名' />
                )}
              {this.state.userNameErrMsg ? <div className='noLogin_expire_ErrMsg'>{this.state.userNameErrMsg}</div> : null}

            </FormItem>
            <FormItem>
              {getFieldDecorator('password'
              )(
                <Input type="password" placeholder='请输入密码' />
              )}
              {this.state.psdErrMsg ? <div className='noLogin_expire_ErrMsg'>{this.state.psdErrMsg}</div> : null}

            </FormItem>

            <FormItem>
              {getFieldDecorator('activeCode'

              )(
                <Input placeholder="请输入激活码" />
              )}
              {this.state.activeErrMsg ? <div className='noLogin_expire_ErrMsg'>{this.state.activeErrMsg}</div> : null}
            </FormItem>
            <FormItem>
              <Row className="valid-code">
                {getFieldDecorator('validCode')(
                  <Input size="large" placeholder='请输入验证码' />
                )}
                <a className='verify-img' size="large" onClick={() => this.handleRefresh()}>{imgCom}</a>
              </Row>
              {this.state.validErrMsg ? <div className='noLogin_expire_ErrMsg'>{this.state.validErrMsg}</div> : null}

              {this.state.activateInfo ? <div className="noLogin_expire_ErrMsg">{this.state.activateInfo}</div> : null}
            </FormItem>

            <Button type='primary' disabled={this.state.disabled} onClick={() => this.getActivationInfo()}>立即激活</Button>
          </Form>
        </Modal>
      );
    }
  }
);
class ExpirePage extends Component {
  constructor(props) {
    super(props)
  }
  state = {
    visible: false,
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

  renderTouch = () => {
    return <div className={classnames("billing-expire-overdue", this.props.className)}>
      <dl className="clearfix">
        <dd className="title">贵公司的租约过期啦～</dd>
        <dt></dt>
        <dd>如需继续使用，请与您的客户经理联系续约事项</dd>
        <dd>或致电免费客服客服热线：<span>010-86393388 / 转5</span></dd>
      </dl>
    </div>
  }

  renderPC = () => {
    return <div className={classnames("billing-expire-overdue")}>
      <dl className="clearfix">
        <dt></dt>
        <dd className="title">哎呀，贵公司的租约过期啦～</dd>
        <dd>如需继续使用，请与您的客户经理联系续约事项</dd>
        <dd>或致电免费客服客服热线： 010-86393388 / 转5</dd>
        <dd className="btn">
          <button className="primary" onClick={this.showModal}>立即激活</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <button onClick={() => {
            this.context.router.history.push('/login')
          }}>返回
          </button>
        </dd>
      </dl>
      <CollectionActCodeForm_login
        userName={this.props.user.username}
        visible={this.state.visible}
        callBackCancel={this.handleCancel}
      />
    </div>
  }

  render() {

    return this.props.mode === 'touch' && this.renderTouch() || this.renderPC()

  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user.toJS()
  }
}

function mapDispatchToProps(dispatch) {
  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpirePage)
