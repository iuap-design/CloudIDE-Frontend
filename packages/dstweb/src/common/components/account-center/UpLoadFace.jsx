import React, { Component } from 'react';
import { Upload, Icon, message } from 'antd';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Label, Row, Col } from 'yxyweb/common/components/basic';
import * as accountactions from '../../redux/modules/user';
import * as systemSettingactions from '../../redux/modules/systemSetting';

class UpLoadFace extends Component {
  constructor(props) {
    super(props);
    this.url;
    var proxy = cb.rest.DynamicProxy.create({
      getFileServerUrl: {
        url: '/pub/fileupload/getFileServerUrl',
        method: 'GET',
        options: {
          token: true
        }
      }
    });
    proxy.getFileServerUrl({}, function (err, result) {
      if (!err)
        this.url = result;
    }, this);
  }
  getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  beforeUpload = (file) => {
    const isJPG = file.type === 'image/jpeg' || 'image/png';
    if (!isJPG) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error('Image must smaller than 1MB!');
    }
    return isJPG && isLt1M;
  }

  handleChange = (info) => {
    let { accountactions, systemSettingactions } = this.props;
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      // this.getBase64(info.file.originFileObj, imageUrl => accountactions.setAccountMsg({accountImgUrl:imageUrl}));
      if (info.file.response.code == 200) {
        if(this.props.isLogo===true){
          systemSettingactions.companyInfoMerge({logo: this.url + info.file.response.data })
        }else{
          accountactions.setAccountMsg({ accountImgUrl: this.url + info.file.response.data })
        }
      }
    }
  }
  getFaceUploadControl = () => {
    let { account, systemSetting } = this.props;
    let imageUrl;
    if(this.props.isLogo===true){
      imageUrl = systemSetting.logo ? systemSetting.logo : this.props.imgUrl;
    }else{
      imageUrl = account.accountImgUrl ? account.accountImgUrl : this.props.imgUrl;
    }
    let context = cb.rest.AppContext;
    let action = '/upload?token=' + context.token;
    return (
      <Row className={this.props.class_name} colCount={6}>
        <Upload
          className="avatar-uploader"
          showUploadList={false}
          action={action}
          beforeUpload={this.beforeUpload}
          onChange={this.handleChange}
          accept="image/jpeg,image/png"
        >
          {
            imageUrl ?
              <div className='info-person'>
                  <img src={imageUrl} alt="" />
                <div className='info-person-mask'><Icon type='uploadimg' /><p>点击上传</p></div>
              </div> :
              <div className='info-person info-person-img'>
                <div className='info-person-mask'><Icon type='uploadimg' /><p>点击上传</p></div>
              </div>
          }
        </Upload>
        <span>{this.props.isLogo ? '仅支持JPG、JPEG、BMP、PNG格式，文件小于2M（建议使用镂空白色图像，最佳尺寸130*40px）':'仅支持JPG、JPEG、BMP、PNG格式，文件小于2M'}</span>
      </Row>
    )
  }
  render() {
    let control = this.getFaceUploadControl();
    let label_name;
    if(this.props.isLogo===true){
      label_name = '企业logo'
    }else{
      label_name = '头像'
    }
    return (
      <Row>
        <Col className='label-control logo-face-label' span={4}><label>{label_name}</label></Col>
        <Col className='input-control' span={16}>
          {control}
        </Col>
      </Row>

    );
  }

}

function mapStateToProps(state) {
  return {
    account: state.user.toJS(),
    systemSetting: state.systemSetting.toJS()
  }
}

function mapDispatchToProps(dispatch) {
  return {
    accountactions: bindActionCreators(accountactions, dispatch),
    systemSettingactions: bindActionCreators(systemSettingactions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UpLoadFace);
