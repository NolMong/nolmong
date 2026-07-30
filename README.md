# ✈️ NolMong(놀몽)
> **실시간으로 일행과 함께 동선을 기획하고 지도 UI로 한눈에 확인하는 공동 여행 플랫폼**  
실시간 데이터 동기화 및 인터랙티브 지도 시각화에 집중하여 개발된 반응형 웹 서비스입니다.

<img width="2462" height="1327" alt="image" src="https://github.com/user-attachments/assets/b47aa5a1-af28-428f-b26f-c07d1ee29096" />

---

## 🌟 프로젝트 개요
- **서비스명**: **NolMong(놀몽)**
- **타겟**: 동반자와 함께 국내 여행 일정을 실시간으로 공동 기획하고자 하는 유저

### 🔍 배경 및 문제 상황
- 메신저와 지도 앱을 번갈아가며 계획해야하는 비효율적인 동선
- 한 명만 모든 일정 계획을 떠맡게 되는 총대 구조
- 복잡한 텍스트 중심 일정표로 인한 직관성 부족

### 🌈 핵심 가치
 - **프론트엔드 극대화**: Supabase 및 Ably를 활용한 프론트엔드 단 중심의 Next 컴포넌트 설계 및 상태 관리 최적화
 - **실시간 인터랙티브 UI/UX**: 일행 간 실시간 편집 및 Kakao Maps 루트 동선 시각화 제공

---

## 👥 팀원 소개
전 팀원이 프론트엔드와 백엔드를 담당하여 기능을 완성했습니다.
<table>
  <thead>
    <tr>
      <th width="33%" align="center">김혜진</th>
      <th width="33%" align="center">이규태</th>
      <th width="33%" align="center">이주현</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center"><img src="https://github.com/llmeajinll.png" width="100%"/></td>
      <td align="center"><img src="https://github.com/Ourumo.png" width="100%"/></td>
      <td align="center"><img src="https://github.com/hana03030.png" width="100%"/></td>
    </tr>
    <tr>
      <td align="center"><a href="https://github.com/llmeajinll">@llmeajinll</a></td>
      <td align="center"><a href="https://github.com/Ourumo">@Ourumo</a></td>
      <td align="center"><a href="https://github.com/hana03030">@hana03030</a></td>
    </tr>
    <tr>
      <td align="center">Kakao Map api 연동, react-calendar custom css</td>
      <td align="center">Kakao Map api 연동, react-calendar custom css</td>
      <td align="center">Kakao Oauth 연동, 실시간 dnd 구현, 초대하기 구현, 스켈레톤 UI</td>
    </tr>
  </tbody>
</table>

---

## 🛠️ 기술 스택
- **Frontend**: Next.js(App Router), Tailwind CSS
- **Database & Auth**: Supabase, Kakao OAuth
- **Realtime Sync**: Ably
- **Map API**: Kakao Maps API
- **State Management**: Zustand

---

## 🧩 시스템 구조
<img width="3256" height="2084" alt="image" src="https://github.com/user-attachments/assets/1c5c9b34-7581-43c7-8b07-4b93aaad8e47" />

---

## 💻 포팅 매뉴얼
로컬 개발 환경에서 프로젝트를 구동하기 위한 설치 및 실행 가이드입니다.

**1. 사전 요구사항**  
프로젝트에 사용된 `Next.js 16` 스펙 구동을 위해 아래 버전 이상을 권장합니다.

- **Node.js**: `v18.17.0` 이상 (v20.x / v22.x 권장)
- **npm**: `v9.0.0` 이상 (v10.x 권장)

**2. 저장소 클론**  
터미널을 열고 프로젝트를 다운로드한 후 해당 디렉토리로 이동합니다.
```bash
git clone https://github.com/NolMong/nolmong.git
cd NolMong
```

**3. 의존성 패키지 설치**  
프로젝트 구동에 필요한 라이브러리를 설치합니다.
```bash
npm install
```

**4. 환경 변수 설정**  
프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 아래 형식에 맞추어 본인의 API 발급 키를 입력합니다.
```bash
# Kakao Map
NEXT_PUBLIC_KAKAO_MAP_KEY=YOUR_KAKAO_MAP_KEY_HERE

# Ably
NEXT_PUBLIC_ABLY_API_KEY=YOUR_ABLY_API_KEY_HERE

# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL_HERE
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY_HERE
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
```

**5. 개발 서버 실행**  
로컬 개발 서버를 구동합니다.
```bash
npm run dev
```

---

## 🚀 핵심 기능
<table>
  <thead>
    <tr>
      <th width="50%" align="center">01. 여행 계획 생성·관리</th>
      <th width="50%" align="center">02. 위시리스트 & 일정 편집</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center">
        <img width="100%" alt="01. 여행 계획 생성·관리" src="https://github.com/user-attachments/assets/bf290451-09ac-42fd-9ed1-0f50b925656c" />
      </td>
      <td align="center">
        <img width="100%" alt="02. 위시리스트 & 일정 편집" src="https://github.com/user-attachments/assets/88dae22d-1933-4bdf-8716-99aa45ea0338" />
      </td>
    </tr>
    <tr>
      <td align="center">장소, 날짜, 예산, 인원을 입력해 계획을 만들면 캘린더에서 여행 기간이 바로 표시되고 제목은 수정이 가능합니다. 이후 여행을 그만두고 싶다면 방을 나갈 수 있습니다.</td>
      <td align="center">가고 싶은 곳을 day별로 드래그 앤 드롭을 사용해 정리하고, 지도에서 맛집·카페·관광지를 검색해 타임라인에 바로 담을 수 있습니다. 추가적인 메모와 체크리스트 남기는 것도 가능합니다.</td>
    </tr>
    <tr>
      <th align="center">03. 실시간 협업</th>
      <th align="center">04. 간편 로그인 & 초대</th>
    </tr>
    <tr>
      <td align="center">
        <img width="100%" alt="03. 실시간 협업" src="https://github.com/user-attachments/assets/95fe0823-4d06-4e74-a6df-8775920eea7d" />
      </td>
      <td align="center">
        <img width="100%" alt="04. 간편 로그인 & 초대" src="https://github.com/user-attachments/assets/e35ff504-cb5a-479c-b0bc-e8377c2db57f" />
      </td>
    </tr>
    <tr>
      <td align="center">친구들과 같은 계획을 동시에 열어 카드, 제목, 날짜를 함께 편집할 수 있습니다. 누가 접속해 있는지, 어떤 카드를 만지고 있는지 실시간으로 보여서 헷갈리지 않습니다.</td>
      <td align="center">카카오 계정으로 바로 로그인하고, 5문항 여행 성향 테스트로 나만의 카피바라 캐릭터와 테마 컬러를 받아보세요. 초대 링크로 들어온 친구도 자연스럽게 같은 계획에 합류할 수 있습니다.</td>
    </tr>
  </tbody>
</table>

---

## 🔗 웹사이트
누르시면 웹사이트로 이동하실 수 있습니다.  

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://nolmong.vercel.app/landing)
