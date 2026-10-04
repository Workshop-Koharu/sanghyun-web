import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { queryOne } from './db';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'sanghyun-high-school-secret-key-32-chars-minimum-key';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = 'sanghyun_session';

export interface UserSession {
  userId: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  isAdmin: boolean;
  isStudent: boolean;
  studentId?: string | null;
}

export async function createSessionToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

export async function getSession(req?: NextRequest): Promise<UserSession | null> {
  let token: string | undefined;
  if (req) {
    token = req.cookies.get(COOKIE_NAME)?.value;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(COOKIE_NAME)?.value;
  }

  if (!token) return null;
  return verifySessionToken(token);
}

export async function checkUserPermissions(
  accessToken: string,
  userId: string
): Promise<{ isAdmin: boolean; isStudent: boolean; studentId: string | null }> {
  const guildId = process.env.NEXT_PUBLIC_GUILD_ID || '1528353970714841110';
  const botToken = process.env.DISCORD_BOT_TOKEN;

  let isAdmin = false;

  try {
    if (botToken) {
      const memberRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
        headers: {
          Authorization: `Bot ${botToken}`,
        },
      });

      if (memberRes.ok) {
        const memberData = await memberRes.json();
        const roles: string[] = memberData.roles || [];

        const settings = await queryOne<{ value: string }>(
          `SELECT value FROM bot_settings WHERE guild_id = $1 AND key = 'role_teacher'`,
          [guildId]
        );
        const councilSetting = await queryOne<{ value: string }>(
          `SELECT value FROM bot_settings WHERE guild_id = $1 AND key = 'role_council'`,
          [guildId]
        );

        if (settings && roles.includes(settings.value)) {
          isAdmin = true;
        }
        if (councilSetting && roles.includes(councilSetting.value)) {
          isAdmin = true;
        }

        const guildRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
          headers: { Authorization: `Bot ${botToken}` },
        });
        if (guildRes.ok) {
          const guildData = await guildRes.json();
          if (guildData.owner_id === userId) {
            isAdmin = true;
          }
        }
      }
    }

    if (!isAdmin) {
      const guildsRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (guildsRes.ok) {
        const guilds = await guildsRes.json();
        const targetGuild = guilds.find((g: any) => g.id === guildId);
        if (targetGuild) {
          if (targetGuild.owner) {
            isAdmin = true;
          } else {
            const permissions = BigInt(targetGuild.permissions || '0');
            const adminPermission = BigInt(0x8);
            if ((permissions & adminPermission) === adminPermission) {
              isAdmin = true;
            }
          }
        }
      }
    }
  } catch {
    isAdmin = false;
  }

  const studentRow = await queryOne<{ student_id: string; status: string }>(
    `SELECT student_id, status FROM students WHERE user_id = $1`,
    [userId]
  );

  const isStudent = !!studentRow && studentRow.status === 'enrolled';
  const studentId = studentRow ? studentRow.student_id : null;

  return {
    isAdmin,
    isStudent,
    studentId,
  };
}
