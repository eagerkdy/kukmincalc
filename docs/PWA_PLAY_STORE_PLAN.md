# PWA + Play Store Plan — Kukmincalc

> **Phase 5 기획서 (2026-05-18)**
> 웹사이트 → PWA(설치형) → Play Store(TWA) → 앱 알림(시즌 푸시)까지의 단계적 앱화 로드맵.
> 본 문서는 코드 명세가 아니라 **구현 순서/위험/평가 합의서**.
> 상위 로드맵: [`docs/PRODUCT_ROADMAP_APP_EXPANSION.md`](PRODUCT_ROADMAP_APP_EXPANSION.md)

---

## 0. 왜 앱인가 (Bezos · Disney)

### 0-1. 앱이 필요한 이유
| 이유 | 비고 |
|---|---|
| 재방문 | 시즌 알림 (1월 자동차세 / 5월 종소세 / 11월 근로장려금) — 웹은 사용자가 다시 찾아오기 어려움 |
| 락인 | 홈 화면 아이콘 1개로 진입 마찰 0 |
| 신뢰 자산 | Play Store 출시 자체가 정부24/홈택스 옆에 놓이는 효과 |
| 모바일 점유율 | 한국 사용자 80%+ 모바일 |

### 0-2. 앱이지만 하지 않는 것 (Sun Tzu)
- 정부 사이트 대체 X
- 본인 인증 / 계정 / 서버 저장 X (localStorage 그대로)
- 푸시는 시즌 알림만 (마케팅 푸시 금지)
- 푸시 권한 요구는 사용자 명시 동의 후

---

## 1. 단계 (의존성 순)

```
Phase 5A — PWA (manifest + Service Worker + 설치 유도)
   ↓
Phase 5B — TWA (Bubblewrap → Play Store 등록)
   ↓
Phase 5C — 알림 (Web Push, 시즌 트리거만)
```

각 단계는 **이전 단계 완료 + 측정 검증** 후 진행. 한 번에 다 만들지 않음 (Darwin).

---

## 2. Phase 5A — PWA

### 2-1. 산출물
| 파일 | 내용 |
|---|---|
| `manifest.json` (루트) | name, short_name, start_url, display=standalone, theme_color, background_color, icons |
| `assets/icons/icon-192.png` | 192×192 |
| `assets/icons/icon-512.png` | 512×512 |
| `assets/icons/icon-maskable-512.png` | maskable 안전 영역 적용 |
| `assets/icons/apple-touch-icon.png` | 180×180 (iOS 호환) |
| `assets/js/sw.js` | Service Worker — 캐시 전략 |
| `assets/js/pwa-install.js` | beforeinstallprompt 핸들러 + 설치 유도 배너 (1회) |
| `index.html` `<head>` | `<link rel="manifest">` + meta apple 호환 태그 |

### 2-2. Service Worker 캐시 전략

| 자원 | 전략 | 이유 |
|---|---|---|
| HTML | network-first, fallback cache | 콘텐츠 신선도 우선 (요율 변경/가이드 추가) |
| CSS / JS / 폰트 / 아이콘 | stale-while-revalidate | 빠른 진입 + 백그라운드 업데이트 |
| AdSense `pagead2.googlesyndication.com` | **캐시 안 함 — pass-through** | 광고 정책 위반 위험 |
| GA4 `googletagmanager.com` / `analytics.google.com` | **캐시 안 함 — pass-through** | 측정 데이터 신선도 |
| 외부 공식 사이트 링크 | (해당 없음 — target=_blank로 OS 브라우저 이동) | — |

**오프라인 fallback:** `/offline.html` 한 페이지만 캐시. "인터넷에 연결되지 않았습니다. 다시 연결되면 새로고침하세요" + 홈 링크.

### 2-3. 설치 유도 (Ogilvy)

`beforeinstallprompt` 발생 시:
- 즉시 prompt 호출 금지 (브라우저 정책 위반 + 사용자 거부감)
- 첫 계산 완료 후 또는 첫 2 페이지뷰 이후 노출
- 문구: "국민계산기를 홈 화면에 추가하면 1초 만에 다시 열 수 있어요" + [추가하기] / [다음에]
- 거부 시 30일간 재노출 금지 (localStorage 가드)

