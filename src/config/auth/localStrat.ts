import Local from 'passport-local';
import { findUserByUsernameService } from '@/services/users/auth';
import ServerError from '../util/ServerError';
import { validatePassword } from './passwordFns';

const localStrat = new Local.Strategy(async (username, password, done) => {
  try {
    const user = await findUserByUsernameService({ username });
    if (!user) {
      throw new ServerError('Username or password is incorrect.', 401);
    }

    const isValidLogin = await validatePassword(user.hash, password);
    if (!isValidLogin) {
      throw new ServerError('Username or password is incorrect.', 401);
    }

    done(null, { id: user.id, username: user.username });
  } catch (error) {
    done(error);
  }
});

export default localStrat;
