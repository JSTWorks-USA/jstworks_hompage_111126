/**
 * 한국 전화번호 자동 하이픈.
 * 숫자만 입력해도 번호 종류에 맞춰 하이픈을 넣고, 자리 수를 넘는 숫자는 받지 않습니다.
 *
 * | 종류                     | 앞자리          | 자리 수 | 예                 |
 * | ------------------------ | --------------- | ------- | ------------------ |
 * | 서울                     | 02              | 9~10    | 02-123-4567, 02-1234-5678 |
 * | 평생·안심번호            | 0502~0508       | 11~12   | 0505-123-4567, 0505-1234-5678 |
 * | 휴대폰                   | 010, 011, 016~019 | 10~11 | 010-1122-1231      |
 * | 지역·인터넷전화          | 031~064, 070    | 10~11   | 031-123-4567, 070-1234-5678 |
 * | 대표번호                 | 15xx, 16xx, 18xx | 8      | 1588-1234          |
 *
 * "+" 로 시작하면 해외 번호로 보고 하이픈을 넣지 않습니다(숫자·+·-·괄호·띄어쓰기만 남김).
 */

type Rule = { head: number; min: number; max: number };

function ruleFor(digits: string): Rule {
  if (digits.startsWith("02")) return { head: 2, min: 9, max: 10 };
  if (/^050[2-8]/.test(digits)) return { head: 4, min: 11, max: 12 };
  if (/^1[568]/.test(digits)) return { head: 4, min: 8, max: 8 };
  return { head: 3, min: 10, max: 11 };
}

const isInternational = (value: string) => value.trimStart().startsWith("+");

/** 입력값을 하이픈 넣은 모양으로 바꿉니다 (입력하는 도중에도 씁니다) */
export function formatKoreanPhone(value: string): string {
  if (isInternational(value)) return value.replace(/[^0-9+\-()\s]/g, "");

  const rule = ruleFor(value.replace(/\D/g, ""));
  const digits = value.replace(/\D/g, "").slice(0, rule.max);
  const head = digits.slice(0, rule.head);
  const rest = digits.slice(rule.head);

  if (!rest) return head;
  // 대표번호(1588-1234)는 4-4 한 가지 모양
  if (rule.max === 8) return `${head}-${rest}`;
  // 가운데가 3자리인지 4자리인지는 전체 자리 수가 다 찼을 때 정해집니다
  if (rest.length <= 3) return `${head}-${rest}`;
  if (digits.length < rule.max) return `${head}-${rest.slice(0, 3)}-${rest.slice(3)}`;
  return `${head}-${rest.slice(0, 4)}-${rest.slice(4)}`;
}

/** 다 입력된 올바른 번호인지 */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (isInternational(value)) return /^[0-9+\-()\s]+$/.test(value) && digits.length >= 8 && digits.length <= 15;
  if (!/^[0-9-]+$/.test(value)) return false;
  if (!/^(0|1[568])/.test(digits)) return false;
  const rule = ruleFor(digits);
  return digits.length >= rule.min && digits.length <= rule.max;
}

/**
 * 입력 칸의 값을 하이픈 모양으로 바꾸고, 커서는 같은 숫자 뒤에 그대로 둡니다
 * (중간을 고칠 때 커서가 맨 끝으로 튀지 않게).
 */
export function applyPhoneFormat(input: HTMLInputElement) {
  const { value, selectionStart } = input;
  const formatted = formatKoreanPhone(value);
  if (formatted === value) return;

  const digitsBeforeCaret = value.slice(0, selectionStart ?? value.length).replace(/\D/g, "").length;
  input.value = formatted;

  let caret = formatted.length;
  if (digitsBeforeCaret === 0) caret = 0;
  else {
    let seen = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i]) && ++seen === digitsBeforeCaret) {
        caret = i + 1;
        break;
      }
    }
  }
  input.setSelectionRange(caret, caret);
}
