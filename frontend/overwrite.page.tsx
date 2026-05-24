import { addPage, NamedPage } from '@hydrooj/ui-default';
import { request } from '@hydrooj/ui-default/utils/base';

interface HitokotoData {
  0: string;
  1: string;
}

function getElementByXPath(xpath: string): HTMLElement {
    return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement;
}

function createHitokotoSection(text: string, author: string): HTMLElement {
  const section = document.createElement('div');
  
  const header = document.createElement('div');
  header.className = 'section__header';
  const title = document.createElement('h1');
  title.className = 'section__title';
  title.textContent = '一言';
  header.appendChild(title);
  
  const body = document.createElement('div');
  body.className = 'section__body typo';
  
  const textPara = document.createElement('p');
  // Allow a limited set of HTML tags in the text (b, i, em, strong)
  function sanitize(unsafe: string): string {
    const tmp = document.createElement('div');
    tmp.textContent = unsafe;
    let escaped = tmp.innerHTML;
    // restore simple inline tags
    escaped = escaped.replace(/&lt;(\/?)(b|i|em|strong)&gt;/g, '<$1$2>');
    /// restore <br/> tags for line breaks
    escaped = escaped.replace(/&lt;br\/&gt;/g, '<br/>');
    escaped = escaped.replace(/\n/g, '<br/>');
    return escaped;
  }

  textPara.innerHTML = sanitize(text || '無法取得一言');
  
  const authorPara = document.createElement('p');
  authorPara.style.fontSize = 'smaller';
  authorPara.style.textAlign = 'right';
  authorPara.textContent = `－－${author || '未知來源'}`;
  
  body.appendChild(textPara);
  body.appendChild(authorPara);
  section.appendChild(header);
  section.appendChild(body);
  
  return section;
}

addPage(new NamedPage(['homepage'], async () => {
  const targetElement = getElementByXPath("//*[@id=\"panel\"]/div[3]/div/div[2]/div[1]") as HTMLElement;
  
  // 顯示加載狀態
  targetElement.replaceChildren(createHitokotoSection('無法取得一言', '未知來源'));
  
  request.get('/hitokoto').then((data : HitokotoData) => {
    targetElement.replaceChildren(createHitokotoSection(data[0], data[1]));
  });
}));