### 2-4. 광고/측정 가드 (Buffett · 무손상)
- AdSense `pagead2.googlesyndication.com`은 Service Worker 캐시 제외 (`fetch` 이벤트 분기)
- GA4 `googletagmanager.com` / `google-analytics.com` / `analytics.google.com` 캐시 제외
- 모든 fetch 핸들러 try-catch — Service Worker 오류로 광고 차단 X

### 2-5. GA4 이벤트
| event | 트리거 | 파라미터 |
|---|---|---|
| `pwa_install_prompted` | 설치 배너 노출 | `prompt_source` (auto / cta) |
| `pwa_install_accepted` | 사용자 [추가하기] 선택 | — |
| `pwa_install_dismissed` | [다음에] 또는 X | — |
| `pwa_installed` | `appinstalled` 이벤트 발생 | — |
| `pwa_launched` | `display-mode: standalone`으로 첫 진입 | — |

### 2-6. Phase 5A 완료 정의 (Definition of Done)
- [ ] 모바일 Chrome 메뉴 "홈 화면에 추가" 정상
- [ ] 설치 후 홈 화면 아이콘 → 전체화면 standalone 동작
- [ ] 오프라인 시 `/offline.html` 노출
- [ ] AdSense / GA4 정상 동작 (SW 차단 없음)
- [ ] Lighthouse PWA 점수 90+
- [ ] `manifest.json` validator 통과
- [ ] iOS Safari "홈 화면에 추가" 동작 확인 (1차 호환 한도)

### 2-7. 위험과 대응
| 위험 | 대응 |
|---|---|
| Service Worker 오류로 페이지 자체가 안 뜸 | 모든 fetch 핸들러 try-catch + 5초 timeout fallback |
| Service Worker가 옛 HTML 캐시 → 신요율 미반영 | network-first + 강제 새로고침 단축키 안내 |
| AdSense Auto Ads 차단 | SW에서 `pagead2.googlesyndication.com` 패턴 명시 pass-through |
| GA4 측정 차단 | 동일하게 pass-through |

---

## 3. Phase 5B — Play Store (TWA)

### 3-1. 산출물
| 파일 | 내용 |
|---|---|
| `.well-known/assetlinks.json` (사이트 루트 배포) | TWA ↔ 도메인 신뢰 링크 (Digital Asset Links) |
| Play Console 등록 | 카테고리: Finance |
| 앱 패키지 (TWA APK/AAB) | Bubblewrap CLI 빌드 |
| 앱 아이콘 (스토어 등재용) | 512×512 (별도) + Feature Graphic 1024×500 |
| 스토어 메타 (한국어) | 제목, 짧은 설명, 자세한 설명, 스크린샷 5~8장 |

### 3-2. 앱 메타 후보 (Ogilvy)

**제목 후보 (50자 이내):**
- 국민계산기 — 월급·세금·지원금 알림
- 국민계산기 — 실수령액·4대보험·세금 계산
- 국민계산기 — 내 돈 계산과 정책 알림

**짧은 설명 (80자):**
> 연봉 실수령액·4대보험·프리랜서 세금·주휴수당·퇴직금·지원금까지 한 번에.

**자세한 설명 (4000자, 핵심 골격):**
```
"내가 받는 월급, 정확히 얼마인가요?"

국민계산기는 직장인·알바·프리랜서·사업주가
월급·세금·4대보험·지원금까지 1분 만에 확인할 수 있는
공식 기준 기반 생활금융 도구입니다.

[ 무엇을 계산하나요 ]
- 연봉 실수령액
- 4대보험료
- 주휴수당
- 퇴직금
- 프리랜서 3.3% / 기타소득 8.8%
- 종합소득세·부가세
- 자동차세·재산세·취득세
- 주담대 한도·DSR
... 외 30개+

[ 어떤 도움을 받나요 ]
- 2026년 최신 기준값 자동 적용
- 보건복지부·국세청·고용노동부 등 공식 출처 명시
- 입력값에 따라 변동되는 참고용 계산
- 최근 계산 자동 저장
- 공식 사이트 바로가기 (홈택스·정부24·보조금24 등)

[ 신뢰 ]
- 본인 인증 없음
- 개인정보 수집 없음
- 입력값은 기기 안에서만 처리

[ 안내 ]
- 본 앱은 정부 공식 앱이 아닌 민간 계산 도구입니다.
- 실제 신청/조회는 홈택스·정부24·해당 공단의 공식 사이트에서 진행하세요.
```

