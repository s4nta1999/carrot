const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// UUID 생성 함수
function generateUUID() {
  return uuidv4();
}

// 기존 데이터들 (동일)
const hapjeongLocations = [
  { name: '합정동', lat: 37.548700, lng: 126.913500 },
  { name: '망원동', lat: 37.556300, lng: 126.910400 },
  { name: '연남동', lat: 37.563800, lng: 126.925900 },
  { name: '상암동', lat: 37.578600, lng: 126.889700 },
  { name: '서교동', lat: 37.555100, lng: 126.922500 }
];

const names = [
  "김민수", "이지은", "박철호", "정수빈", "최영희", "장동건", "윤서연", "임태호",
  "배현주", "송지훈", "한소희", "오승우", "신예진", "홍길동", "강하늘", "문채원"
];

const productCategories = {
  '전자기기': ['아이폰 14 Pro', '갤럭시 S23', '맥북 프로', '아이패드', 'AirPods', '삼성 노트북'],
  '냉방기기': ['LG 에어컨', '삼성 선풍기', '다이슨 선풍기', '이동식 에어컨', '천장형 선풍기'],
  '생활용품': ['공기청정기', '가습기', '청소기', '전자레인지', '토스터', '전기밥솥'],
  '패션/뷰티': ['나이키 운동화', '아디다스 후드', '샤넬 가방', '화장품 세트', '선글라스'],
  '도서/문구': ['프로그래밍 책', '만화책 세트', '노트북', '펜 세트', '달력'],
  '운동/스포츠': ['요가매트', '덤벨', '런닝머신', '축구공', '농구공', '테니스 라켓']
};

const descriptions = [
  "깨끗하게 사용했습니다. 직거래 선호해요!",
  "이사가면서 급하게 처분해요. 네고 가능합니다.",
  "거의 새것 같아요. 한 번만 사용했습니다.",
  "선물받았는데 쓸일이 없어서 팝니다.",
  "상태 정말 좋아요. 사진 더 필요하시면 연락주세요.",
  "포장도 안 뜯었어요. 정가보다 훨씬 저렴하게!",
  "택배 가능하고 직거래도 가능합니다.",
  "집 앞까지 가져다드릴 수 있어요.",
  "애기가 커서 더 이상 사용 안해요.",
  "집에 똑같은게 생겨서 하나 처분해요."
];

const priceRanges = {
  '전자기기': [50000, 2000000],
  '냉방기기': [30000, 800000],
  '생활용품': [10000, 300000],
  '패션/뷰티': [5000, 200000],
  '도서/문구': [2000, 50000],
  '운동/스포츠': [15000, 500000]
};

// 유틸리티 함수들
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomPrice(category) {
  const [min, max] = priceRanges[category];
  const price = Math.floor(Math.random() * (max - min + 1)) + min;
  return Math.floor(price / 1000) * 1000;
}

function getRandomDate(daysAgo = 30) {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysAgo);
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  
  return new Date(now.getTime() - (randomDays * 24 * 60 * 60 * 1000) - (randomHours * 60 * 60 * 1000) - (randomMinutes * 60 * 1000));
}

function addLocationVariation(lat, lng) {
  const latVariation = (Math.random() - 0.5) * 0.01;
  const lngVariation = (Math.random() - 0.5) * 0.01;
  return {
    lat: parseFloat((lat + latVariation).toFixed(6)),
    lng: parseFloat((lng + lngVariation).toFixed(6))
  };
}

// CSV 변환 함수
function arrayToCSV(data, headers) {
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(','))
  ].join('\n');
  return csvContent;
}

