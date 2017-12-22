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

    this.counter = 10;
    this.timer = null;

    this.state = {
      limit: 10,
      page: 0,
      query: 'Romania',
      inputQuery: 'Romania',
      data: [],
      dataPicNum: 0,
      resetToNewQuery: false,
      currentImage: null,
      timeOut: 5000,
      counter: 10,
      status: 0,
      resetCounter: false,
      resetToNext: false,
      paused: false
    };

    this.getData();

    // this.startCountDown(() => {
    //   // alert('finished');
    // });
  }
  startCountDown = (finishCallback, ms) => {
    // alert(this.state.counter);
    this.setState({status: ms});
    // setTimeout(() => { 
      this.setState({status: this.state.counter});
      // alert(this.state.status);
      this.timer = setTimeout(() => { this.countDown(finishCallback); }, 1000);
    // }, 1000)
  }
  countDown = (finishCallback) => {
    // alert('L34');
    // this.counter = this.counter - 1;
    // alert(JSON.stringify(this.state));
    if (!this.state.paused) {
      var newC = this.state.status - 1;
      this.setState({status: newC});
    }
    if ((!this.state.paused) && (this.state.status == 0 || this.state.resetToNewQuery || this.state.resetToNext)) {
       // if (this.state.resetToNewQuery) { this.setState({resetToNewQuery: false}) };

       clearTimeout(this.timer);
       this.timer = null;
       finishCallback();
    }
    else {
      this.timer = setTimeout(() => { this.countDown(finishCallback); }, 1000);
    }
  }
  getData() {
    downloadPics(
      (data) => {
        this.setState({data: data});
        this.slideshowTimeout();
      },
      (message) => {
        generateNoty(message);
        this.startCountDown(this.getData.bind(this), this.state.counter);
      },
      this.state.query,
      this.state.page,
      this.state.limit
    )
  }
  slideshowTimeout = () => {
    this.setState({currentImage: this.state.data[this.state.dataPicNum]});
    this.startCountDown(
      () => {
        if (!this.state.resetToNewQuery) {
          if (this.state.resetToNext) {
            this.setState({resetToNext: false});
          }

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
      this.state.counter
    );
  }
  handleInputChange = (event) => {
    this.setState({inputQuery: event.target.value});
  }
  handleSelectChange = (event) => {
    var v = parseInt(event.target.value);
    this.setState({counter: v, status: v, resetCounter: true, paused: false});
  }
  handleGoButtonClick = () => {
    // var val = ReactDOM.findDOMNode(this.refs.goButton).value;
    var val = this.state.inputQuery;
    if (!val) {
      generateNoty('Please input non empty string.');
    } else {
      this.setState({query: val, resetToNewQuery: true, paused: false});
    }
  }
  handleExampmeButtonClick = (val) => {
    this.setState({inputQuery: val, query: val, resetToNewQuery: true, paused: false});
  }
  /*handleBackButtonClick() {
    alert('Back')
  }*/
  handlePauseButtonClick = () => {
    this.setState({paused: true});
  }
  handleUnpauseButtonClick = () => {
    this.setState({paused: false});
  }
  handleNextButtonClick = () => {
    this.setState({resetToNext: true, paused: false});
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
                  <a href={this.state.currentImage.flickrUrl} target='_blank'>
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
                  <p>
                    <input type='button' value='Exampe: Paris' onClick={() => { this.handleExampmeButtonClick('Paris') }} />
                  </p>
                  <p>
                    <input type='button' value='Exampe: Chicago' onClick={() => { this.handleExampmeButtonClick('Chicago') }} />
                  </p>
                  <p>
                    <input type='button' value='Example: Berlin' onClick={() => { this.handleExampmeButtonClick('Berlin') }} />
                  </p>
                  <p>
                    <select ref='timeSelect' onChange={this.handleSelectChange}>
                      <option value='1' selected={this.state.counter == 1}>1 sec</option>
                      <option value='3' selected={this.state.counter == 3}>3 sec</option>
                      <option value='5' selected={this.state.counter == 5}>5 sec</option>
                      <option value='10' selected={this.state.counter == 10}>10 sec</option>
                      <option value='30' selected={this.state.counter == 30}>30 sec</option>
                      <option value='60' selected={this.state.counter == 60}>60 sec</option>
                    </select>
                  </p>
                  {/*<p>
                    <input type='button' value='< Back' onClick={this.handleBackButtonClick} />
                  </p>*/}
                  <p>
                    <input type='button' value='Next >' onClick={this.handleNextButtonClick} />
                  </p>
                  <p>
                    <input type='button' value='Pause' onClick={this.handlePauseButtonClick} />
                  </p>
                  <p>
                    <input type='button' value='Unpause' onClick={this.handleUnpauseButtonClick} />
                  </p>
                </td>
                <td width='33%' style={{'padding-left': '20px'}}>
                    {this.state.resetToNewQuery &&
                      <div>..resetting to new query..</div>
                    }
                    <div>
                      <p>{`query: ${JSON.stringify(this.state.query)}`}</p>
                      <p>{`[${JSON.stringify(this.state.dataPicNum + 1)}/${this.state.limit}] of page ${this.state.page + 1}`} </p>
                      <p>{`page: ${JSON.stringify(this.state.page)}`}</p>
                      <p>{`dataPicNum: ${JSON.stringify(this.state.dataPicNum)}`}</p>
                      <p>{`timeOut: ${JSON.stringify(this.state.timeOut)} ms`}</p>
                      <p>{`status: ${JSON.stringify(this.state.status)}`}</p>
                      <p>{`counter: ${JSON.stringify(this.state.counter)}`}</p>
                      <p>{`paused: ${JSON.stringify(this.state.paused)}`}</p>
                    </div>
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
