/**
 * 화면을 그리기 전에(html <head> 안에서) 고른 언어를 <html> 에 표시하는 짧은 스크립트.
 * 한국어·영어 문구는 둘 다 HTML 에 들어 있고 CSS 가 html[data-lang] 에 맞춰 하나만 보여 주므로,
 * 영어를 고른 사람이 새로고침해도 한국어가 잠깐 보였다가 바뀌지 않습니다.
 *
 * "use client" 파일에서 문자열을 내보내면 서버 레이아웃에서 값으로 읽을 수 없어 따로 둡니다.
 */
export const LANG_STORAGE_KEY = "jstworks-lang";

export const LANG_INIT_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(
  LANG_STORAGE_KEY,
)})==="EN"){var d=document.documentElement;d.setAttribute("data-lang","EN");d.lang="en"}}catch(e){}`;
