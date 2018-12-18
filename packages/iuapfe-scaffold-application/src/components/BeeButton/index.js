import React, { Component } from 'react';
import Button from 'bee/button';
import noop from '../utils';
import {
  btn,
  brand_btn,
  default_btn,
  default_line_btn,
  default_alpha_btn,
  check_selected_btn,
  check_close_btn,
  danger_btn,
  warning_btn,
  default_white_btn,
  search_icon_btn
} from './style.css';

const buttonMaker = (btnType) => {
  return class extends Component {
    static defaultProps = {
      className: '',
      onClick: noop,
    }
    render() {
      const { className, onClick } = this.props;
      return (
        <Button
          {...this.props}
          className={`${btn} ${btnType} ${className}`}
          onClick={(e) => { onClick(e, this) }}
        />
      );
    }
  }
}

//品牌色
const ButtonBrand = buttonMaker(brand_btn)
//通用按钮
const ButtonDefault = buttonMaker(default_btn);
//带边框
const ButtonDefaultLine = buttonMaker(default_line_btn);
//默认背景透明
const ButtonDefaultAlpha = buttonMaker(default_alpha_btn);
//默认背景透明
const ButtonCheckSelected = buttonMaker(check_selected_btn);
//默认背景透明
const ButtonCheckClose = buttonMaker(check_close_btn);
//默认白色背景带边框
const ButtonDefaultWhite = buttonMaker(default_white_btn);
//危险
const ButtonDanger = buttonMaker(danger_btn);
//警告
const ButtonWarning = buttonMaker(warning_btn);
//搜索的button
const ButtonSearchIcon = buttonMaker(search_icon_btn);
export default ButtonDefault;
export {
  ButtonDanger,
  ButtonBrand,
  ButtonDefault,
  ButtonDefaultAlpha,
  ButtonDefaultLine,
  ButtonWarning,
  ButtonCheckClose,
  ButtonCheckSelected,
  ButtonDefaultWhite,
  //搜素的按钮
  ButtonSearchIcon,
};

/**
参数

type: PropTypes.string, 后续拓展，暂无
label: PropTypes.string, 显示文字
onClick:PropTypes.fun,   按钮回调事件
data:PropTypes.object   回调事件回带数据Object格式

<div style={{width:"500px",height:"600px",padding:"10px"}}>
<ButtonBrand />  品牌色
<ButtonDefault />  通用按钮
<ButtonDefaultLine /> 通用按钮带边框
<ButtonDefaultAlpha /> 通用按钮无背景
<ButtonWarning />   告警
<ButtonDanger />  危险

</div>
**/
