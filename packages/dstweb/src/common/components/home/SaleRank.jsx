import React from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Row, Col } from 'yxyweb/common/components/basic';
import { Progress, Icon } from 'antd';
import HomeTitle from './HomeTitle';
import * as common from './HomeCommon';
//import ReactEcharts from 'echarts-for-react';
import SvgIcon from 'SvgIcon'
import * as homeActions from '../../redux/modules/home'
import { moreButtonHandler } from 'yxyweb/common/redux/tree';

class CompleteOrderControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: props.title || '销售排名',
            cControlType: props.cControlType || '',
            data:[{name:'三里屯店',value:99999},{name:'西单店',value:88888},{name:'西直门店',value:77777},{name:'昌平店',value:66666},
                  {name:'同马店',value:55555},{name:'西二旗店',value:44444},{name:'王府井店',value:33333},{name:'回龙观店',value:22222}]
        };
        this.onDateChange = this.onDateChange.bind(this);
        this.props.homeActions.getSaleRankData({});
    }
    onDateChange(date,type) {
        let { saleRankStore } = this.props.home;
        if(type === 'more'){
            let activeKey='SJ0103';
            let selectedNode={"level":2,"tenant":516379152306432,"isShopRelated":false,"name":"销售排名","code":"SJ0103","isEnd":true,"authCode":"rm_salerankinglist","parentCode":"SJ01","_walkStatus":"Allow","metaKey":"rm_saleranking","id":0,"subId":"SJ","disabled":false,"authLevel":3,"metaType":"voucherlist","viewType":"meta"}
            this.props.moreButtonHandler(activeKey, selectedNode, null)
        }else{
            this.props.homeActions.setOptions({saleRankBegin: date[1], saleRankEnd: date[0]})
            this.props.homeActions.getSaleRankData({beginDate: date[1], endDate: date[0], store_id: saleRankStore});
        }
    }

    onAddressChange = (val) => {
        let { saleRankBegin, saleRankEnd } = this.props.home
        this.props.homeActions.setOptions({saleRankStore: val})
        this.props.homeActions.getSaleRankData({beginDate: saleRankBegin, endDate: saleRankEnd, store_id: val});
    }

    getrank(data,type) {
        if(!data) return null
        let progressColor, currentName, currentValue, accuracy;
        if(type==='门店'){
            progressColor='6196FF';
            currentName = "store_name"
            currentValue = "fMoneySumTotal"
            accuracy = cb.rest.AppContext.option.amountofdecimal//金额
        }
        if(type==='店员') {
            progressColor='11D5A0';
            currentName = "iEmployeeid_name"
            currentValue = "fMoneyTotal"
            accuracy = cb.rest.AppContext.option.amountofdecimal//金额
        }
        if(type==='商品') {
            progressColor='FFA768';
            currentName = "product_cName"
            currentValue = "fQuantityTotal"
            accuracy = cb.rest.AppContext.option.quantitydecimal//数量
        }
        let maxValue = 0,okData;
        let rankArr=[];
        if(data && data.length<7) okData=data;
        if(data && data.length>=7) okData=data.slice(0,6);
        okData.forEach(ele=>{
             if(Math.abs(ele[currentValue]) > maxValue)
                maxValue = Math.abs(ele[currentValue])
        })
        okData.forEach(function(element,index){
            let ele;
            let rank=element.num;
            let percent=Math.ceil((Math.abs(element[currentValue])/maxValue)*100);
            let isCurrentStore = element.isCurrentStore;
            let slef_name = element.isCurrentStore ? (type==='门店' ? '(本门店)' : '(我自己)') : '';
            ele=<li key={rank}>
                    <div className={isCurrentStore ? 'saleRank_self' : ''}>
                        <span title={`${element[currentName]}${slef_name}`} className="saleRank_name">{`${rank}.${element[currentName]}`}</span>
                        <span title={parseFloat(element[currentValue]).toFixed(accuracy)} className="saleRank_value">{parseFloat(element[currentValue]).toFixed(accuracy)}</span>
                    </div>
                    <Progress percent={percent} showInfo={false} />
                </li>
            rankArr.push(ele);
        },this)
        if(rankArr.length==0)
            rankArr.push(<li className="saleRank_nodata"><Icon type="anticon anticon-nodata"/>暂无数据哦~</li>)
        return rankArr;
    }
    getContent() {
        let { storeBizObjects, employeeBizObjects, productBizObjects}=this.props.home.saleRankData || {};
        return (
            <div className="home-rank clearfix">
                <Col span={8}>
                    <div className="title"><SvgIcon type="shouye"/>门店</div>
                    <ul>
                        {this.getrank(storeBizObjects,'门店')}
                    </ul>
                </Col>
                <Col span={8}>
                    <div className="title"><SvgIcon type="huiyuanguanli"/>营业员</div>
                    <ul>
                        {this.getrank(employeeBizObjects,'店员')}
                    </ul>
                </Col>
                <Col span={8}>
                    <div className="title"><SvgIcon type="lingshouguanli1"/>商品</div>
                    <ul>
                        {this.getrank(productBizObjects,'商品')}
                    </ul>
                </Col>
            </div>
        )
    }
    render() {
        let content= this.getContent();
        return (
            <div className='home-panel home-overview'>
                <Row>
                    <HomeTitle defaultStore={this.props.user.showStore === false ? '' : this.props.user.storeId} dataSource={this.props.user.showStore === false ? null : this.props.user.userStores} haveAddress={true} title={this.state.title} onDateChange={this.onDateChange} onAddressChange={this.onAddressChange} />
                </Row>
                <Row >
                    {content}
                </Row>
            </div>
        )
    }
}


function mapStateToProps(state) {
  return {
    home: state.home.toJS(),
    user: state.user.toJS()
  }
}

function mapDispatchToProps(dispatch) {
  return {
    homeActions: bindActionCreators(homeActions, dispatch),
    moreButtonHandler: bindActionCreators(moreButtonHandler, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CompleteOrderControl);
