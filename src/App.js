import React, { Component } from 'react';
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
      currentQuery: '',
      chunkArray: [],
      chunkPicNum: 0,
      currentImageFlickrData: null,
      inputCountdown: 10000,
      currentCountdown: 0,
      paused: false,
      loadingServerData: false,
      resettingToNewQuery: false,
      resettingToBack: false,
      resettingToBack10: false,
      resettingToNext: false,
      resettingToNext10: false,
      resettingToNext100: false
    };
    this.state.inputQuery = this.state.currentQuery;

    this.loadFlickrData();
  }

  startCountDown = (finishCallback, ms) => {
    this.setState({currentCountdown: ms, currentCountdown: this.state.inputCountdown});
    this.timer = setTimeout(() => { this.countDown(finishCallback); }, 1000);
  }

  countDown = (finishCallback) => {
    if (!this.state.paused) {
      const newC = this.state.currentCountdown - 100;
      this.setState({currentCountdown: newC});
    }
    if (
      this.state.currentCountdown == 0
      ||this.state.resettingToNewQuery
      || this.state.resettingToNext
      || this.state.resettingToNext10
      || this.state.resettingToNext100
      || this.state.resettingToBack
      || this.state.resettingToBack10
    ) {
       clearTimeout(this.timer);
       this.timer = null;
       finishCallback();
    }
    else {
      this.timer = setTimeout(() => { this.countDown(finishCallback); }, 100);
    }
  }

  loadFlickrData() {
    this.setState({loadingServerData: true});
    gitFlickrPicsList(
      API_KEY,
      (data) => {
        this.setState({loadingServerData: false, chunkArray: data});
        this.slideshowTimeout();
      },
      (message) => {
        this.setState({loadingServerData: false});
        generateNoty(message);
        this.startCountDown(this.loadFlickrData.bind(this), this.state.inputCountdown);
      },
      this.state.currentQuery,
      this.state.page,
      CHUNK_SIZE
    )
  }

  slideshowTimeout = () => {
    this.setState({currentImageFlickrData: this.state.chunkArray[this.state.chunkPicNum]});
    this.startCountDown(
      () => {
        if (this.state.resettingToNewQuery) {
          document.title = `${this.state.currentQuery ? this.state.currentQuery + ' - ' : '' }Flickr Slideshow`;
          this.setState({chunkArray: [], page: 1, chunkPicNum: 0, resettingToNewQuery: false});
          this.loadFlickrData();
        } else if (this.state.resettingToNext10) {
          this.setState({resettingToNext10: false});
          this.setState({page: this.state.page + 10});
          this.loadFlickrData();
        } else if (this.state.resettingToNext100) {
          this.setState({resettingToNext100: false});
          this.setState({page: this.state.page + 100});
          this.loadFlickrData();
        } else if (this.state.resettingToBack) {
          this.setState({resettingToBack: false});

          if (this.state.chunkPicNum - 1 >= 0 ) {
            this.setState({chunkPicNum: this.state.chunkPicNum - 1});
            this.slideshowTimeout();
          } else {
            if (this.state.page - 1 >= 1 ) {
              this.setState({page: this.state.page - 1, chunkPicNum: 9});
              this.loadFlickrData();
            }
          }
        } else {
          if (this.state.resettingToNext) {
            this.setState({resettingToNext: false});
          }

          if (this.state.chunkPicNum + 1 < this.state.chunkArray.length) {
            this.setState({chunkPicNum: this.state.chunkPicNum + 1});
            this.slideshowTimeout();
          } else {
            this.setState({page: this.state.page + 1, chunkPicNum: 0});
            this.loadFlickrData();
          }
        }
      }
      ,
      this.state.inputCountdown
    );
  }

  handleQueryInputChange = (event) => {
    this.setState({inputQuery: event.target.value});
  }

  handleCountdownSelectChange = (event) => {
    const v = parseInt(event.target.value);
    this.setState({inputCountdown: v, currentCountdown: v});
  }

  handleGoButtonClick = () => {
    const val = this.state.inputQuery;
    if (!val) {
      generateNoty('Please input non empty string.');
    } else {
      this.setState({currentQuery: val, resettingToNewQuery: true});
    }
  }

  handleExampleButtonClick = (val) => {
    this.setState({inputQuery: val, currentQuery: val, resettingToNewQuery: true});
  }

  handleBackButtonClick = () => {
    if (!(this.state.page == 1 && this.state.chunkPicNum == 0)) {
      this.setState({resettingToBack: true});
    }
  }

  handleBack10ButtonClick = () => {
    if (!(this.state.page == 1 && this.state.chunkPicNum == 0)) {
      this.setState({resettingToBack10: true});
    }
  }

  handlePauseButtonClick = () => {
    this.setState({paused: true});
  }

  handleUnpauseButtonClick = () => {
    this.setState({paused: false});
  }

  handleNextButtonClick = () => {
    this.setState({resettingToNext: true});
  }

  handleNext10ButtonClick = () => {
    this.setState({resettingToNext10: true});
  }

  handleNext100ButtonClick = () => {
    this.setState({resettingToNext100: true});
  }

  render() {
    return (
      <div>
        <div>
          <center>
            <table style={{width: '100%'}}>
              <tbody>
                <tr>
                  <td style={{width: '100%'}}>
                  {
                    this.state.currentImageFlickrData != null
                    ?
                    <a href={this.state.currentImageFlickrData.flickrUrl} target='_blank'>
                      <img src={this.state.currentImageFlickrData.src} style={{maxWidth: `100%`, maxHeight: `${window.innerHeight - 10}px`}} alt={this.state.currentQuery} />
                    </a>
                    :
                    <p>...loading data...</p>
                  }
                  </td>
                  <td style={{paddingLeft: '20px', verticalAlign: 'top', whiteSpace: 'nowrap'}}>
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
                      <select ref='timeSelect' onChange={this.handleCountdownSelectChange} value={this.state.inputCountdown}>
                        {[1, 3, 4, 10, 30, 60].map((num) =>  
                            <option value={num * 1000} key={num * 1000}>{num} sec</option>
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
                  <td style={{width: '1px', paddingLeft: '20px', whiteSpace: 'nowrap'}}>
                      <div>
                        <p>
                          {this.state.loadingServerData &&
                            <div>..loading xml from flickr..</div>
                          }
                        </p>
                        <p>{`currentQuery: ${JSON.stringify(this.state.currentQuery)}`}</p>
                        <p>{`[${JSON.stringify(this.state.chunkPicNum + 1)}/${CHUNK_SIZE}]`} </p>
                        <p>{`page: ${JSON.stringify(this.state.page)}`}</p>
                        <p>currentCountdown: <br />{JSON.stringify(this.state.currentCountdown)}</p>
                        <p>{`paused: ${JSON.stringify(this.state.paused)}`}</p>
                      </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </center>
        </div>
      </div>
    );
  }
}

export default App;
