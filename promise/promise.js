const STATE = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
}

export class MyPromise {
  #thenCallbacks = [];
  #catchCallbacks = [];
  #state = STATE.PENDING;
  #value

  #onSuccessBind = this.#onSuccess.bind(this);
  #onFailBind = this.#onFail.bind(this);

  constructor(callback) {
    try {
      callback(this.#onSuccessBind, this.#onFailBind);
    } catch (e) {
      this.#onFail(e);
    }
  }

  #runCallbacks() {
    if (this.#state === STATE.FULFILLED) {
      for (const callback of this.#thenCallbacks) {
        callback(this.#value);
      }

      this.#thenCallbacks = [];
    }

    if (this.#state === STATE.REJECTED) {
      for (const callback of this.#catchCallbacks) {
        callback(this.#value);
      }

      this.#catchCallbacks = [];
    }
  }

  #onSuccess(value) {
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return;

      if (value instanceof MyPromise) {
        value.then(this.#onSuccessBind, this.#onFailBind);
        return;
      }

      this.#value = value;
      this.#state = STATE.FULFILLED;
      this.#runCallbacks();
    });
  }

  #onFail(value) {
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return;

      if (value instanceof MyPromise) {
        value.then(this.#onSuccessBind, this.#onFailBind);
        return;
      }

      if (!this.#catchCallbacks.length) {
         throw new UncaughtPromiseError(value);
      }

      this.#value = value;
      this.#state = STATE.REJECTED;
      this.#runCallbacks();
    });
  }

  then(thenCallback, catchCallback) {
    return new MyPromise((resolve, reject) => {
      this.#thenCallbacks.push(result => {
        if (!thenCallback) {
          resolve(result);
          return;
        }

        try {
          resolve(thenCallback(result));
        } catch (error) {
          reject(error);
        }
      });

      this.#catchCallbacks.push(result => {
        if (!catchCallback) {
          reject(result);
          return;
        }

        try {
          resolve(catchCallback(result));
        } catch (error) {
          reject(error);
        }
      });
  
      this.#runCallbacks();
    });
  }

  catch(callback) {
    return this.then(undefined, callback);
  }

  finally(callback) {
    return this.then(
      result => {
        callback();
        return result;
      }, 
      result => {
        callback();
        throw result;
      }
    );
  }

  static resolve(result) {
    return new MyPromise(resolve => resolve(result));
  }

  static reject(result) {
    return new MyPromise((_, reject) => reject(result));
  }

  static any(promises) {
    return new MyPromise((resolve, reject) => {
      let counter = promises.length;

      for (const promise of promises) {
        promise
          .then(resolve)
          .finally(() => {
            counter--;

            if (counter === 0) {
              reject(new Error('AccumulatedError'));
            }
          });
      }
    });
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      let counter = promises.length;
      const results = [];
      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i];
        promise
          .then(res => {
            results[i] = res;
          })
          .catch(reject)
          .finally(() => {
            counter--;

            if (counter === 0) resolve(results);
          });
      }
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      for (const promise of promises) {
        promise.then(resolve).catch(reject);
      }
    });
  }

  static allSettled(promises) {
    return new MyPromise((resolve) => {
      const results = [];
      let counter = promises.length;
      for (let i = 0; i < promises.length; i++) {
        promises[i]
          .then(res => {
            results[i] = { status: 'fulfilled', value: res }
          })
          .catch(error => {
            results[i] = { status: 'rejected', reason: error };
          })
          .finally(() => {
            counter--;
            if (counter === 0) {
              resolve(results);
            }
          });
      }
    });
  }
}

class UncaughtPromiseError extends Error {
  constructor(error) {
    super(error);

    this.stack = `(in promise) ${error.stack}`;
  }
}
