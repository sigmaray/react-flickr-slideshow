import * as $ from 'jquery';
import React, { Component } from 'react';
import './App.css';
import VCenter from './partials/VCenter';
import downloadPics from './flickr';
import generateNoty from './generateNoty';

class App extends Component {
  constructor() {
    super();

    this.state = {
      page: 0,
      query: 'romania',
      data: [],
      dataPicNum: 0
    };

    this.getData();
  }
  getData() {
    downloadPics(
      (data) => {
        this.setState({page: this.state.page + 1, data: data});
        this.slideshowTimeout();
      },
      (message) => {
        generateNoty(message);
        setTimeout(this.getData.bind(this), 3000);
      },
      this.state.query,
      this.state.page
    )
  }
  slideshowTimeout = () => {
    if (this.state.dataPicNum + 1 < this.state.data.length) {
      this.setState({dataPicNum: this.state.dataPicNum + 1});
      setTimeout(this.slideshowTimeout, 3000);
    } else {
      this.setState({dataPicNum: 0});
      this.getData();
    }
  }
  render() {
    return (
      <div>
        <VCenter>
          <center>
            {
              this.state.data.length > 0
              ?
              <table width='100%'>
                <tr>
                  <td width='50%'>
                    <a href={this.state.data[this.state.dataPicNum].flickrUrl}>
                      <img src={this.state.data[this.state.dataPicNum].src} />
                    </a>
                  </td>
                  <td width='50%' style={{'padding-left': '20px'}}>
                    <p>{`page: ${JSON.stringify(this.state.page)}`}</p>
                    <p>{`dataPicNum: ${JSON.stringify(this.state.dataPicNum)}`}</p>
                  </td>
                </tr>
              </table>
              /*this.state.data.map((item) =>
                <p>
                  {JSON.stringify(item)}
                  <div>
                    <a href={item.flickrUrl}>
                      <img src={item.src} width='20' />
                    </a>
                  </div>
                </p>
              )*/
              :
              <p>...loading data...</p>
            }
          </center>
        </VCenter>
      </div>
    );
  }
}

export default App;
