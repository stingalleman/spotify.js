import {
  RecentlyPlayed,
  UserPrivate,
  Artist,
  Track,
  CursorPagingObject,
  PagingObject,
  TopOptions
} from '../../interfaces/Spotify';

import { Manager } from '../Manager';

export class MeManager extends Manager {
  /**
   * @description Get current user's top artists.
   * @param {string} type
   * @param {TopOptions} options?
   * @returns {Promise<PagingObject<Artist>>} Returns a promise with the paginated {@link Artist}.
   */
  async top(type: 'artists', options?: TopOptions): Promise<PagingObject<Artist>>;

  /**
   * @description Get current user's top tracks.
   * @param {string} type
   * @param {TopOptions} options?
   * @returns {Promise<PagingObject<Track>>} Returns a promise with the paginated {@link Track}.
   */
  async top(type: 'tracks', options?: TopOptions): Promise<PagingObject<Track>>;

  /**
   * @description Get the current user's top tracks or artists.
   * @param  {string} type
   * @param  {TopOptions} options
   */
  async top(type: 'artists' | 'tracks', options?: TopOptions): Promise<unknown> {
    const res = await this.http.get(`/me/top/${type}`, {
      query: {
        time_range: options?.timeRange,
        limit: options?.limit as unknown as string,
        offset: options?.offset as unknown as string
      }
    });

    return res.data as PagingObject<unknown>;
  }

  /**
   * @description Get current user's (private) data. (required scropes: user-read-private, user-read-email).
   * @returns {Promise<UserPrivate>}
   */
  async get(): Promise<UserPrivate> {
    const res = await this.http.get('/me');

    return res.data as UserPrivate;
  }

  /**
   * @description Get current user's recently played tracks. (required scoped: user-read-recently-played).
   * @param {limit?:number after?:number;before?:number} options?
   * @returns {Promise<CursorPagingObject<RecentlyPlayed>>} Returns a promise with the {@link RecentlyPlayed} items.
   */
  async recentlyPlayed(options?: {
    limit?: number;
    after?: number;
    before?: number;
  }): Promise<CursorPagingObject<RecentlyPlayed>> {
    const query: Record<string, string> = {
      limit: options?.limit ? (options.limit as unknown as string) : '20'
    };

    if (options?.after) query.after = options.after as unknown as string;
    if (options?.before) query.before = options.before as unknown as string;

    const res = await this.http.get(`/me/player/recently-played`, {
      query
    });

    const json = res.data;

    json.items = json.items.map((item) => ({
      ...item,
      played_at: new Date(item.played_at)
    }));

    return json as CursorPagingObject<RecentlyPlayed>;
  }

  /**
   * @description Check if one or more tracks is saved in the current user's library. (required scropes: user-library-read).
   * @returns {Promise<UserPrivate>}
   * @returns {Promise<boolean[]>} Returns a promise with the an array of booleans.
   */
  async containTracks(ids: string[]): Promise<boolean[]> {
    const res = await this.http.get(`/me/tracks/contains`, {
      query: { ids: ids.join(', ') }
    });

    return res.data as boolean[];
  }

  /**
   * @description Save multiple tracks by ID. (required scropes: user-library-read).
   * @param {string} ids Array of IDs.
   */
  async saveTracks(ids: string[]) {
    await this.http.put(`/me/tracks`, {
      ids
    });
  }

  /**
   * @description Remove multiple saved tracks by ID. (required scropes: user-library-read).
   * @param {string} ids Array of IDs.
   */
  async unsaveTracks(ids: string[]) {
    await this.http.delete(`/me/tracks`, {
      query: { ids: ids.join(', ') }
    });
  }
}
