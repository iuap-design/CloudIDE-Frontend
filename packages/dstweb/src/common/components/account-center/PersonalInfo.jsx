import React, { Component } from 'react';
import { Form, Button, Card } from 'antd';
import { TreeRefer, Row, Col, Label, Input } from 'yxyweb/common/components/basic'
import UpLoadFace from './UpLoadFace';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Cookies from 'cookies-js';
import * as accountactions from '../../redux/modules/user';
import * as tabsactions from 'yxyweb/common/redux/tabs';
import * as forgetactions from '../../redux/modules/forget';
import AccountModal from './AccountModal';

const FormItem = Form.Item;

class PersonalInfoControl extends Component {
  constructor(props) {
    super(props);
    let { forget } = this.props;
    this.state = {
      dataSource: {},
      newKey: 0,
    };
    // this.formValue={};
    this.handleInputBlur = this.handleInputBlur.bind(this);
  }
  componentWillUnmount() {
    //清除store中的数据
    let { forgetactions, accountactions } = this.props;
    // accountactions.setAccountMsg({ accountImgUrl: '' })
    forgetactions.unMount();
  }
  handleSaveClick() {
    let { account, accountactions, forget } = this.props;
    this.state.dataSource.id = account.id;
    this.state.dataSource.mobile = forget.resetPhone ? forget.resetPhone : this.state.dataSource.mobile;
    this.state.dataSource.avatar = account.accountImgUrl ? account.accountImgUrl : this.state.dataSource.avatar;
    this.state.dataSource.tel = this.state.dataSource.masterLandLine ? this.combineTel(this.state.dataSource.masterLandLine, this.state.dataSource.landLine) : this.state.dataSource.landLine;
    for (let key in this.state.dataSource) {
      if (this.state.dataSource[key] === "") this.state.dataSource[key] = null;
    }
    if (!this.state.dataSource.name) {
      cb.utils.alert('存在必填数据！请检查！', 'warning');
    } else {
      //需要的数据存进store并发送服务
      accountactions.setAccountMsg({ avatar: account.accountImgUrl, name: this.state.dataSource.name })//重新更改user.avatar
      this.saveFormValues(this.state.dataSource);
    }
  }
  saveFormValues = (data) => {
    var proxy = cb.rest.DynamicProxy.create({
      save: {
        url: '/user/save',
        method: 'POST',
        options: { token: true }
      }
    });
    proxy.save(data, function (err, result) {
      if (err) {
        console.error(err.message);
        cb.utils.alert(err.message, 'error');
        return;
      }
      cb.utils.alert('保存成功！', 'success')
      // const user = JSON.parse(Cookies.get('user'));
      // user.avatar = data.avatar;
      // user.name = data.name;
      // const expires = new Date(Date.now() + 24 * 3600 * 1000)
      // Cookies.set('user', JSON.stringify(user), {
      //   path: '/',
      //   expires
      // });
    })
  }
  handleInputBlur(flag, value) {
    let { forgetactions } = this.props;
    let dataSource = this.state.dataSource;
    dataSource[flag] = value;
    if (flag == 'name') {
      if (value) {
        forgetactions.setMsg({ nameMsg: false })
      } else {
        forgetactions.setMsg({ nameMsg: true })
      }
    }
    this.setState({ dataSource });
  }
  componentDidMount() {
    let { account, accountactions } = this.props;
    let id = account.id;
    var proxy = cb.rest.DynamicProxy.create({
      find: {
        url: '/user/find',
        method: 'GET',
        options: { token: true }
      }
    });
    proxy.config.find.url = proxy.config.find.url;
    proxy.find({}, function (err, result) {
      if (err) {
        console.error(err.message);
        return;
      } else {
        let dataSource = {};
        if (result.avatar) {
          accountactions.setAccountMsg({ accountImgUrl: result.avatar });
          dataSource.avatar = result.avatar;
        }
        dataSource.userType = result.userType;
        dataSource.name = result.name || '';
        dataSource.avatar = result.avatar || '';
        dataSource.nickName = result.nickName || '';
        dataSource.position = result.position || '';
        dataSource.mobile = result.mobile || '';
        dataSource.email = result.email || '';
        dataSource.qq = result.qq || '';
        dataSource.wechat = result.wechat || '';
        dataSource.department_name = result.department_name || '';
        dataSource.department = result.department;
        dataSource.masterLandLine = result.tel ? this.splitTel(result.tel)[0] : '';
        dataSource.landLine = result.tel ? this.splitTel(result.tel)[1] : '';
        this.setState({ dataSource: dataSource });
      }
    }, this);
  }
  splitTel = (tel) => {
    let telArr = tel.split('-');
    return telArr;
  }
  combineTel = (masterLandLine, landLine) => {
    return masterLandLine + '-' + landLine;
  }
  mapValueChange(value) {
    // this.state.dataSource.department = value[0].id;
    let dataSource = this.state.dataSource;
    dataSource.department_name = value[0].name;
    dataSource.department = value[0].id
    this.setState({ dataSource })
  }
  handleCancelClick() {
    const { tabsactions, accountactions } = this.props;
    accountactions.setAccountMsg({ accountImgUrl: '' });
    tabsactions.deleteItem('accountCenter');
  }
  handleChangePhone() {
    let { forgetactions } = this.props;
    forgetactions.setMsg({ visible: true });
    this.setState({ newKey: new Date().getTime() })
  }
  render() {
    const { form, account, forget } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };
    // const defaultNameValue='王俊凯';
    const handleUserType = (value) => {
      switch (value) {
        case 0:
          return '超级管理员';
        case 1:
          return '公司员工';
        case 2:
          return '服务商管理员';
        case 3:
          return '服务商员工';
        default:
          return '尚未配置字段';
      }
    }
    return (
      <div>
        <AccountModal key={this.state.newKey} />
        <div className='info-content'>
          <Row>
            <Col span={24}>
              <div className="viewSetting viewCell width-percent-100">
                <UpLoadFace class_name='face-img basic-avatar-portrait' imgUrl={this.state.dataSource.avatar} />
              </div>
              <div className="viewSetting viewCell width-percent-100">
                <Input err={forget.nameMsg ? 'has-error' : null} ref="accountName" onBlur={value => this.handleInputBlur('name', value)} defaultValue={this.state.dataSource.name} cShowCaption="姓名" bIsNull={false} />
              </div>
              <div className="viewSetting viewCell width-percent-100">
                <Input onBlur={value => this.handleInputBlur('nickName', value)} defaultValue={this.state.dataSource.nickName} placeholder='您的专属昵称' cShowCaption="昵称" bIsNull={true} />
              </div>
              <div className="viewSetting viewCell width-percent-100">
                {/*<Col className='label-control' span={4}><label>角色</label></Col>
                <Col className='input-control' span={16}>
                  <div className='face-right-txt'>{handleUserType(this.state.dataSource.userType)}</div>
                </Col>*/}
                <Input disabled defaultValue={handleUserType(this.state.dataSource.userType)} cShowCaption="角色" bIsNull={true} />
              </div>
              <div className="viewSetting viewCell width-percent-100">
                <TreeRefer cShowCaption='部门' ref='department' cRefType='aa_department' value={this.state.dataSource.department_name} afterOkClick={(value) => this.mapValueChange(value)} placeholder='部门名称' />
              </div>
              <div className="viewSetting viewCell width-percent-100">
                <Input onBlur={value => this.handleInputBlur('position', value)} defaultValue={this.state.dataSource.position} placeholder='职位名称' cShowCaption="职位" bIsNull={true} />
              </div>
              <div className="viewSetting viewCell width-percent-100">
                {/*<Col className='label-control' span={4}><label>手机</label></Col>
                <Col className='input-control' span={16}>
                  <div className='face-right-txt'>中国（+86）{forget.resetPhone ? forget.resetPhone : this.state.dataSource.mobile}<a onClick={() => this.handleChangePhone()}>修改手机</a></div>
                </Col>*/}
                <Input disabled defaultValue={forget.resetPhone ? forget.resetPhone : this.state.dataSource.mobile} cShowCaption="手机" bIsNull={true} /><a className="infor-phone" onClick={() => this.handleChangePhone()}>修改手机</a>
              </div>
              <div className="viewSetting viewCell width-percent-100">
			    <Row>
                  <Col className='label-control' span={4}><label>座机</label></Col>
                  <Col className='input-control' span={16}>
                    <div className="infor-input-extension">
                      <div className="extension"><Input onBlur={value => this.handleInputBlur('masterLandLine', value)} defaultValue={this.state.dataSource.masterLandLine} placeholder='主机号' bIsNull={true} /></div>
                      <div className="extension-num"><p className='line-split'><span>——</span></p></div>
                      <div className="extension"><Input onBlur={value => this.handleInputBlur('landLine', value)} defaultValue={this.state.dataSource.landLine} placeholder='分机号' bIsNull={true} /></div>
                    </div>
                  </Col>
				</Row>
              </div>
              <div className="viewSetting viewCell width-percent-100">
                <Input onBlur={value => this.handleInputBlur('email', value)} defaultValue={this.state.dataSource.email} placeholder='绑定邮箱以便接受通知和回复工单' cShowCaption="邮箱" bIsNull={true} />
              </div>
              <div className="viewSetting viewCell width-percent-100">
                <Input onBlur={value => this.handleInputBlur('wechat', value)} defaultValue={this.state.dataSource.wechat} placeholder='微信账号' cShowCaption="微信" bIsNull={true} />
              </div>
              <div className="viewSetting viewCell width-percent-100">
                <Input onBlur={value => this.handleInputBlur('qq', value)} defaultValue={this.state.dataSource.qq} placeholder='QQ账号' cShowCaption="QQ" bIsNull={true} />
              </div>
            </Col>
          </Row>
        </div>
        <div className='ant-row-flex ant-row-flex-start btn-toolbar-bottom btn-group-bottom bottom-toolbar'>
                  <Row colCount={12}>
                    <Button type='primary' className='m-l-148' onClick={() => this.handleSaveClick()}>保存</Button>
                    <Button type="default" className='m-l-10' onClick={() => this.handleCancelClick()}>取消</Button>
                  </Row>
        </div>
      </div>
    )
  }
}
const PersonalInfo = Form.create({})(PersonalInfoControl);

const mapStateToProps = (state, ownProps) => {
  return {
    account: state.user.toJS(),
    tabs: state.tabs.toJS(),
    forget: state.forget.toJS()
  }
}

function mapDispatchToProps(dispatch) {
  return {
    accountactions: bindActionCreators(accountactions, dispatch),
    tabsactions: bindActionCreators(tabsactions, dispatch),
    forgetactions: bindActionCreators(forgetactions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonalInfo)
