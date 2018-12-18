import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Row, Col } from 'yxyweb/common/components/basic';
import { Icon } from 'antd';
import HomeTitle from './HomeTitle';
import * as common from './HomeCommon';
import SvgIcon from 'SvgIcon'
import * as homeActions from '../../redux/modules/home'
import { moreButtonHandler } from 'yxyweb/common/redux/tree';

class TaskList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dateSource: { agentmoney: 0, settlemoney: 0, icount: 0 }
        };
        this.onDateChange = this.onDateChange.bind(this);
        this.startTime;
        this.endTime;
        this.type = 'week';
        // this.getsrvcomp({ "dprebegin": common.getDate('lastweek', '0'), "dpreend": common.getDate('lastweek', '1'), "dbegin": common.getDate('week', '0'), "dend": common.getDate('week', '1') });
    }

    componentDidMount(){
       this.props.homeActions.getTaskListData({})
    }

    onDateChange(date,type) {
        let { taskListStore } = this.props.home;
        if(type === 'more'){
            let activeKey='SJ0101';
            let selectedNode={"level":2,"tenant":516379152306432,"isShopRelated":false,"name":"销售分析","code":"SJ0101","isEnd":true,"authCode":"rm_saleanalysislist","parentCode":"SJ01","_walkStatus":"Allow","metaKey":"rm_saleanalysis","id":0,"subId":"SJ","disabled":false,"authLevel":3,"metaType":"voucherlist","viewType":"meta"}
            this.props.moreButtonHandler(activeKey, selectedNode, null)
        }else{
            this.props.homeActions.setOptions({taskListBegin: date[1], taskListEnd: date[0], taskListCompareBegin: date[3], taskListCompareEnd: date[2]})
            this.props.homeActions.getTaskListData({beginDate: date[1], endDate: date[0], compareBeginDate: date[3], compareEndDate: date[2], store_id: taskListStore});
        }
    }

    onAddressChange = (val) => {
        let { taskListBegin, taskListEnd, taskListCompareBegin, taskListCompareEnd } = this.props.home
        this.props.homeActions.setOptions({taskListStore: val})
        this.props.homeActions.getTaskListData({beginDate: taskListBegin, endDate: taskListEnd, compareBeginDate: taskListCompareBegin, compareEndDate: taskListCompareEnd, store_id: val});
    }

    // getContent(){
    //     let { taskListData } = this.props.home;
    //     let arr = [];
    //     let numAccuracy = cb.rest.AppContext.option.quantitydecimal;
    //     let moneyAccuracy = cb.rest.AppContext.option.amountofdecimal;
    //     let zero = 0;
    //     for(let attr in taskListData){
    //         if(attr === 'billnum')
    //             arr.push(<Col className='col' span={8}><div className='home-panel-2'><h5>成交笔数</h5><b>{taskListData[attr].toFixed(numAccuracy)}</b></div></Col>)
    //         if(attr === 'billnum' && taskListData[attr] == 0){
    //             arr.push(<Col className='col' span={8}><div className='home-panel-2'><h5>客单价(元)</h5><b>{zero.toFixed(moneyAccuracy)}</b></div></Col>)
    //             arr.push(<Col className='col' span={8}><div className='home-panel-2'><h5>销售金额(元)</h5><b>{zero.toFixed(moneyAccuracy)}</b></div></Col>)
    //         }
    //         if(attr === 'fBillAvgMoney')
    //             arr.push(<Col className='col' span={8}><div className='home-panel-2'><h5>客单价(元)</h5><b>{taskListData[attr].toFixed(moneyAccuracy)}</b></div></Col>)
    //         if(attr === 'fMoneySumTotal')
    //             arr.push(<Col className='col' span={8}><div className='home-panel-2'><h5>销售金额(元)</h5><b>{taskListData[attr].toFixed(moneyAccuracy)}</b></div></Col>)
    //     }
    //     return arr;
    // }

    getTopOrDown(element){
        if(element<0)
            return 'down'
        else
            return 'up'
    }

    getDom =(type) => {
        let { billNum, billNumGrowth,
              moneyTotal, moneyTotalGrowth,
              billAvgMoney, billAvgMoneyGrowth,
              memberNum, memberNumGrowth} = this.props.home.taskListData || {};
        let roleObj = {billNum, moneyTotal, billAvgMoney,memberNum}
        let numAccuracy = cb.rest.AppContext.option.quantitydecimal;
        let moneyAccuracy = cb.rest.AppContext.option.amountofdecimal;
        let priceAccuracy = cb.rest.AppContext.option.monovalentdecimal;
        let zero = 0;
        let title, upDown, currentKey, currentValue;
        if(type === 'billNum'){
            title='成交笔数'
            upDown = this.getTopOrDown(billNumGrowth)
            currentValue = Math.abs(billNumGrowth).toFixed(2)
            currentKey = billNum ? billNum.toFixed(0) : zero.toFixed(0)
        }
        if(type === 'moneyTotal'){
            title='销售金额(元)'
            upDown = this.getTopOrDown(moneyTotalGrowth)
            currentValue = Math.abs(moneyTotalGrowth).toFixed(2)
            currentKey = moneyTotal ? moneyTotal.toFixed(moneyAccuracy) : zero.toFixed(moneyAccuracy)
        }
        if(type === 'billAvgMoney'){
            title='客单价(元)'
            upDown = this.getTopOrDown(billAvgMoneyGrowth)
            currentValue = Math.abs(billAvgMoneyGrowth).toFixed(2)
            currentKey = billAvgMoney ? billAvgMoney.toFixed(priceAccuracy) : zero.toFixed(priceAccuracy)
        }
        if(type === 'memberNum'){
            title='新增会员'
            upDown = this.getTopOrDown(memberNumGrowth)
            currentValue = !memberNumGrowth ? '--' : Math.abs(memberNumGrowth).toFixed(2)
            currentKey = memberNum
        }
        return(
            roleObj[type]!==undefined ? <Col className='col' span={6}>
                            <div className='home-panel-2'>
                                <h5>{title}</h5>
                                <b>{currentKey}<span><SvgIcon type={upDown === 'up' ? "jiantoushang" : "jiantouxia"} /></span></b>
                                <p>较前期<span className={upDown === 'up' ? "red-txt" : "green-txt"}>{`${currentValue === '--' ? '' : (upDown === 'up' ? "+" : "-")}${currentValue}%`}</span></p>
                            </div>
                    </Col> : <Col className='col' span={6}><div className='home-panel-2'><h5>{title}</h5><b>{currentKey}</b></div></Col>
        )
    }

    getContent(){
        let arr = ['billNum','moneyTotal', 'billAvgMoney', 'memberNum'];
        let DomArr = [];
        let _fun = this.getDom;
        arr.forEach(ele=>{
            DomArr.push(_fun(ele))
        })
        return DomArr;
    }

    render() {
        let content = this.getContent();
        return <div className='home-panel home-overview'>
                <HomeTitle defaultStore={this.props.user.showStore === false ? '' : this.props.user.storeId} dataSource={this.props.user.showStore === false ? null : this.props.user.userStores} onAddressChange={this.onAddressChange}  haveAddress={true} onDateChange={this.onDateChange} title='经营概况' />
                <div className='home-list'>
                    <Row className='home-panel-21'>
                        {/*<Col className='col' span={6}>
                            <div className='home-panel-2'>
                                <h5>成交笔数</h5>
                                <b>15<span><SvgIcon type="jiantoushang" /></span></b>
                                <p>较前期<span className='red-txt'>+1%</span></p>
                            </div>
                        </Col>
                        <Col className='colBorder col' span={6}>
                            <div className='home-panel-2'>
                                <h5>销售金额(元)</h5>
                                <b>16<span><SvgIcon type="jiantouxia" /></span></b>
                                <p>较前期<span className='green-txt'>-16%</span></p>
                            </div>
                        </Col>
                        <Col className='col' span={6}>
                            <div className='home-panel-2'>
                                <h5>客单价(元)</h5>
                                <b>17<span><SvgIcon type="jiantoushang" /></span></b>
                                <p>较前期<span className='red-txt'>+17%</span></p>
                            </div>
                        </Col>
                        <Col className='col' span={6}>
                            <div className='home-panel-2'>
                                <h5>新增会员</h5>
                                <b>17<span><SvgIcon type="jiantoushang" /></span></b>
                                <p>较前期<span className='red-txt'>+17%</span></p>
                            </div>
                        </Col>*/}
                        {content}
                    </Row>
                </div>

            </div>;
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

export default connect(mapStateToProps, mapDispatchToProps)(TaskList);
