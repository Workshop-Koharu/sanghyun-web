import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const clubs = await query<any>(
      `SELECT c.id, c.name, c.description, c.leader_id, c.status, c.created_at,
              c.role_id, c.channel_id,
              s.nickname as leader_name,
              COUNT(cm.user_id)::INT as member_count
       FROM clubs c
       LEFT JOIN students s ON c.leader_id = s.user_id
       LEFT JOIN club_members cm ON c.id = cm.club_id
       GROUP BY c.id, c.name, c.description, c.leader_id, c.status, c.created_at, c.role_id, c.channel_id, s.nickname
       ORDER BY c.created_at DESC`
    );

    return NextResponse.json({ clubs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { clubId, action } = body;

    if (!clubId || !action) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    const club = await queryOne<any>('SELECT * FROM clubs WHERE id = $1', [clubId]);
    if (!club) {
      return NextResponse.json({ error: '동아리를 찾을 수 없습니다.' }, { status: 404 });
    }

    const botToken = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.NEXT_PUBLIC_GUILD_ID || '1528353970714841110';
    const commonRoleId = '1556253189727064094';
    const categoryChannelId = '1556253606750199809';

    if (action === 'approve' || action === 'sync') {
      let createdRoleId: string | null = club.role_id ? String(club.role_id) : null;
      let createdChannelId: string | null = club.channel_id ? String(club.channel_id) : null;

      if (botToken) {
        // 1. Create Discord Role if missing
        if (!createdRoleId) {
          try {
            const roleRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
              method: 'POST',
              headers: {
                Authorization: `Bot ${botToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: `동아리-${club.name}`,
                color: 0x4f6bed,
                hoist: true,
                mentionable: true,
              }),
            });
            if (roleRes.ok) {
              const roleData = await roleRes.json();
              createdRoleId = roleData.id;

              // Try positioning role below common role
              try {
                const allRolesRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
                  headers: { Authorization: `Bot ${botToken}` },
                });
                if (allRolesRes.ok) {
                  const allRoles = await allRolesRes.json();
                  const commonRole = allRoles.find((r: any) => r.id === commonRoleId);
                  if (commonRole && commonRole.position > 1) {
                    await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
                      method: 'PATCH',
                      headers: {
                        Authorization: `Bot ${botToken}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify([{ id: createdRoleId, position: Math.max(1, commonRole.position - 1) }]),
                    });
                  }
                }
              } catch (_) {}
            }
          } catch (e) {
            console.error('Error creating discord role:', e);
          }
        }

        // 2. Create Discord Text Channel in Category 1556253606750199809 if missing
        if (!createdChannelId) {
          try {
            const channelName = `동아리-${club.name}`.toLowerCase().replace(/\s+/g, '-');
            const overwrites: any[] = [
              { id: guildId, type: 0, deny: '1024' }, // @everyone cannot view channel
            ];
            if (createdRoleId) {
              overwrites.push({ id: createdRoleId, type: 0, allow: '3072' }); // Club role can view and send messages
            }

            const chRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
              method: 'POST',
              headers: {
                Authorization: `Bot ${botToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: channelName,
                type: 0,
                parent_id: categoryChannelId,
                permission_overwrites: overwrites,
              }),
            });
            if (chRes.ok) {
              const chData = await chRes.json();
              createdChannelId = chData.id;

              // Send welcome message
              await fetch(`https://discord.com/api/v10/channels/${createdChannelId}/messages`, {
                method: 'POST',
                headers: {
                  Authorization: `Bot ${botToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  content: `## 🎉 **${club.name}** 동아리 공식 채널이 개설되었습니다!\n-# 동아리원들과 자유롭게 대화를 나누고 주간 활동을 공유해 보세요.`,
                }),
              });
            }
          } catch (e) {
            console.error('Error creating discord channel:', e);
          }
        }

        // 3. Assign roles to Leader & Members
        try {
          const members = await query<any>('SELECT user_id FROM club_members WHERE club_id = $1', [clubId]);
          const userIds = new Set<string>();
          if (club.leader_id) userIds.add(String(club.leader_id));
          members.forEach((m) => userIds.add(String(m.user_id)));

          for (const uid of Array.from(userIds)) {
            if (createdRoleId) {
              await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${uid}/roles/${createdRoleId}`, {
                method: 'PUT',
                headers: { Authorization: `Bot ${botToken}` },
              });
            }
            await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${uid}/roles/${commonRoleId}`, {
              method: 'PUT',
              headers: { Authorization: `Bot ${botToken}` },
            });
          }
        } catch (e) {
          console.error('Error granting roles to members:', e);
        }
      }

      await query(
        `UPDATE clubs 
         SET status = 'active', 
             role_id = COALESCE($1, role_id), 
             channel_id = COALESCE($2, channel_id), 
             category_id = $3
         WHERE id = $4`,
        [createdRoleId ? BigInt(createdRoleId) : null, createdChannelId ? BigInt(createdChannelId) : null, BigInt(categoryChannelId), clubId]
      );
    } else if (action === 'disband') {
      if (botToken) {
        if (club.channel_id) {
          try {
            await fetch(`https://discord.com/api/v10/channels/${club.channel_id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bot ${botToken}` },
            });
          } catch (_) {}
        }
        if (club.role_id) {
          try {
            await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles/${club.role_id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bot ${botToken}` },
            });
          } catch (_) {}
        }
      }
      await query("UPDATE clubs SET status = 'disbanded' WHERE id = $1", [clubId]);
    } else if (action === 'reject') {
      await query("UPDATE clubs SET status = 'failed' WHERE id = $1", [clubId]);
    }

    const now = Math.floor(Date.now() / 1000);

    // Queue web action for bot as well
    try {
      await query(
        `INSERT INTO web_actions (action, payload, requested_by, status, created_at)
         VALUES ($1, $2, $3, 'pending', $4)`,
        [action === 'approve' ? 'approve_club' : 'disband_club', JSON.stringify({ club_id: clubId }), BigInt(session.userId), now]
      );
    } catch (_) {}

    await query(
      `INSERT INTO audit_logs (admin_id, admin_name, action, details, created_at)
       VALUES ($1, $2, '동아리관리', $3, $4)`,
      [BigInt(session.userId), session.username, `동아리 '${club.name}' (ID ${clubId}) 조치: ${action}`, now]
    );

    return NextResponse.json({
      success: true,
      message: `동아리 '${club.name}'이(가) 성공적으로 처리되었습니다. (역할 및 채널 생성 완료)`,
    });
  } catch (error: any) {
    console.error('Club action error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
