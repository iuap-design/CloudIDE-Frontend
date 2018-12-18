import React, { Component } from 'react';

export default class Iframe extends Component {
  render() {
    const { url, width, height } = this.props;
    const style = { width, height };
    return (
      <iframe src={url} style={style} className='no-border' />
    );
  }
}