**금지 표현 (스토어 메타에도 그대로 적용):**
- 정부 공식 앱 / 정부 제휴 / 공식 파트너 → 절대 사용 금지
- 100% 환급 / 무조건 받음 / 확정 지원금 → 금지

### 3-3. Play Console 카테고리 / 정책
- **카테고리:** Finance
- **데이터 보안 섹션:** "수집되는 데이터 없음" + "공유되는 데이터 없음" 선택 가능 (서버 미수집 + localStorage만)
- **광고 포함:** Yes (AdSense)
- **대상 연령:** 만 14세 이상 (개인정보처리방침 §8과 일치)
- **콘텐츠 등급:** 일반 (재정·세금 계산 도구)

### 3-4. 정책 통과 체크리스트 (Google Play Store 한국 시장)
- [ ] 개인정보처리방침 URL 제공 → `https://kukmincalc.com/legal/privacy.html`
- [ ] 데이터 보안 섹션 입력 일치 (수집 없음 → privacy §1과 일치)
- [ ] 금융 카테고리 정책: "본 앱은 공식 금융기관이 아님" 명시
- [ ] 광고 표시: AdSense 자체 정책 준수 (`ads.txt` 그대로)
- [ ] 권한 최소화: 인터넷 권한만 (위치/연락처/카메라 등 X)
- [ ] 아이콘에 한국 정부 엠블럼 / 공식기관 로고 사용 금지

