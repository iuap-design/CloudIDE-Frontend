import React, {Component} from 'react'
import {Collapse, Radio, Anchor, Button} from 'antd'
import SvgIcon from 'SvgIcon'
import _ from 'lodash'
import {proxy} from 'yxyweb/common/helpers/util'
import classnames from 'classnames'
import {connect} from 'react-redux'

const Panel = Collapse.Panel
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const AnchorLink = Anchor.Link;
const platform = [
  {
    name: '桌面版',
    icon: 'diannao',
    terminalType: '1'
  }, {
    name: '触屏版',
    icon: 'zhinengPOS',
    terminalType: '2'
  }, {
    name: '移动版',
    icon: 'shouji',
    terminalType: '3'
  },
]

const tyeText = {
  'add': '新增功能',
  'update': '更新功能'
}


const detailsCache = {}

class UpdateLog extends Component {
  constructor(props) {
    super(props)
  }

  state = {
    logArr: null,
    loading: true,
    currentType: "1",
    onDetail: false,
    activeSpread: {
      '1': '0',
      '2': '0',
      '3': '0'
    },
    detail: {
      iterativeTime: '20180615',
      i: 0
    }
  }


  componentDidMount() {
    proxy({
      url: 'iterativeUpdate/list'
    }).then(json => {

      // todo
      /*json = {
        "code": 200, "message": "操作成功", "data": [
          {
            "comments": "limytest0",
            "iterativeTime": "20180517",
            "id": 709822906142976,
            "pubts": "2018-06-08 15:46:25",
            "items": [{"item": "test1", "itemType": "add"}, {"item": "test2", "itemType": "add"}],
            "version": "v1.0",
            "terminalType": "1"
          },
          {
            "comments": "limytest1",
            "iterativeTime": "20180519",
            "id": 709822906142979,
            "pubts": "2018-06-08 15:46:25",
            "items": [{"item": "test1", "itemType": "add"}, {
              "item": "test2",
              "itemType": "add"
            }, {"item": "updatetest1", "itemType": "update"}, {"item": "updatetest2", "itemType": "update"}],
            "version": "v1.0",
            "terminalType": "1"
          },
          {
            "comments": "limytest2",
            "iterativeTime": "20180516",
            "id": 709822906142978,
            "pubts": "2018-06-07 15:46:25",
            "items": [{"item": "test1", "itemType": "add"}, {"item": "test2", "itemType": "add"}],
            "version": "v1.0",
            "terminalType": "2"
          },
        ]
      }*/


      if (json.code == 200) {
        this.setState({
          logArr: json.data,
          loading: false
        })
      } else {
        cb.utils.alert(json.message, 'error')
      }

    })
  }

  onChange = (e) => {
    const currentType = e.target.value
    this.setState({
      currentType
    })
  }

  renderRadio = (platform) => {
    const currentType = this.state.currentType
    return (<RadioGroup onChange={this.onChange} value={currentType}>
      {_.map(platform, p => {
        return <RadioButton value={p.terminalType} key={p.terminalType}>
          <SvgIcon type={p.icon + (p.terminalType == currentType ? '-active' : '')}/>
          {p.name}
        </RadioButton>
      })}
    </RadioGroup>)

  }

  renderPaneHeader = (log, i) => {

    return <p onClick={() => {
      const {currentType, activeSpread} = this.state

      this.setState({
        activeSpread: _.assign({}, activeSpread, {[currentType]: i})
      })
    }}><a onClick={(e) => {
      e.stopPropagation();
      this.handleClick(log, i)
    }}>{log.iterativeTime.replace(/(\d{4})(\d{2})(\d{2})/, '$1年$2月$3日')}</a>
      <span onClick={(e) => {
        e.stopPropagation();
        this.handleClick(log, i)
      }} className="uretail-update-log-more">详情</span>
    </p>
  }

  getDetail = (id) => {
    return proxy({
      url: 'iterativeUpdate/itemList',
      params: {
        id
      }

    })
  }
  handleClick = (log, i) => {

    if (detailsCache[log.id]) {
      this.setState({
        detail: detailsCache[log.id],
        onDetail: true
      })
    } else {
      this.getDetail(log.id).then(detailJson => {
        if (detailJson.code == 200) {
          detailsCache[log.id] = {
            data: detailJson.data,
            ...log,
            i
          }
          this.setState({
            detail: {
              data: detailJson.data,
              ...log,
              i
            },
            onDetail: true
          })
        } else {
          cb.utils.alert(detailJson.message, 'error')
        }

      })
    }
  }

