import userEvents from '../events/UserEvents.mjs';
import keyChecker from '../utilities/keyUtils.mjs';

const loginListener = () => {
    userEvents.on('login.success', (data) => keyChecker(data));
}

export default loginListener;