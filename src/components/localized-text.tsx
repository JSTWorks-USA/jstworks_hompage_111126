import { keepWords } from "@/lib/i18n";

/**
 * 한국어·영문 문구를 같은 자리에 겹쳐 두고 지금 언어만 보여 줍니다.
 * 자리는 늘 두 문구 중 더 긴 쪽 크기로 잡히므로, KO/EN 을 바꿔도 둘레 영역(푸터 등)의 크기가 변하지 않습니다.
 * 언어는 <html data-lang> 을 CSS(en: 변형)로 읽으므로 새로고침해도 깜빡이지 않습니다.
 * 안 보이는 쪽은 visibility:hidden 이라 화면 낭독기도 읽지 않습니다.
 */
export function StableLocalizedText({ ko, en }: { ko: string; en: string }) {
  return (
    <span className="grid">
      <span className="col-start-1 row-start-1 en:invisible">{ko}</span>
      <span lang="en" className="invisible col-start-1 row-start-1 en:visible">
        {keepWords(en)}
      </span>
    </span>
  );
}
