import { Component } from 'react';
import PropTypes from 'prop-types';

export class Countdown extends Component {
  static propTypes = {
    finishTime: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  updateTimer() {
    this.setState({ now: Date.now() });
  }

  componentDidMount() {
    this.updateTimer();
    this.timerID = setInterval(() => this.updateTimer(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  hours(msRemaining) {
    return Math.floor(msRemaining / 1000 / 60 / 60);
  }

  minutes(msRemaining) {
    return (Math.floor(msRemaining / 1000 / 60) % 60).toString().padStart(2, '0');
  }

  seconds(msRemaining) {
    return Math.floor((msRemaining / 1000) % 60)
      .toString()
      .padStart(2, '0');
  }

  render() {
    const { finishTime } = this.props;
    const { now } = this.state;
    const msRemaining = Math.max(finishTime - now, 0);

    const hrs = this.hours(msRemaining);

    // Only output if finishtime is given
    return (
      finishTime &&
      `${hrs ? `${hrs}:` : ''}${this.minutes(msRemaining)}:${this.seconds(msRemaining)}`
    );
  }
}
