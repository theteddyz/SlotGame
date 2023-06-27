import Phaser from "phaser";

enum SpinStates {
  SpinReady,
  Spinning,
  CheckingWins,
  ShowingWins
}

class SpinStateMachine {
  private state: SpinStates;

  constructor() {
    this.state = SpinStates.SpinReady;
  }

  setSpinReadyState() {
    this.state = SpinStates.SpinReady;
  }

  setSpinningState() {
    this.state = SpinStates.Spinning;
  }

  setCheckingWinsState() {
    this.state = SpinStates.CheckingWins;
  }

  setShowingWinsState() {
    this.state = SpinStates.ShowingWins;
  }

  isSpinReadyState() {
    return this.state === SpinStates.SpinReady;
  }

  isSpinningState() {
    return this.state === SpinStates.Spinning;
  }

  isCheckingWinsState() {
    return this.state === SpinStates.CheckingWins;
  }

  isShowingWinsState() {
    return this.state === SpinStates.ShowingWins;
  }
}

export default SpinStateMachine;
