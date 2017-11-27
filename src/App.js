import * as $ from 'jquery';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import VCenter from './partials/VCenter';
import downloadPics from './flickr';
import generateNoty from './generateNoty';

class App extends Component {
  constructor() {
    super();

    this.state = {
      limit: 10,
      page: 0,
      query: 'romania',
      inputQuery: 'romania',
      data: [],
      dataPicNum: 0,
      resetToNewQuery: false,
      currentImage: null,
      timeOut: 5000
    };

    this.getData();
  }
  getData() {
    downloadPics(
      (data) => {
        this.setState({data: data});
        this.slideshowTimeout();
      },
      (message) => {
        generateNoty(message);
        setTimeout(this.getData.bind(this), 3000);
      },
      this.state.query,
      this.state.page,
      this.state.limit
    )
  }
  slideshowTimeout = () => {
    this.setState({currentImage: this.state.data[this.state.dataPicNum]});
    setTimeout(
      () => {
        if (!this.state.resetToNewQuery) {
          if (this.state.dataPicNum + 1 < this.state.data.length) {            
            this.setState({dataPicNum: this.state.dataPicNum + 1});
            this.slideshowTimeout();
          } else {
            this.setState({page: this.state.page + 1, dataPicNum: 0});
            this.getData();
          }
        } else {
          // User inputted new search query and clicked on button
          this.setState({data: [], page: 0, dataPicNum: 0, resetToNewQuery: false});
          this.getData();
        }
      }
      ,
      this.state.timeOut
    );
  }
  handleInputChange = (event) => {
    this.setState({inputQuery: event.target.value});
  }
  handleGoButtonClick = () => {
    // var val = ReactDOM.findDOMNode(this.refs.goButton).value;
    var val = this.state.inputQuery;
    if (!val) {
      generateNoty('Please input non empty string.');
    } else {
      this.setState({query: val, resetToNewQuery: true});
    }
  }
  render() {
    return (
      <div>
        <VCenter>
          <center>
            
            <table width='100%'>
              <tr>
                <td width='33%'>
                {
                  this.state.currentImage != null
                  ?
                  <a href={this.state.currentImage.flickrUrl}>
                    <img src={this.state.currentImage.src} style={{'max-width': `${window.document.body.clientWidth * 0.6}px`}} />
                  </a>
                  :
                  <p>...loading data...</p>
                }
                </td>
                <td width='33%' style={{'padding-left': '20px'}}>
                  <p>
                    <input type='text' placeholder='searchQuery' value={this.state.inputQuery} onChange={this.handleInputChange} />
                  </p>
                  <p>
                    <input type='button' value='Go!' onClick={this.handleGoButtonClick} ref='goButton' />
                  </p>
                </td>
                <td width='33%' style={{'padding-left': '20px'}}>
                  {
                    this.state.resetToNewQuery
                    ?
                    <div>..resetting to new query..</div>
                    :
                    <div>
                      <p>{`query: ${JSON.stringify(this.state.query)}`}</p>
                      <p>{`[${JSON.stringify(this.state.dataPicNum + 1)}/${this.state.limit}] of page ${this.state.page + 1}`} </p>
                      <p>{`page: ${JSON.stringify(this.state.page)}`}</p>
                      <p>{`dataPicNum: ${JSON.stringify(this.state.dataPicNum)}`}</p>
                      <p>{`timeOut: ${JSON.stringify(this.state.timeOut)} ms`}</p>
                    </div>
                  }
                </td>
              </tr>
            </table>
            {/*this.state.data.map((item) =>
              <p>
                {JSON.stringify(item)}
                <div>
                  <a href={item.flickrUrl}>
                    <img src={item.src} width='20' />
                  </a>
                </div>
              </p>
            )*/}
          </center>
        </VCenter>
      </div>
    );
  }
}

export default App;