  render() {
    const {currentType, logArr, onDetail, detail, activeSpread} = this.state
    const currentLogArr = _.filter(logArr, logCollect => logCollect.terminalType == currentType)
    const isEmpty = _.isEmpty(currentLogArr)

    const prev = currentLogArr[detail.i - 1]
    const next = currentLogArr[detail.i + 1]

    return (
      <div className="pc_logo_height">
        <div className={classnames({
          'hide': !onDetail
        }, 'pc_log_details')}
             style={{
               position: 'relative'
             }}
        >

          {/*操作栏*/}
          <div className="log_top_title">
            <Button onClick={() => {
              this.setState({
                onDetail: false
              })
            }}><SvgIcon type="rollback"/>返回</Button>

            <div className="log_page">
              <Button className='no-border-radius m-l-10'

                      disabled={!prev}
                      onClick={() => {

                        prev && this.handleClick(prev, detail.i - 1)

                      }}>
                <SvgIcon type="left"/>
              </Button>
              <Button className='no-border-radius m-l-10'
                      disabled={!next}
                      onClick={() => {
                        next && this.handleClick(next, detail.i + 1)
                      }}>
                <SvgIcon type="right"/>
              </Button>
            </div>

          </div>
          <div className="log_margin_count">
            {/*迭代日志详情*/}
            <div className="log_left_count" id="uretail-update-log-detail-wrap">
              <div className="uretail-update-log-collect-wrap">
                <h1>{detail.iterativeTime.replace(/(\d{4})(\d{2})(\d{2})/, '$1年$2月$3日')}</h1>
                {_.map(detail.data, (item, i) =>
                  <div id={item.id} key={item.id}>
                    <h2><span><span>{i + 1}.</span>&nbsp;&nbsp;{item.items}</span></h2>
                    <div dangerouslySetInnerHTML={{
                      __html: item.itemDetail
                    }}/>
                  </div>
                )}
              </div>
            </div>

            {/*右侧导航栏定位*/}
            <div className="log_right_bar">

              <div className="ant-anchor-headertitle">
                内容
              </div>


              {!_.isEmpty(detail.data) && <AnchorWrap
                show={onDetail}
                data={detail.data}/>}
            </div>
          </div>

        </div>


        <div className={classnames('uretial-update-log', {
          'hide': onDetail
        })}>
          {this.renderRadio(platform)}


          <div className="uretail-update-log-collapse">


            <Collapse defaultActiveKey={['0']}>
              {isEmpty ?
                <div className="uretial-no-date">
                  <i/>
                  暂无数据</div>
                : _.map(currentLogArr, (log, i) => {
                  return <Panel
                    className={classnames({
                      'uretail-update-log-activeLog': i == activeSpread[currentType]
                    })}
                    showArrow={false} header={this.renderPaneHeader(log, i)} key={i}>
                    <div className='clear'>
                      {_.map(_.groupBy(log.items, 'itemType'), (arr, updateType) => {
                        return <div key={updateType} className={classnames("uretail-update-log-" + updateType)}>
                          <div className="add-update-btn">{tyeText[updateType]}</div>
                          <div className="add-update-count">
                            {_.map(arr, (leaf, i) => {
                              return <p key={i}>{leaf.item}</p>
                            })}
                          </div>
                        </div>
                      })}
                    </div>
                  </Panel>
                })}
            </Collapse>
          </div>
        </div>
      </div>
    )
  }
}

class AnchorWrap extends Component {
  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.show
  }

  componentDidUpdate() {
    this.anchor.handleScroll()
  }

  render() {
    const data = this.props.data
    return <Anchor
      ref={anchor => this.anchor = anchor}
      offsetTop={178}
      target={() => {
        return document.getElementById('uretail-update-log-detail-wrap')
      }}>
      {_.map(data, (item, i) =>
        <AnchorLink key={item.id} href={`#${item.id}`}
                    title={<span><span>{i + 1}.</span>{item.items}</span>}/>)}
    </Anchor>
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  }
}

export default connect(null, mapDispatchToProps)(UpdateLog);
