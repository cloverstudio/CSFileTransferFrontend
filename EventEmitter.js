class EventEmitter {

  constructor() {
    this.events = {};
  }

  on (eventName, callback) {
    if(this.events[eventName]) {
      this.events[eventName].push(callback);
    } else {
      this.events[eventName] = [callback];
    }
  }

  trigger (eventName, ...rest) {
    if(this.events[eventName]) {
      this.events[eventName].forEach(cb => cb.apply(null, rest));
    }
  }
}