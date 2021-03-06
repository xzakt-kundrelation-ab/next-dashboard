// @flow

import EventEmitter from 'events';

export const errorEventEmitter = new EventEmitter();

class ErrorReporter {
  constructor() {
    const runQueue = () => {
      while (
        errorEventEmitter.listenerCount('error') > 0 &&
        this.cache.length > 0
      ) {
        const event = this.cache.pop();
        errorEventEmitter.emit('error', event.err);
      }
    };
    errorEventEmitter.on('newListener', () => {
      if (errorEventEmitter.listenerCount('error') === 0) {
        // "The EventEmitter instance will emit its own 'newListener' event before a listener is added to its internal array of listeners."
        setTimeout(runQueue, 0);
      }
    });
  }

  cache: { resolve: boolean => void, err: Error }[] = [];

  report(err: Error): Promise<boolean> {
    if (errorEventEmitter.listenerCount('error') > 0) {
      return Promise.resolve(errorEventEmitter.emit('error', err));
    }
    return new Promise(resolve => {
      this.cache.unshift({
        resolve,
        err,
      });
    });
  }
}

export default new ErrorReporter();
