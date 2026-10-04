import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const userId = BigInt(session.userId);
    const student = await queryOne<any>(
      `SELECT s.user_id, s.nickname as real_name, s.grade, s.class_no as class_num,
              s.student_no as student_num, s.student_code as student_id, s.status, s.created_at as enrolled_at
       FROM students s
       WHERE s.user_id = $1`,
      [userId]
    );

    if (!student) {
      return NextResponse.json({ error: '등록된 학생 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Fetch student's clubs
    const clubRow = await queryOne<any>(
      `SELECT STRING_AGG(c.name, ', ') as club_names
       FROM club_members cm
       JOIN clubs c ON cm.club_id = c.id
       WHERE cm.user_id = $1 AND c.status IN ('recruiting', 'active')`,
      [userId]
    );

    const studentCode = student.student_id || `${student.grade}${String(student.class_num).padStart(2, '0')}${String(student.student_num).padStart(2, '0')}`;
    const studentName = student.real_name || session.username || '상현인';
    const clubsStr = clubRow?.club_names || '미배정';

    // Apple Wallet Pass Definition Schema (pass.json standard)
    const passPayload = {
      formatVersion: 1,
      passTypeIdentifier: 'pass.kr.hs.sanghyun.studentcard',
      serialNumber: `SH-PASS-${student.user_id}`,
      teamIdentifier: 'SANGHYUNHS',
      organizationName: '상현고등학교',
      description: '상현고등학교 디지털 모바일 학생증',
      logoText: '상현고등학교',
      foregroundColor: 'rgb(255, 255, 255)',
      backgroundColor: 'rgb(15, 23, 42)',
      labelColor: 'rgb(148, 163, 184)',
      generic: {
        primaryFields: [
          {
            key: 'student_name',
            label: '학생 성명',
            value: studentName,
          },
        ],
        secondaryFields: [
          {
            key: 'class_info',
            label: '학적',
            value: `${student.grade}학년 ${student.class_num}반 ${student.student_num}번`,
          },
          {
            key: 'student_id',
            label: '학번',
            value: studentCode,
          },
        ],
        auxiliaryFields: [
          {
            key: 'club',
            label: '소속 동아리',
            value: clubsStr,
          },
          {
            key: 'status',
            label: '상태',
            value: '재학 (정규 학생)',
          },
        ],
        backFields: [
          {
            key: 'school_motto',
            label: '교훈',
            value: '지혜를 닦고 덕성을 길러 세계를 밝히자',
          },
          {
            key: 'school_vision',
            label: '교육 비전',
            value: '자주인 • 창의인 • 공동체인',
          },
          {
            key: 'terms',
            label: '이용 규정',
            value: '본 패스는 상현고등학교 학생 신분을 공식 증명하는 디지털 학생증이며, 교내 출입 및 급식, 도서 대출 시 스캔하여 사용 가능합니다.',
          },
          {
            key: 'issuer',
            label: '발행처',
            value: '상현고등학교 교무처 학생생활안전부',
          },
        ],
      },
      barcodes: [
        {
          format: 'PKBarcodeFormatCode128',
          message: studentCode,
          messageEncoding: 'iso-8859-1',
          altText: studentCode,
        },
        {
          format: 'PKBarcodeFormatQR',
          message: `https://sanghyun.koharu.live/student/${student.user_id}`,
          messageEncoding: 'utf-8',
          altText: '상현고 학생인증 QR',
        },
      ],
      nfc: {
        message: studentCode,
        encryptionPublicKey: 'SANGHYUN_NFC_PUBLIC_KEY',
      },
    };

    const { searchParams } = new URL(req.url);
    const download = searchParams.get('download');

    if (download === '1') {
      const jsonStr = JSON.stringify(passPayload, null, 2);
      return new NextResponse(jsonStr, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.pkpass+json; charset=utf-8',
          'Content-Disposition': `attachment; filename="sanghyun_student_${studentCode}.pkpass"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      pass: passPayload,
      student: {
        studentName,
        studentCode,
        grade: student.grade,
        classNum: student.class_num,
        studentNum: student.student_num,
        clubs: clubsStr,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
