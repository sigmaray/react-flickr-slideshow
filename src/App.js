import * as $ from 'jquery';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import gitFlickrPicsList from './flickr';
import generateNoty from './generateNoty';

const API_KEY = '4cc2a6e2419deebfe86eca026cfda157';
const CHUNK_SIZE = 10;

class App extends Component {
  constructor() {
    super();

    this.timer = null;

    this.state = {
      page: 1,
      query: '',
      data: [],
      chunkPicNum: 0,
      currentFlickrImageData: null,
      countdown: 10000,
      currentCountdown: 0,
      paused: false,
      loadingServerData: false,
      resetToNewQuery: false,
      resetToBack: false,
      resetToBack10: false,
      resetToNext: false,
      resetToNext10: false,
      resetToNext100: false
    };
    this.state.inputQuery = this.state.query;

    this.getData();
  }

  startCountDown = (finishCallback, ms) => {
    this.setState({currentCountdown: ms});
    this.setState({currentCountdown: this.state.countdown});
    this.timer = setTimeout(() => { this.countDown(finishCallback); }, 1000);
  }

  countDown = (finishCallback) => {
    if (!this.state.paused) {
      const newC = this.state.currentCountdown - 100;
      this.setState({currentCountdown: newC});
    }
    if (
      (
        this.state.currentCountdown == 0
        ||this.state.resetToNewQuery
        || this.state.resetToNext
        || this.state.resetToNext10
        || this.state.resetToNext100
        || this.state.resetToBack
        || this.state.resetToBack10
      )
    ) {
       clearTimeout(this.timer);
       this.timer = null;
       finishCallback();
    }
    else {
      this.timer = setTimeout(() => { this.countDown(finishCallback); }, 100);
    }
  }

  getData() {
    this.setState({loadingServerData: true});
    gitFlickrPicsList(
      API_KEY,
      (data) => {
        this.setState({loadingServerData: false, data: data});
        this.slideshowTimeout();
      },
      (message) => {
        this.setState({loadingServerData: false});
        generateNoty(message);
        this.startCountDown(this.getData.bind(this), this.state.countdown);
      },
      this.state.query,
      this.state.page,
      CHUNK_SIZE
    )
  }

  slideshowTimeout = () => {
    this.setState({currentFlickrImageData: this.state.data[this.state.chunkPicNum]});
    this.startCountDown(
      () => {
        if (this.state.resetToNewQuery) {
          document.title = `${this.state.query ? this.state.query + ' - ' : '' }Flickr Slideshow`;
          this.setState({data: [], page: 1, chunkPicNum: 0, resetToNewQuery: false});
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
          this.setState({resetToBack: false});

          if (this.state.chunkPicNum - 1 >= 0 ) {
            this.setState({chunkPicNum: this.state.chunkPicNum - 1});
            this.slideshowTimeout();
          } else {
            if (this.state.page - 1 >= 1 ) {
              this.setState({page: this.state.page - 1, chunkPicNum: 9});
              this.getData();
            }
          }
        } else {
          if (this.state.resetToNext) {
            this.setState({resetToNext: false});
          }

          if (this.state.chunkPicNum + 1 < this.state.data.length) {
            this.setState({chunkPicNum: this.state.chunkPicNum + 1});
            this.slideshowTimeout();
          } else {
            this.setState({page: this.state.page + 1, chunkPicNum: 0});
            this.getData();
          }
        }
      }
      ,
      this.state.countdown
    );
  }

  handleQueryInputChange = (event) => {
    this.setState({inputQuery: event.target.value});
  }

  handleCountdownSelectChange = (event) => {
    const v = parseInt(event.target.value);
    this.setState({countdown: v, currentCountdown: v});
  }

  handleGoButtonClick = () => {
    const val = this.state.inputQuery;
    if (!val) {
      generateNoty('Please input non empty string.');
    } else {
      this.setState({query: val, resetToNewQuery: true});
    }
  }

  handleExampleButtonClick = (val) => {
    this.setState({inputQuery: val, query: val, resetToNewQuery: true});
  }

  handleBackButtonClick = () => {
    if (!(this.state.page == 1 && this.state.chunkPicNum == 0)) {
      this.setState({resetToBack: true});
    }
  }

  handleBack10ButtonClick = () => {
    if (!(this.state.page == 1 && this.state.chunkPicNum == 0)) {
      this.setState({resetToBack10: true});
    }
  }

  handlePauseButtonClick = () => {
    this.setState({paused: true});
  }

  handleUnpauseButtonClick = () => {
    this.setState({paused: false});
  }

  handleNextButtonClick = () => {
    this.setState({resetToNext: true});
  }

