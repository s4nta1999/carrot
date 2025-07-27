// AI 작성 기능 유틸리티

interface AiProductData {
  title: string;
  description: string;
  category?: string;
  condition?: string;
  price?: number;
}

// 간단한 AI 제목 생성 (실제로는 OpenAI API 등을 사용)
export const generateProductTitle = (description: string, category?: string): string => {
  const keywords = description.toLowerCase().split(' ');
  const commonWords = ['좋은', '깨끗한', '새로운', '사용한', '좋은', '훌륭한'];
  
  // 카테고리별 접두사
  const categoryPrefixes: { [key: string]: string } = {
    '전자기기': '📱',
    '의류': '👕',
    '가구': '🪑',
    '도서': '📚',
    '스포츠': '⚽',
    '뷰티': '💄',
    '식품': '🍎',
    '기타': '📦'
  };

  const prefix = category ? categoryPrefixes[category] || '📦' : '📦';
  const randomWord = commonWords[Math.floor(Math.random() * commonWords.length)];
  
  // 설명에서 주요 키워드 추출
  const mainKeyword = keywords.find(word => 
    word.length > 2 && !['이', '가', '을', '를', '의', '에', '로', '와', '과'].includes(word)
  ) || '상품';

  return `${prefix} ${randomWord} ${mainKeyword}`;
};

// AI 설명 생성
export const generateProductDescription = (
  title: string, 
  _category?: string, 
  condition?: string,
  price?: number
): string => {
  const conditions = {
    '새상품': '새상품입니다. 포장도 깨끗하게 보관되어 있습니다.',
    '거의새상품': '거의 새상품 수준입니다. 아주 깔끔하게 보관했습니다.',
    '좋음': '상태가 좋습니다. 정상적으로 사용 가능합니다.',
    '보통': '일반적인 사용감이 있습니다. 기능상 문제없습니다.',
    '사용감있음': '사용감이 있지만 기능상 문제없습니다.'
  };

  const conditionText = condition ? conditions[condition as keyof typeof conditions] || '' : '';
  const priceText = price ? `\n\n💰 가격: ${price.toLocaleString()}원` : '';
  
  const baseDescription = `안녕하세요! ${title} 판매합니다.

${conditionText}

📋 상품 정보:
• 상태: ${condition || '보통'}
• 거래방법: 직거래 선호
• 위치: 설정된 지역

💬 문의사항 있으시면 언제든 연락주세요!
감사합니다.${priceText}`;

  return baseDescription;
};

// AI 카테고리 추천
export const suggestCategory = (description: string): string => {
  const keywords = description.toLowerCase();
  
  if (keywords.includes('폰') || keywords.includes('전화') || keywords.includes('컴퓨터') || keywords.includes('노트북')) {
    return '전자기기';
  } else if (keywords.includes('옷') || keywords.includes('신발') || keywords.includes('가방')) {
    return '의류';
  } else if (keywords.includes('책') || keywords.includes('교재') || keywords.includes('소설')) {
    return '도서';
  } else if (keywords.includes('의자') || keywords.includes('테이블') || keywords.includes('침대')) {
    return '가구';
  } else if (keywords.includes('공') || keywords.includes('운동') || keywords.includes('헬스')) {
    return '스포츠';
  } else if (keywords.includes('화장품') || keywords.includes('향수') || keywords.includes('마스크')) {
    return '뷰티';
  } else if (keywords.includes('음식') || keywords.includes('과일') || keywords.includes('채소')) {
    return '식품';
  }
  
  return '기타';
};

// AI 상태 추천
export const suggestCondition = (description: string): string => {
  const keywords = description.toLowerCase();
  
  if (keywords.includes('새상품') || keywords.includes('미개봉') || keywords.includes('포장')) {
    return '새상품';
  } else if (keywords.includes('거의새') || keywords.includes('깨끗')) {
    return '거의새상품';
  } else if (keywords.includes('좋음') || keywords.includes('양호')) {
    return '좋음';
  } else if (keywords.includes('사용감') || keywords.includes('오래')) {
    return '사용감있음';
  }
  
  return '보통';
};

// 통합 AI 작성 기능
export const generateAiProduct = (
  userInput: string,
  price?: number
): AiProductData => {
  const category = suggestCategory(userInput);
  const condition = suggestCondition(userInput);
  const title = generateProductTitle(userInput, category);
  const description = generateProductDescription(title, category, condition, price);

  return {
    title,
    description,
    category,
    condition,
    ...(price !== undefined && { price })
  };
}; 