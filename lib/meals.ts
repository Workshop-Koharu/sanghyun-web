export interface MealMenu {
  rice: string;
  soup: string;
  main: string;
  side1: string;
  side2: string;
  dessert: string;
  calories: string;
}

export const MEAL_TEMPLATES: MealMenu[] = [
  {
    rice: '기장밥',
    soup: '얼큰소고기무국',
    main: '수제치즈돈까스/소스',
    side1: '푸실리파스타샐러드',
    side2: '배추김치',
    dessert: '샤인머스캣에이드',
    calories: '820 kcal',
  },
  {
    rice: '흑미밥',
    soup: '맑은순두부백탕',
    main: '언양식바싹불고기/파채',
    side1: '치즈감자전',
    side2: '열무김치',
    dessert: '수제딸기라떼',
    calories: '790 kcal',
  },
  {
    rice: '날치알김치볶음밥',
    soup: '팽이버섯된장국',
    main: '순살양념치킨',
    side1: '옥수수콘샐러드',
    side2: '깍두기',
    dessert: '망고요거트푸딩',
    calories: '850 kcal',
  },
  {
    rice: '발아현미밥',
    soup: '진한사골우거지탕',
    main: '매콤돼지갈비찜',
    side1: '해물동그랑땡전',
    side2: '석박지',
    dessert: '유기농사과주스',
    calories: '810 kcal',
  },
  {
    rice: '가쓰오우동 (주식)',
    soup: '유부미소장국',
    main: '왕새우튀김 & 타르타르',
    side1: '단무지부추무침',
    side2: '배추김치',
    dessert: '미니붕어빵 & 쿨피스',
    calories: '760 kcal',
  },
  {
    rice: '차조밥',
    soup: '차돌된장찌개',
    main: '오리훈제구이/무쌈/머스타드',
    side1: '부추겉절이',
    side2: '총각김치',
    dessert: '식혜',
    calories: '830 kcal',
  },
  {
    rice: '소고기야채비빔밥',
    soup: '달걀파국',
    main: '수제소떡소떡',
    side1: '약고추장/참기름',
    side2: '백김치',
    dessert: '청포도포레스트주스',
    calories: '800 kcal',
  },
];

export function getDailyMeal(
  offsetDays: number = 0,
  mealType: '중식' | '석식' = '중식'
) {
  // Compute in Korea Standard Time (UTC+9)
  const now = new Date(Date.now() + 9 * 3600 * 1000 + offsetDays * 86400 * 1000);
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const date = String(now.getUTCDate()).padStart(2, '0');
  const dayIdx = now.getUTCDay();
  const daysKr = ['일', '월', '화', '수', '목', '금', '토'];

  let seed = parseInt(`${year}${month}${date}`, 10);
  if (mealType === '석식') {
    seed += 3;
  }

  const idx = Math.abs(seed) % MEAL_TEMPLATES.length;
  const menu = MEAL_TEMPLATES[idx];
  const menuString = `${menu.rice} · ${menu.soup} · ${menu.main} · ${menu.side1} · ${menu.side2} · ${menu.dessert}`;

  return {
    year,
    month,
    date,
    dayKr: daysKr[dayIdx],
    dateFormatted: `${year}년 ${month}월 ${date}일 (${daysKr[dayIdx]}요일)`,
    mealType,
    menu,
    menuString,
    calories: menu.calories,
  };
}