// 1. Users CSV 생성 (UUID 포함)
function generateUsersCSV() {
  const users = [];
  
  for (let i = 0; i < 50; i++) {
    const location = getRandomItem(hapjeongLocations);
    const position = addLocationVariation(location.lat, location.lng);
    const userId = generateUUID(); // 실제 UUID 생성
    
    users.push({
      id: userId, // 🔑 UUID 추가!
      email: `user${i + 1}@example.com`,
      name: getRandomItem(names),
      phone: `010-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      location_name: location.name,
      latitude: position.lat,
      longitude: position.lng,
      temperature: parseFloat((35.0 + Math.random() * 5.0).toFixed(1)),
      created_at: getRandomDate(60).toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  const headers = ['id', 'email', 'name', 'phone', 'location_name', 'latitude', 'longitude', 'temperature', 'created_at', 'updated_at'];
  return { csv: arrayToCSV(users, headers), data: users };
}

// 2. Products CSV 생성 (실제 user_id 사용)
function generateProductsCSV(users) {
  const products = [];
  const categories = Object.keys(productCategories);
  
  for (let i = 0; i < 100; i++) {
    const user = getRandomItem(users);
    const category = getRandomItem(categories);
    const title = getRandomItem(productCategories[category]);
    const isShare = Math.random() < 0.15;
    const productId = generateUUID(); // 실제 UUID 생성
    
    const position = addLocationVariation(user.latitude, user.longitude);
    
    const imageCount = Math.random() < 0.3 ? (Math.random() < 0.5 ? 2 : 3) : 1;
    const imageUrls = [];
    for (let j = 0; j < imageCount; j++) {
      imageUrls.push(`https://picsum.photos/400/300?random=${i * 10 + j + 1}`);
    }
    
    products.push({
      id: productId, // 🔑 UUID 추가!
      user_id: user.id, // 🔗 실제 user UUID 사용!
      title: title,
      description: getRandomItem(descriptions),
      price: isShare ? 0 : getRandomPrice(category),
      category: category,
      status: getRandomItem(['active', 'active', 'active', 'sold', 'reserved']),
      location_name: user.location_name,
      latitude: position.lat,
      longitude: position.lng,
      image_urls: JSON.stringify(imageUrls),
      view_count: Math.floor(Math.random() * 200),
      like_count: Math.floor(Math.random() * 30),
      comment_count: Math.floor(Math.random() * 15),
      created_at: getRandomDate(14).toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  const headers = ['id', 'user_id', 'title', 'description', 'price', 'category', 'status', 'location_name', 'latitude', 'longitude', 'image_urls', 'view_count', 'like_count', 'comment_count', 'created_at', 'updated_at'];
  return { csv: arrayToCSV(products, headers), data: products };
}

// 3. Comments CSV 생성 (실제 UUID들 사용)
function generateCommentsCSV(products, users) {
  const comments = [];
  const commentTexts = [
    '상태가 어떤가요?', '네고 가능한가요?', '언제까지 거래 가능하세요?',
    '직거래 가능한 곳이 어디인가요?', '아직 있나요?', '택배 가능한가요?',
    '더 자세한 사진 볼 수 있을까요?', '사용 기간이 얼마나 되나요?',
    '다른 색상도 있나요?', '가격 조금 깎아주실 수 있나요?'
  ];
  
  products.forEach((product) => {
    const commentCount = Math.floor(Math.random() * 6);
    
    for (let i = 0; i < commentCount; i++) {
      const user = getRandomItem(users);
      const commentId = generateUUID();
      
      comments.push({
        id: commentId, // 🔑 UUID 추가!
        product_id: product.id, // 🔗 실제 product UUID 사용!
        user_id: user.id, // 🔗 실제 user UUID 사용!
        content: getRandomItem(commentTexts),
        created_at: new Date(
          new Date(product.created_at).getTime() + 
          Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString()
      });
    }
  });
  
  const headers = ['id', 'product_id', 'user_id', 'content', 'created_at'];
  return { csv: arrayToCSV(comments, headers), data: comments };
}

// 4. Likes CSV 생성 (실제 UUID들 사용, UNIQUE 제약조건 고려)
function generateLikesCSV(products, users) {
  const likes = [];
  const likeSet = new Set(); // 중복 방지용 (product_id + user_id)
  
  products.forEach((product) => {
    // 상품별로 랜덤한 좋아요 수 (0~20개, 현실적인 분포)
    const likeCount = Math.floor(Math.random() * 21); // 0~20개
    const productCreatedAt = new Date(product.created_at);
    
    // 해당 상품에 좋아요를 누를 사용자들 랜덤 선택
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
    let addedLikes = 0;
    
    for (const user of shuffledUsers) {
      if (addedLikes >= likeCount) break;
      
      // 중복 좋아요 방지 (UNIQUE 제약조건)
      const likeKey = `${product.id}_${user.id}`;
      if (likeSet.has(likeKey)) continue;
      
      // 본인 상품은 좋아요 안함 (현실적)
      if (product.user_id === user.id) continue;
      
      likeSet.add(likeKey);
      const likeId = generateUUID();
      
      // 좋아요 날짜는 상품 생성일 이후 랜덤
      const maxDaysAfter = Math.min(7, Math.floor((new Date() - productCreatedAt) / (24 * 60 * 60 * 1000)));
      const likeDateOffset = Math.random() * maxDaysAfter * 24 * 60 * 60 * 1000;
      
      likes.push({
        id: likeId, // 🔑 UUID 추가!
        product_id: product.id, // 🔗 실제 product UUID 사용!
        user_id: user.id, // 🔗 실제 user UUID 사용!
        created_at: new Date(productCreatedAt.getTime() + likeDateOffset).toISOString()
      });
      
      addedLikes++;
    }
  });
  
  const headers = ['id', 'product_id', 'user_id', 'created_at'];
  return { csv: arrayToCSV(likes, headers), data: likes };
}

// CSV 파일들 생성
console.log('🔄 UUID 기반 CSV 파일 생성 중...\n');

const usersResult = generateUsersCSV();
const productsResult = generateProductsCSV(usersResult.data);
const commentsResult = generateCommentsCSV(productsResult.data, usersResult.data);
const likesResult = generateLikesCSV(productsResult.data, usersResult.data);

// 파일 저장
fs.writeFileSync('users-uuid.csv', usersResult.csv);
fs.writeFileSync('products-uuid.csv', productsResult.csv);
fs.writeFileSync('comments-uuid.csv', commentsResult.csv);
fs.writeFileSync('likes-uuid.csv', likesResult.csv);

// Import 가이드 생성
const importGuide = `# 🚀 Supabase UUID 기반 CSV Import 가이드

## ✅ 올바른 Import 순서 (매우 중요!)

### 1️⃣ users-uuid.csv 먼저 import
- Table Editor → users → Insert → Import CSV
- 매핑: id→id, email→email, name→name 등
- ✅ 성공하면 50개 사용자 생성

### 2️⃣ products-uuid.csv import  
- Table Editor → products → Insert → Import CSV
- 매핑: id→id, user_id→user_id, title→title 등
- ✅ FK 관계 자동 설정됨!

### 3️⃣ comments-uuid.csv import
- Table Editor → comments → Insert → Import CSV  
- 매핑: id→id, product_id→product_id, user_id→user_id 등
- ✅ FK 관계 자동 설정됨!

### 4️⃣ likes-uuid.csv import
- Table Editor → likes → Insert → Import CSV
- 매핑: id→id, product_id→product_id, user_id→user_id 등
- ✅ UNIQUE 제약조건 (product_id, user_id) 포함!

## 📊 생성된 데이터
- 👥 사용자: ${usersResult.data.length}명 (합정동 근처)
- 📦 상품: ${productsResult.data.length}개 (다양한 카테고리)
- 💬 댓글: ${commentsResult.data.length}개 (자연스러운 대화)
- ❤️ 좋아요: ${likesResult.data.length}개 (현실적인 분포)

## 🔑 UUID 기반 FK 관계
- users.id ← products.user_id
- products.id ← comments.product_id  
- users.id ← comments.user_id
- products.id ← likes.product_id
- users.id ← likes.user_id

## 🚨 중요한 제약조건
- **likes 테이블**: UNIQUE(product_id, user_id) - 중복 좋아요 방지
- **현실적 데이터**: 본인 상품 좋아요 안함, 상품 생성일 이후 좋아요

이제 FK 매핑 작업 없이 바로 import 가능합니다! 🎉
`;

fs.writeFileSync('uuid-import-guide.md', importGuide);

console.log('✅ UUID 기반 CSV 파일 생성 완료!');
console.log('📁 생성된 파일:');
console.log('   - users-uuid.csv');
console.log('   - products-uuid.csv'); 
console.log('   - comments-uuid.csv');
console.log('   - likes-uuid.csv ❤️ (NEW!)');
console.log('   - uuid-import-guide.md');
console.log('\n🎯 이제 FK 변환 작업 없이 순서대로 import하면 됩니다!');
console.log(`📊 총 ${likesResult.data.length}개의 좋아요 데이터 생성 (중복 방지 적용)`); 