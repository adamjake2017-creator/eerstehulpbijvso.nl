/* Feedback-widget: stem + optionele opmerking -> GTM dataLayer + /feedback.php */
(function(){var w=document.getElementById('ehvFb');if(!w)return;var page=(location.pathname.replace(/^\//,'')||'index.html');
function dl(s){window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'feedback',feedback_sentiment:s,feedback_page:page});}
function post(s,txt){try{var fd=new FormData();fd.append('sentiment',s);fd.append('pagina',page);if(txt)fd.append('opmerking',txt);var hp=w.querySelector('.fb-hp');fd.append('website',hp?hp.value:'');fetch('/feedback.php',{method:'POST',body:fd}).catch(function(){});}catch(e){}}
function thanks(){w.querySelector('.fb-q').hidden=true;w.querySelector('.fb-btns').hidden=true;var m=w.querySelector('.fb-more');if(m)m.hidden=true;w.querySelector('.fb-thanks').hidden=false;}
w.querySelectorAll('.fb-btn').forEach(function(b){b.addEventListener('click',function(){var v=b.getAttribute('data-v');dl(v);if(v==='ja'){post('ja','');thanks();}else{w.querySelector('.fb-btns').hidden=true;w.querySelector('.fb-q').textContent='Wat kunnen we beter doen?';w.querySelector('.fb-more').hidden=false;var t=w.querySelector('.fb-txt');if(t)t.focus();}});});
var sb=w.querySelector('.fb-send');if(sb)sb.addEventListener('click',function(){var t=w.querySelector('.fb-txt');post('nee',t?t.value.trim():'');thanks();});})();
