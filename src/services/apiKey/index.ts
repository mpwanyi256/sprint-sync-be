import { ApiKeyModel } from '../../models/ApiKey';
import ApiKey from '../../types/AppRequests';

export default {
  findByKey: async (key: string): Promise<ApiKey | null> => {
    return await ApiKeyModel.findOne({ key });
  },
};