### 3-5. GA4 이벤트
| event | 트리거 |
|---|---|
| `app_opened_from_store` | TWA 진입 식별 (referrer가 android-app:// 등) |
| `app_install_referrer` | Play Install Referrer (출시 후 검토) |

### 3-6. Phase 5B 완료 정의
- [ ] Play Console에서 internal test track 통과
- [ ] Closed test → Open test → Production 단계별 출시
- [ ] 디지털 자산 링크 검증 (TWA가 주소창 노출 없이 standalone 동작)
- [ ] AdSense 정상 노출 + 정책 위반 없음
- [ ] GA4에서 app_opened_from_store 이벤트 도달
- [ ] 첫 30일 정책 위반 0건

### 3-7. 위험과 대응
| 위험 | 대응 |
|---|---|
| Play 정책 위반 (오해 소지 표현) | 메타·스크린샷·아이콘에서 "정부 공식" 금지 표현 사전 제거 |
| AdSense 정책 위반 (앱 내 광고 가이드) | AdSense Auto Ads 그대로 (별도 모바일 앱 광고 SDK 도입 X) |
| TWA에서 GA4 측정 ID 누락 | TWA는 PWA 그대로 렌더 → 동일 GA4 ID 작동 (별도 작업 없음) |
| 정부24/홈택스 상표권 침해 | 메타에 외부 기관명 사용 금지, "공식 사이트로 이동" 표현만 |

---

## 4. Phase 5C — 앱 알림 (Web Push)

### 4-1. 알림 정책 (Buffett · Sun Tzu)

**보낼 것:**
- 1월 자동차세 연납 시즌
- 2월 연말정산 시즌
- 5월 종합소득세 시즌
- 7월 국민연금 기준소득월액 변경
- 11월 근로장려금 신청 시즌
- 12월 연말정산 준비

**절대 보내지 않을 것:**
- 마케팅 메시지
- "당신은 환급금이 있습니다" 같은 단정 추정
- 광고성 푸시
- 일 1회 초과 빈도

### 4-2. 권한 요구 흐름 (Ogilvy)
1. 사용자가 시즌 알림 페이지를 명시적으로 방문했을 때만 권한 요청
2. 권한 요청 전 미리보기:
   ```
   매년 1월·5월·7월 등 시즌마다
   확인할 돈을 1년에 5~6회 알려드릴게요.
   광고성 알림은 보내지 않습니다.
   ```
3. [받기] / [지금은 안 함]
4. 거부 시 30일간 재요청 금지

### 4-3. 산출물
| 파일 | 내용 |
|---|---|
| `assets/js/push-subscribe.js` | 권한 요청 + 구독 토큰 발급 |
| 백엔드 (신규 결정 필요) | Web Push VAPID 키 + 구독 저장소 |
| `/notifications/` 페이지 | 알림 설정 UI |

**백엔드 결정 포인트 — Phase 5C 직전 별도 합의 필요:**
- Option A: 서버리스 (Vercel Edge + Upstash Redis로 구독 토큰 저장)
- Option B: 정적 사이트 유지 + 외부 push 서비스 (OneSignal 등) — 단 개인정보 노출 위험 검토
- Option C: 푸시 없이 "이번 달 확인할 돈" 웹 섹션만 (Phase 4C와 통합)

권장: **Phase 5C는 Option C로 시작**, 데이터 보고 A 도입 결정.

### 4-4. GA4 이벤트
| event | 트리거 |
|---|---|
| `push_permission_requested` | 권한 prompt 노출 |
| `push_permission_granted` | 허용 |
| `push_permission_denied` | 거부 |
| `push_notification_received` | (Service Worker에서 자체 수집 어려움 — 클릭 시점에 dedupe) |
| `push_notification_clicked` | 알림 클릭으로 진입 |

### 4-5. 위험과 대응
| 위험 | 대응 |
|---|---|
| 사용자 푸시 거부감 | 명시 동의 + 빈도 5~6회/년 + 권한 요청 위치 제한 |
| 푸시 자체로 정부 공식 알림인 듯 오해 | 알림 본문에 "국민계산기 — 시즌 안내" 발신자 명시 + "공식 신청은 해당 기관" 안내 |
| 백엔드 운영 비용 | Option C(웹 only) 우선 |

---

## 5. 측정 계획 종합 (Drucker)

Phase 5 신규 이벤트를 `docs/ANALYTICS_EVENT_PLAN.md`에 추가 (Phase 5A 구현 시점에 PR로 함께):

```
[5A]
pwa_install_prompted / pwa_install_accepted / pwa_install_dismissed
pwa_installed / pwa_launched

[5B]
app_opened_from_store / app_install_referrer

[5C]
push_permission_requested / push_permission_granted / push_permission_denied
push_notification_clicked
```

PII / 원문금액 가드는 Phase 3-5B 그대로 적용. KCAnalytics 단일 게이트웨이 통과.

---

## 6. 단계별 신호등 (D+30 / D+60 평가 기준)

### Phase 5A 진입 조건 (D+30 시점, 2026-06-15)
- ✅ GA4 모바일 점유율 70%↑
- ✅ 가이드/계산기 평균 체류 30s↑
- ✅ 재방문률 10%↑ (재방문 가치 있음 시그널)
- ❌ Search Console 색인 < 50% → Phase 5A 보류, SEO 개선 우선

### Phase 5B 진입 조건 (D+60 시점, 2026-07-15)
- ✅ Phase 5A PWA 설치율 사용자 1%↑
- ✅ PWA 재방문률 30%↑ (웹 대비)
- ✅ Lighthouse PWA 점수 90+ 안정 유지

### Phase 5C 진입 조건 (Play Store 출시 1개월 후)
- ✅ TWA 활성 사용자 일 100명↑
- ✅ 시즌 페이지 (Phase 4C) 트래픽 증가
- ❌ AdSense RPM 하락 → 푸시 보류 (사용자 이탈 위험)

---

## 7. 본 PR 범위

문서만. 코드 변경 0.
- `docs/PRODUCT_ROADMAP_APP_EXPANSION.md`
- `docs/POLICY_BENEFIT_HUB_PLAN.md`
- `docs/PWA_PLAY_STORE_PLAN.md` (본 파일)

Phase 5 실제 구현은 D+30~60 데이터 보고 분리 PR로 진행.

---

## 8. 한 줄 결론

> **PWA는 재방문을 만들고, Play Store는 신뢰 자산을 만들고, 푸시는 시즌을 만든다.**
> 세 단계 모두 GA4 데이터가 진입 조건을 충족할 때만 시작한다 (Drucker · Darwin).
