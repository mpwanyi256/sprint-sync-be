import { User } from '../../types/User';
import _ from 'lodash';

export function getUserData(user: User) {
  const data = _.pick(user, ['_id', 'firstName', 'lastName', 'email']);
  return data;
}
