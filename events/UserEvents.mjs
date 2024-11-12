import EventEmitter from 'events';

class UserEvents extends EventEmitter {
    constructor() {
        super();
    }

    loginUser(data) {
        this.emit('login.success', data);
    }
}

export default new UserEvents();