  handleNext10ButtonClick = () => {
    this.setState({resetToNext10: true});
  }

  handleNext100ButtonClick = () => {
    this.setState({resetToNext100: true});
  }

  render() {
    return (
      <div>
        <div>
          <center>
            <table style={{width: '100%'}}>
              <tr>
                <td style={{width: '100%'}}>
                {
                  this.state.currentFlickrImageData != null
                  ?
                  <a href={this.state.currentFlickrImageData.flickrUrl} target='_blank'>
                    <img src={this.state.currentFlickrImageData.src} style={{'max-width': `100%`, 'max-height': `${window.innerHeight - 10}px`}} />
                  </a>
                  :
                  <p>...loading data...</p>
                }
                </td>
                <td style={{'padding-left': '20px', 'vertical-align': 'top'}} nowrap="nowrap">
                  <p>
                    <input
                      type='text'
                      placeholder='searchQuery'
                      value={this.state.inputQuery}
                      onChange={this.handleQueryInputChange}
                      onKeyPress={
                        (e) => {(e.key === 'Enter' ? this.handleGoButtonClick() : null)}
                      }
                    />
                  </p>
                  <p>
                    <input type='button' value='Go!' onClick={this.handleGoButtonClick} ref='goButton' />
                  </p>
                  <hr />
                  <p>
                    <input type='button' value='French Fries' onClick={() => { this.handleExampleButtonClick('French Fries') }} />
                  </p>
                  <p>
                    <input type='button' value='Pasta' onClick={() => { this.handleExampleButtonClick('Pasta') }} />
                    &nbsp;&nbsp;&nbsp;
                    <input type='button' value='Pizza' onClick={() => { this.handleExampleButtonClick('Pizza') }} />
                  </p>
                  <p>
                    <input type='button' value='Paris' onClick={() => { this.handleExampleButtonClick('Paris') }} />
                    &nbsp;&nbsp;&nbsp;
                    <input type='button' value='France' onClick={() => { this.handleExampleButtonClick('France') }} />
                  </p>
                  <p>
                    <input type='button' value='London' onClick={() => { this.handleExampleButtonClick('London') }} />
                  </p>
                  <p>
                    <input type='button' value='England' onClick={() => { this.handleExampleButtonClick('England') }} />
                    &nbsp;&nbsp;&nbsp;
                    <input type='button' value='UK' onClick={() => { this.handleExampleButtonClick('UK') }} />
                  </p>
                  <p>
                    <input type='button' value='Chicago' onClick={() => { this.handleExampleButtonClick('Chicago') }} />
                    &nbsp;&nbsp;&nbsp;
                    <input type='button' value='USA' onClick={() => { this.handleExampleButtonClick('USA') }} />
                  </p>
                  <p>
                    <input type='button' value='Berlin' onClick={() => { this.handleExampleButtonClick('Berlin') }} />
                  </p>
                  <p>
                    <input type='button' value='Germany' onClick={() => { this.handleExampleButtonClick('Germany') }} />
                  </p>
                  <p>
                    <input type='button' value='Audi' onClick={() => { this.handleExampleButtonClick('Audi') }} />
                    &nbsp;&nbsp;&nbsp;
                    <input type='button' value='Porsche' onClick={() => { this.handleExampleButtonClick('Porsche') }} />
                  </p>
                  <p>
                    <input type='button' value='BMW' onClick={() => { this.handleExampleButtonClick('BMW') }} />
                  </p>
                  <p>
                    <input type='button' value='All Pictures' onClick={() => { this.handleExampleButtonClick('') }} />
                  </p>
                  <hr />
                  <p>
                    <select ref='timeSelect' onChange={this.handleCountdownSelectChange}>
                      {[1, 3, 4, 10, 30, 60].map((num) =>  
                          <option value={num * 1000} selected={this.state.countdown == (num * 1000)}>{num} sec</option>
                      )}
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
                <td style={{width: '1px', 'padding-left': '20px'}} nowrap="nowrap">
                    <div>
                      <p>
                        {this.state.loadingServerData &&
                          <div>..loading xml from flickr..</div>
                        }
                      </p>
                      <p>{`query: ${JSON.stringify(this.state.query)}`}</p>
                      <p>{`[${JSON.stringify(this.state.chunkPicNum + 1)}/${CHUNK_SIZE}]`} </p>
                      <p>{`page: ${JSON.stringify(this.state.page)}`}</p>
                      <p>currentCountdown: <br />{JSON.stringify(this.state.currentCountdown)}</p>
                      <p>{`paused: ${JSON.stringify(this.state.paused)}`}</p>
                    </div>
                </td>
              </tr>
            </table>
          </center>
        </div>
      </div>
    );
  }
}

export default App;
