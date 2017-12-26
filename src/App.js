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

    this.counter = 10000;
    this.timer = null;

    this.state = {
      limit: 10,
      page: 1,
      // query: 'Romania',
      // inputQuery: 'Romania',
      query: 'French Fries',
      inputQuery: 'French Fries',
      data: [],
      dataPicNum: 0,
      resetToNewQuery: false,
      currentImage: null,
      timeOut: 5000,
      counter: 10000,
      countdownMs: 0,
      resetCounter: false,
      resetToBack: false,
      resetToBack10: false,
      resetToNext: false,
      resetToNext10: false,
      resetToNext100: false,
      paused: false,
      loadingServerData: false
    };

    this.getData();

    // this.startCountDown(() => {
    //   // alert('finished');
    // });
  }
  startCountDown = (finishCallback, ms) => {
    // alert(this.state.counter);
    this.setState({countdownMs: ms});
    // setTimeout(() => { 
      this.setState({countdownMs: this.state.counter});
      // alert(this.state.countdownMs);
      this.timer = setTimeout(() => { this.countDown(finishCallback); }, 1000);
    // }, 1000)
  }
  countDown = (finishCallback) => {
    // alert('L34');
    // this.counter = this.counter - 1;
    // alert(JSON.stringify(this.state));
    if (!this.state.paused) {
      var newC = this.state.countdownMs - 100;
      this.setState({countdownMs: newC});
    }
    if (/*(!this.state.paused) &&*/ (this.state.countdownMs == 0 || this.state.resetToNewQuery || this.state.resetToNext || this.state.resetToNext10 || this.state.resetToNext100 || this.state.resetToBack || this.state.resetToBack10)) {
       // if (this.state.resetToNewQuery) { this.setState({resetToNewQuery: false}) };

       clearTimeout(this.timer);
       this.timer = null;
       finishCallback();
    }
    else {
      this.timer = setTimeout(() => { this.countDown(finishCallback); }, 100);
    }
  }
  getData() {
    document.title = `${this.state.query} - Flickr Slideshow`;
    this.setState({loadingServerData: true});
    downloadPics(
      (data) => {
        this.setState({loadingServerData: false, data: data});
        this.slideshowTimeout();
      },
      (message) => {
        this.setState({loadingServerData: false});
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
        if (this.state.resetToNewQuery) {
          // User inputted new search query and clicked on button
          this.setState({data: [], page: 1, dataPicNum: 0, resetToNewQuery: false});
          this.getData();
        } else if (this.state.resetToNext10) {
          this.setState({resetToNext10: false});
          this.setState({page: this.state.page + 10});
          this.getData();
        } else if (this.state.resetToNext100) {
          this.setState({resetToNext100: false});
          this.setState({page: this.state.page + 100});
          this.getData();
        } else if (this.state.resetToBack) {
          // alert('L101');
          this.setState({resetToBack: false});

          if (this.state.dataPicNum - 1 >= 0 ) {
            // alert('L105');
            this.setState({dataPicNum: this.state.dataPicNum - 1});
            this.slideshowTimeout();
          } else {
            // alert('L108');
            if (this.state.page - 1 >= 1 ) {
              // alert('L110');
              this.setState({page: this.state.page - 1, dataPicNum: 9});
              this.getData();
            }
          }
        } else { // regular +1 or this.state.resetToNext
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
    this.setState({counter: v, countdownMs: v, resetCounter: true/*, paused: false*/});
  }
  handleGoButtonClick = () => {
    // var val = ReactDOM.findDOMNode(this.refs.goButton).value;
    var val = this.state.inputQuery;
    if (!val) {
      generateNoty('Please input non empty string.');
    } else {
      this.setState({query: val, resetToNewQuery: true/*, paused: false*/});
    }
  }
  handleExampmeButtonClick = (val) => {
    this.setState({inputQuery: val, query: val, resetToNewQuery: true/*, paused: false*/});
  }
  handleBackButtonClick = () => {
    if (!(this.state.page == 1 && this.state.dataPicNum == 0)) {
      this.setState({resetToBack: true/*, paused: false*/});
    }
  }
  handleBack10ButtonClick = () => {
    if (!(this.state.page == 1 && this.state.dataPicNum == 0)) {
      this.setState({resetToBack10: true/*, paused: false*/});
    }
  }
  handlePauseButtonClick = () => {
    this.setState({paused: true});
  }
  handleUnpauseButtonClick = () => {
    this.setState({paused: false});
  }
  handleNextButtonClick = () => {
    this.setState({resetToNext: true/*, paused: false*/});
  }
  handleNext10ButtonClick = () => {
    this.setState({resetToNext10: true/*, paused: false*/});
  }
  handleNext100ButtonClick = () => {
    this.setState({resetToNext100: true/*, paused: false*/});
  }
  render() {
    return (
      <div>
        <VCenter>
          <center>
            
            <table width='100%'>
              <tr>
                <td width='100%' ref='td1'>
                {
                  this.state.currentImage != null
                  ?
                  <a href={this.state.currentImage.flickrUrl} target='_blank'>
                    {/*<img src={this.state.currentImage.src} style={{'max-width': `${window.document.body.clientWidth * 0.6}px`}} />*/}
                    <img src={this.state.currentImage.src} style={{'max-width': `100%`, 'max-height': `${window.innerHeight - 10}px`}} />
                  </a>
                  :
                  <p>...loading data...</p>
                }
                </td>
                <td width='1' style={{'padding-left': '20px'}}>
                  <p>
                    <input
                      type='text'
                      placeholder='searchQuery'
                      value={this.state.inputQuery}
                      onChange={this.handleInputChange}
                      onKeyPress={
                        (e) => {(e.key === 'Enter' ? this.handleGoButtonClick() : null)}
                      }
                    />
                  </p>
                  <p>
                    <input type='button' value='Go!' onClick={this.handleGoButtonClick} ref='goButton' />
                  </p>
                  <p>
                    <input type='button' value='Example: French Fries' onClick={() => { this.handleExampmeButtonClick('French Fries') }} />
                  </p>
                  <p>
                    <input type='button' value='Pasta' onClick={() => { this.handleExampmeButtonClick('Pasta') }} />
                    &nbsp;&nbsp;&nbsp;
                    <input type='button' value='Pizza' onClick={() => { this.handleExampmeButtonClick('Pizza') }} />
                  </p>
                  <p>
                    <input type='button' value='Paris' onClick={() => { this.handleExampmeButtonClick('Paris') }} />
                    &nbsp;&nbsp;&nbsp;
                    <input type='button' value='France' onClick={() => { this.handleExampmeButtonClick('France') }} />
                  </p>
                  <p>
                    <input type='button' value='Exampe: London' onClick={() => { this.handleExampmeButtonClick('London') }} />
                  </p>
                  <p>
                    <input type='button' value='England' onClick={() => { this.handleExampmeButtonClick('England') }} />
                    &nbsp;&nbsp;&nbsp;
                    <input type='button' value='UK' onClick={() => { this.handleExampmeButtonClick('UK') }} />
                  </p>
                  <p>
                    <input type='button' value='Chicago' onClick={() => { this.handleExampmeButtonClick('Chicago') }} />
                    &nbsp;&nbsp;&nbsp;
                    <input type='button' value='USA' onClick={() => { this.handleExampmeButtonClick('USA') }} />
                  </p>
                  <p>
                    <input type='button' value='Berlin' onClick={() => { this.handleExampmeButtonClick('Berlin') }} />
                    &nbsp;&nbsp;&nbsp;
                    <input type='button' value='Germany' onClick={() => { this.handleExampmeButtonClick('Germany') }} />
                  </p>
                  <p>
                    <input type='button' value='Audi' onClick={() => { this.handleExampmeButtonClick('Audi') }} />
                    &nbsp;&nbsp;&nbsp;
                    <input type='button' value='Porsche' onClick={() => { this.handleExampmeButtonClick('Porsche') }} />
                  </p>
                  <p>
                    <input type='button' value='BMW' onClick={() => { this.handleExampmeButtonClick('BMW') }} />
                  </p>
                  <p>
                    <select ref='timeSelect' onChange={this.handleSelectChange}>
                      <option value='1000' selected={this.state.counter == 1000}>1 sec</option>
                      <option value='3000' selected={this.state.counter == 3000}>3 sec</option>
                      <option value='5000' selected={this.state.counter == 5000}>5 sec</option>
                      <option value='10000' selected={this.state.counter == 10000}>10 sec</option>
                      <option value='30000' selected={this.state.counter == 30000}>30 sec</option>
                      <option value='60000' selected={this.state.counter == 60000}>60 sec</option>
                    </select>
                  </p>
                  <p>
                    <input type='button' value='< Back' onClick={this.handleBackButtonClick} />
                  </p>
                  {/*<p>
                    <input type='button' value='<< Back 10' onClick={this.handleBack10ButtonClick} />
                  </p>*/}
                  <p>
                    <input type='button' value='Next >' onClick={this.handleNextButtonClick} />
                    &nbsp;&nbsp;&nbsp;
                    <input type='button' value='Next 10 >>' onClick={this.handleNext10ButtonClick} />
                  </p>
                  <p>
                    <input type='button' value='Next 100 >>>' onClick={this.handleNext100ButtonClick} />
                  </p>
                  <p>
                    <input type='button' value='Pause' onClick={this.handlePauseButtonClick} />
                    &nbsp;&nbsp;&nbsp;
                    <input type='button' value='Unpause' onClick={this.handleUnpauseButtonClick} />
                  </p>
                </td>
                <td width='1' style={{'padding-left': '20px'}}>
                    <div>
                      {/*<p>
                        {this.state.resetToNewQuery &&
                          <div>..resetting to new query..</div>
                        }
                      </p>*/}
                      <p>
                        {this.state.loadingServerData &&
                          <div>..loading xml from flickr..</div>
                        }
                      </p>
                      <p>{`query: ${JSON.stringify(this.state.query)}`}</p>
                      <p>{`[${JSON.stringify(this.state.dataPicNum + 1)}/${this.state.limit}] of page ${this.state.page}`} </p>
                      <p>{`page: ${JSON.stringify(this.state.page)}`}</p>
                      {/*<p>{`dataPicNum: ${JSON.stringify(this.state.dataPicNum)}`}</p>
                      <p>{`timeOut: ${JSON.stringify(this.state.timeOut)} ms`}</p>*/}
                      <p>{`countdownMs: ${JSON.stringify(this.state.countdownMs)}`}</p>
                      {/*<p>{`counter: ${JSON.stringify(this.state.counter)}`}</p>*/}
                      <p>{`paused: ${JSON.stringify(this.state.paused)}`}</p>
                      {/*<p>{`resetToBack: ${JSON.stringify(this.state.resetToBack)}`}</p>
                      <p>{`resetToNext: ${JSON.stringify(this.state.resetToNext)}`}</p>*/}
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
