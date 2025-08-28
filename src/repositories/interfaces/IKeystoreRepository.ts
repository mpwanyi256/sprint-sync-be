import { Keystore } from '../../types/AppRequests';
import { User } from '../../types/User';

export interface IKeystoreRepository {
  findByKey(client: User, key: string): Promise<Keystore | null>;
  findforKey(client: User, key: string): Promise<Keystore | null>;
  create(client: User, primaryKey: string, secondaryKey: string): Promise<Keystore>;
  remove(id: string): Promise<boolean>;
  removeAllForClient(client: User): Promise<boolean>;
  find(client: User, primaryKey: string, secondaryKey: string): Promise<Keystore | null>;
}
