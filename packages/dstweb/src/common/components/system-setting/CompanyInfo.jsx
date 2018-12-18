import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { TreeRefer, Row, Col, Label, Input, Cascader } from 'yxyweb/common/components/basic'
import { Button, Select } from 'antd';
import Cookies from 'cookies-js';
import UpLoadFace from '../account-center/UpLoadFace';
import * as systemSettingactions from '../../redux/modules/systemSetting';
import * as tabsactions from 'yxyweb/common/redux/tabs';

class CompanyInfoControl extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {},
            oldName: ''
        };
        this.treeModel = new cb.models.TreeModel({ dataSourceMode: 'a', keyField: 'id', titleField: 'name' })
        this.industryOptions=[];
    }
    componentDidMount() {
        var proxy = cb.rest.DynamicProxy.create({
            getDetail: {
                url: '/tenant/find.do',
                method: 'GET',
                options: { token: true }
            },
            getIndustry: {
                url: 'enum/getEnumMap',
                method: 'GET',
                options: { token: true }
            }
        });
        proxy.getIndustry({enumtype: 'aa_tradetype'}, function (err, result ) {
            if (err) {
                console.error(err.message);
                cb.utils.alert(err.message, 'error');
                return;
            }
            this.getIndustryOptions(result)
            proxy.getDetail({}, function (err, result) {
                if (err) {
                    console.error(err.message);
                    cb.utils.alert(err.message, 'error');
                    return;
                }
                this.props.systemSettingactions.companyInfoMerge({hasOpenUdh: result.isOpenUdh});
                this.setState({ dataSource: result, oldName: result.name });
                this.treeModel.setDataSource({ url: '/region/getAllregion', method: 'POST' });
                this.treeModel.on('afterSetDataSource', function (data) {
                    let rCode = self.state.dataSource.regionCode;
                    let value = [];
                    let value2 = [];
                    while (rCode != undefined && rCode != "") {
                        value.push(rCode);
                        var nodes = self.treeModel.getNodesByKeys(rCode);;
                        if (nodes != undefined && nodes.length > 0) {
                            rCode = nodes[0].parent;
                        }
                        else {
                            rCode = "";
                        }
                    }
                    if (value.length > 0) {
                        for (var i = 1; i <= value.length; i++) {
                            value2.push(value[value.length - i]);
                        }
                    }
                    self.treeModel.setValue(value2);
                }, self = this);
            }, this)
        },this)
    }
    getIndustryOptions(data){
        let arr = [];
        for(let attr in data){
            arr.push(<Select.Option key={attr}>{data[attr]}</Select.Option>)
        }
        this.industryOptions=arr;
    }
    componentWillUnmount() {
        const { systemSettingactions } = this.props;
        systemSettingactions.unMount();
    }
    render() {
        const { systemSetting } = this.props;
        return (
            <div>
                <div className='info-content'>
                    <Row>
                        <Col span={24}>
                            <div className="viewSetting viewCell width-percent-100">
                                <UpLoadFace class_name='face-img companyInfo-logo-img' isLogo={true} imgUrl={systemSetting.logo ? systemSetting.logo : this.state.dataSource.logo} />
                            </div>
                            <div className="viewSetting viewCell width-percent-100">
                                <Input ref="err" err={systemSetting.nameErrMsg ? 'has-error' : null} defaultValue={this.state.dataSource.name} onBlur={(value) => this.handleInputBlur("name", value, true)} onChange={(value) => this.onTaxChange(value)} placeholder='请输入公司名称' cShowCaption="公司名称" bIsNull={false} />
                            </div>
                            <div className="viewSetting viewCell width-percent-100">
                                <Input defaultValue={systemSetting.taxId ? systemSetting.taxId : this.state.dataSource.taxId} onBlur={(value) => this.handleInputBlur("taxId", value)} placeholder='请输入纳税人识别号' cShowCaption="纳税人识别号" />
                            </div>
                            <div className="viewSetting viewCell width-percent-100">
                                <Input ref="err" err={systemSetting.nameErrMsg ? 'has-error' : null} defaultValue={this.state.dataSource.alias} onBlur={(value) => this.handleInputBlur("alias", value, true)} placeholder='请输入别名代码' cShowCaption="别名代码" disabled={true} bIsNull={false} />
                            </div>
                            <div className="viewSetting viewCell width-percent-100">
                                <Input ref="err" err={systemSetting.phoneErrMsg ? 'has-error' : null} defaultValue={this.state.dataSource.phone} onBlur={(value) => this.handleInputBlur("phone", value, true)} bIsNull={false} placeholder='请输入联系人电话' cShowCaption="联系人电话" />
                                <span className="err-info">{systemSetting.phoneErrMsg ? '请填写正确的电话号码' : ''}</span>
                            </div>
                            <div className="viewSetting viewCell width-percent-100">
                                <Input ref="err" err={systemSetting.emailErrMsg ? 'has-error' : null} defaultValue={this.state.dataSource.email} onBlur={(value) => this.handleInputBlur("email", value, true)} placeholder='请输入公司邮箱' cShowCaption="公司邮箱" bIsNull={false} />
                                <span className="err-info">{systemSetting.emailErrMsg ? '请填写正确的邮箱号' : ''}</span>
                            </div>
                            <div className="viewSetting viewCell width-percent-100">
                                <Input defaultValue={this.state.dataSource.fax} onBlur={(value) => this.handleInputBlur("fax", value)} placeholder='请输入公司传真' cShowCaption="公司传真" />
                            </div>
                            <div className="viewSetting viewCell width-percent-100">
                                <Input defaultValue={this.state.dataSource.website} onBlur={(value) => this.handleInputBlur("website", value)} placeholder='请输入公司网址' cShowCaption="公司网址" />
                            </div>
                            <div className="viewSetting viewCell width-percent-100">
                                <Label control={<Select disabled value={this.state.dataSource.industry!=undefined?this.state.dataSource.industry.toString():''} onChange={key=>this.handleIndustryChange(key)} placeholder='请输入行业' cShowCaption="所属行业">{this.industryOptions ? this.industryOptions : null}</Select>} title='所属行业' />
                            </div>
                            <div className="viewSetting viewCell width-percent-100">
                                {/*<TreeRefer cShowCaption='所属区域' ref='region' cRefType='aa_areaclass' value={this.state.dataSource.region_name} afterOkClick={(value)=>this.mapValueChange('region',value)} placeholder='请选择所属区域'/>*/}
                                <Cascader  cShowCaption='所在地区' ref='regionCode' model={this.treeModel} />
                            </div>
                            <div className="viewSetting viewCell width-percent-100">
                                <Input cStyle='{"type":"textarea","rows":3}' defaultValue={this.state.dataSource.address} onBlur={(value) => this.handleInputBlur("address", value, false)} placeholder='请输入详细地址' cShowCaption="详细地址" />
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
    onTaxChange(value) {
        let { dataSource } = this.state;
        this.props.systemSettingactions.companyInfoMerge({ taxId: '' });
        dataSource.taxId = '';
        dataSource.name = value;
        this.setState({ dataSource })
    }
    handleIndustryChange(key) {
        let dataSource = this.state.dataSource;
        dataSource.industry = key;
        this.setState(dataSource)
    }
    mapValueChange(type, value) {
        let referDataSource = this.state.dataSource;
        referDataSource[type] = value[0].id;
        this.setState(referDataSource)
    }
    handleInputBlur(flag, value, isStar) {
        let { systemSettingactions, systemSetting } = this.props;
        const pattern = /^1[3|4|5|7|8][0-9]{9}$/;
        let dataSource = this.state.dataSource;
        let flagErrMsg = flag + 'ErrMsg';
        let middle = {};
        dataSource[flag] = value;
        if (isStar === true) {
            if (value) {
                middle[flagErrMsg] = false
                systemSettingactions.companyInfoMerge(middle)
            } else {
                middle[flagErrMsg] = true;
                systemSettingactions.companyInfoMerge(middle)//发送错误标志的信息
                // cb.utils.alert('该选型为必填项，请填写！', 'warning');
            }
        }
        if (flag == 'phone') {
            if (value) {
                if (pattern.test(value)) {
                    middle[flagErrMsg] = false
                    systemSettingactions.companyInfoMerge(middle)
                } else {
                    middle[flagErrMsg] = true;
                    systemSettingactions.companyInfoMerge(middle)//发送错误标志的信息
                    // cb.utils.alert('请填写正确的电话号码！', 'warning');
                }
            }
        }
        if(flag === 'email') {
            if(value){
                if(/^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/.test(value)){
                    middle[flagErrMsg] = false
                    systemSettingactions.companyInfoMerge(middle)
                }else{
                     middle[flagErrMsg] = true;
                    systemSettingactions.companyInfoMerge(middle)//发送错误标志的信息
                    // cb.utils.alert('请填写正确的邮箱！', 'warning');
                }
            }
        }
        if(flag === 'name'){
            if(this.state.oldName === value) return //避免重复查
            this.props.systemSettingactions.getTaxNo(value);
            this.setState({ oldName: value })
        }
        this.setState({ dataSource });
    }
    handleCancelClick() {
        this.props.tabsactions.deleteItem('AA0001')
    }
    handleSaveClick() {
        let { systemSetting } = this.props;
        let isOpen = true;
        let dataSource = this.state.dataSource;
        let mustOptions = [dataSource.alias, dataSource.name, dataSource.phone, dataSource.email];
        let regionValue = this.treeModel.getValue();
        //错误标记
        mustOptions.forEach((value) => {
            if (value === null || value === '') {
                isOpen = false;
            }
        })
        if (!isOpen) {
            cb.utils.alert('存在为必填项，请填写！', 'error');
            return
        }
        if (systemSetting.logo) this.state.dataSource.logo = systemSetting.logo;
        if (systemSetting.taxId) this.state.dataSource.taxId = systemSetting.taxId;
        this.state.dataSource.pubts = null;
        if (regionValue)
            this.state.dataSource.regionCode = regionValue[regionValue.length - 1];
        this.saveData(this.state.dataSource)
    }
    saveData(data) {
        let saveLogo = this.state.dataSource.logo
        let { systemSettingactions, systemSetting } = this.props;
        var proxy = cb.rest.DynamicProxy.create({
            save: {
                url: '/tenant/save.do',
                method: 'POST',
                options: { token: true }
            }
        });
        proxy.save(data, function (err, result) {
            if (err) {
                console.error(err.message);
                cb.utils.alert('存在为必填项，请填写！', 'error');
                return;
            }
            cb.utils.alert('保存成功！', 'success')
            // const user = JSON.parse(Cookies.get('user'));
            // user.logo = data.logo;
            // const expires = new Date(Date.now() + 24 * 3600 * 1000)
            // Cookies.set('user', JSON.stringify(user), {
            //     path: '/',
            //     expires
            // });
            systemSettingactions.passLogo(saveLogo);

        })
    }
}

function mapStateToProps(state) {
    return {
        systemSetting: state.systemSetting.toJS()
    }
}

function mapDispatchToProps(dispatch) {
    return {
        systemSettingactions: bindActionCreators(systemSettingactions, dispatch),
        tabsactions: bindActionCreators(tabsactions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CompanyInfoControl);
