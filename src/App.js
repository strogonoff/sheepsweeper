import React, { Component } from 'react';
import GridOfSquares from './sheepsweeper';
import './App.css';


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      grid: new GridOfSquares(14, 14),
      step: 0,
      score: {},
    };

    this.onItemDiscovery = this.onItemDiscovery.bind(this);
    this.onStep = this.onStep.bind(this);
    this.start = this.start.bind(this);
    this.updateSheepWalkComponent = this.updateSheepWalkComponent.bind(this);
  }

  render() {
    return (
      <div className="Game">
        <SheepWalk
          grid={this.state.grid}
          onStep={this.onStep}
          onItemDiscovery={this.onItemDiscovery}
          ref={(c) => this.updateSheepWalkComponent(c)} />
        <Dashboard
          score={this.state.score}
          step={this.state.step}
          onStart={this.start} />
      </div>
    )
  }

  start() {
    this.setState({
      grid: new GridOfSquares(14, 14),
      step: 0,
      score: {}
    });
  }

  onItemDiscovery(item) {
    let score = this.state.score;
    if (!score[item]) {
      score[item] = 1;
    } else {
      score[item] = score[item] + 1;
    }
    this.setState({score: score});
  }

  updateSheepWalkComponent(component) {
    if (this.initiallyExposedSquare && component) {
      component.onExposure(this.initiallyExposedSquare);
      this.initiallyExposedSquare = undefined;
    }
  }

  onStep(coords) {
    if (this.state.step === 0 && this.state.score['🐑']) {
      let newGrid;
      let squareType;
      let square;

      while (squareType !== '🌱') {
        newGrid = new GridOfSquares(14, 14);
        square = newGrid.getSquareAt(coords);
        squareType = square.type;
      };

      this.setState({grid: newGrid, step: 1, score: {}});
      this.initiallyExposedSquare = square;
      square.expose();

    } else {
      this.setState({step: this.state.step + 1});
    }
  }
}


class Dashboard extends Component {
  render() {
    return (
      <div className="Dashboard">
        <div>
          <small style={{display: this.props.score['🐑'] >= 1 ? 'inline' : 'none'}}>
            <span>You’ve discovered <strong>sheep</strong>.</span>
            &emsp;
            &#8203;
            <span>The <strong>sheep</strong> are alarmed.</span>
            &emsp;
            &#8203;
            <a href="javascript: void 0;" onClick={this.props.onStart}>Go to new pasture!</a>
          </small>
          <small style={{display: this.props.score['🌱'] >= 1 && !this.props.score['🐑'] ? 'inline' : 'none'}}>
            <span style={{display: this.props.step === 1 ? 'inline' : 'none'}}>You’ve explored some <strong>grass</strong>!</span>
            <span style={{display: this.props.step > 1 ? 'inline' : 'none'}}>You’ve explored more <strong>grass</strong>.</span>
          </small>
          <small style={{display: Object.keys(this.props.score).length < 1 ? 'inline' : 'none'}}>
            <span>Welcome to <strong>Sheepsweeper v0.6.1</strong>! Punch a square.</span>
          </small>
        </div>
        <div>
          <span title="Day">
            <span>☀️</span>
            &ensp;
            <strong>{this.props.step}</strong>
          </span>
          &emsp;
          <span title="Inventory" style={{display: Object.keys(this.props.score).length > 0 ? 'inline' : 'none'}}>
            {Object.keys(this.props.score).map(key => (
              <span key={key} className="ScoreItem">
                <span>{key}</span>
                &ensp;
                <strong>{this.props.score[key]}</strong>
                &emsp;
              </span>
            ))}
          </span>
        </div>
      </div>
    );
  }
}

class SheepWalk extends Component {
  constructor(props) {
    super(props);

    this.state = {
      exposedSquares: new Set(),
    }

    this.onExposure = this.onExposure.bind(this);
  }

  render() {
    return (
      <div className="Grid">
        {this.props.grid.squares.map(square => (
          <Square
            key={square.key}
            square={square}
            grid={this.props.grid}
            exposed={this.state.exposedSquares.has(square)}
            onExposure={this.onExposure}
            onStep={this.props.onStep} />
        ))}
      </div>
    );
  }

  onExposure(square) {
    let exposedSquares = new Set(this.state.exposedSquares);

    this.props.grid.squares.forEach((square) => {
      if (square.exposed && !this.state.exposedSquares.has(square)) {
        exposedSquares.add(square);
        this.props.onItemDiscovery(square.type);
      }
    });

    this.setState({exposedSquares: exposedSquares});
  }
}

class Square extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  getStyle() {
    return {
      width: '' + 100 / this.props.grid.width + '%',
      height: '' + 100 / this.props.grid.height + '%',
      cursor: this.props.exposed ? 'default' : 'pointer',
      fontSize: '' + this.props.grid.width / 5.2 + 'vmin',
    };
  }
  getCssClass() {
    return `Square ${this.props.exposed ? 'exposed' : 'hidden'} ${this.props.square.type}`
  }
  onClick() {
    if (!this.props.square.exposed) {
      this.props.grid.stopExploring = false;
      this.props.grid.currentExplorationCounter = 0;
      this.props.square.expose();
      this.props.onExposure(this.props.square);
      this.props.onStep([this.props.square.x, this.props.square.y]);
    }
  }
  renderExposedSquareContents() {
    if (this.props.square.type === '🐑') {
      return <SheepSquare />;
    } else {
      return <GrassSquare count={this.props.grid.countSheepSquaresAdjacentTo(this.props.square)} />;
    }
  }
  render() {
    return (
      <div
        className={this.getCssClass()}
        style={this.getStyle()}
        onClick={this.onClick}>
        <div>
          {this.props.exposed ? this.renderExposedSquareContents() : (
            <div></div>
          )}
        </div>
      </div>
    )
  }
}

class SheepSquare extends Component {
  render() {
    return (
      <div>&nbsp;</div>
    )
  }
}
class GrassSquare extends Component {
  getCountColor() {
    switch (this.props.count) {
      case 8: return 'firebrick'
      case 7: return 'sienna'
      case 6: return 'peru'
      case 5: return 'darkgoldenrod'
      case 4: return 'olive'
      case 3: return 'seagreen'
      case 2: return 'darkcyan'
      case 1: return 'royalblue'
      default: return 'black'
    }
  }
  render() {
    return (
      <div style={{color: this.getCountColor()}}>
        {this.props.count > 0 ? this.props.count : ' '}
      </div>
    )
  }
}

export default App;
