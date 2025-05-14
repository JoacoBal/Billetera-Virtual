import type { User } from '@/types';
import { httpClient } from './httpClient';

/**
 * TODO, implementar projectModel en el backend
 * @returns 
 */
export const getUsers = async () => {
    const result = await httpClient.get<User[]>(
        `/users`,
        {
            params: {
                projectModel: ['name', 'email', 'phone'],
            },
        },
    );
    return result;
};