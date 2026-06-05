import axios from './axios';

import type { HookDeleteParams } from './hooks-api.types';

export async function deleteByHook({ entity, id }: HookDeleteParams): Promise<unknown> {
    const body = new URLSearchParams();
    body.set('Entity', entity);
    body.set('Id', id);

    const res = await axios.delete('/api/v1/hooks', {
        data: body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return res.data;
}
