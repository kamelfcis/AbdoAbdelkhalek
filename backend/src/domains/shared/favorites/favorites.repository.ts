import { prisma } from '../../../infrastructure/prisma/client.js';
import { isPoolerError } from '../../../infrastructure/prisma/db-errors.js';
import * as rest from '../../../infrastructure/supabase-rest/client.js';

const TABLE = 'user_video_favorites';

export type FavoriteDomain = 'fitness' | 'squash';

function mapRow(row: { videoId?: string; video_id?: string }): string {
  return String(row.videoId ?? row.video_id);
}

export async function listFavoriteVideoIds(
  userId: string,
  domain: FavoriteDomain
): Promise<string[]> {
  try {
    const rows = await prisma.userVideoFavorite.findMany({
      where: { userId, domain },
      select: { videoId: true },
    });
    return rows.map((r) => r.videoId);
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const rows = await rest.restList<{ video_id: string }>(
      TABLE,
      `?user_id=eq.${encodeURIComponent(userId)}&domain=eq.${encodeURIComponent(domain)}&select=video_id`
    );
    return rows.map(mapRow);
  }
}

export async function toggleFavorite(
  userId: string,
  domain: FavoriteDomain,
  videoId: string
): Promise<{ favorited: boolean; videoId: string }> {
  try {
    const existing = await prisma.userVideoFavorite.findUnique({
      where: { userId_videoId_domain: { userId, videoId, domain } },
    });
    if (existing) {
      await prisma.userVideoFavorite.delete({
        where: { userId_videoId_domain: { userId, videoId, domain } },
      });
      return { favorited: false, videoId };
    }
    await prisma.userVideoFavorite.create({ data: { userId, videoId, domain } });
    return { favorited: true, videoId };
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const found = await rest.restOne<Record<string, unknown>>(
      TABLE,
      `?user_id=eq.${encodeURIComponent(userId)}&video_id=eq.${encodeURIComponent(videoId)}&domain=eq.${encodeURIComponent(domain)}&select=user_id`
    );
    if (found) {
      await rest.restDeleteWhere(
        TABLE,
        `user_id=eq.${encodeURIComponent(userId)}&video_id=eq.${encodeURIComponent(videoId)}&domain=eq.${encodeURIComponent(domain)}`
      );
      return { favorited: false, videoId };
    }
    await rest.restCreate(TABLE, {
      user_id: userId,
      video_id: videoId,
      domain,
    });
    return { favorited: true, videoId };
  }
}

export async function syncFavorites(
  userId: string,
  domain: FavoriteDomain,
  videoIds: string[]
): Promise<string[]> {
  const unique = Array.from(new Set(videoIds.map(String)));
  try {
    await prisma.$transaction([
      prisma.userVideoFavorite.deleteMany({ where: { userId, domain } }),
      ...(unique.length
        ? [
            prisma.userVideoFavorite.createMany({
              data: unique.map((videoId) => ({ userId, videoId, domain })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);
    return unique;
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    await rest.restReplaceRows(
      TABLE,
      `user_id=eq.${encodeURIComponent(userId)}&domain=eq.${encodeURIComponent(domain)}`,
      unique.map((videoId) => ({
        user_id: userId,
        video_id: videoId,
        domain,
      }))
    );
    return unique;
  }
}
