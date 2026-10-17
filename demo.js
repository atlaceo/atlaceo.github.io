'use strict';
const demo = document.body.dataset.demo;
const dateLabel = value => new Intl.DateTimeFormat('ru-RU', {day:'numeric',month:'long'}).format(new Date(value+'T12:00:00'));
const today = new Date();
const localDate = [today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
const bookings = [];
function showView(view) {
  document.querySelectorAll('.app-view').forEach(section => { section.hidden = section.id !== 'app-'+view; });
  document.querySelectorAll('[data-view]').forEach(button => { const active = button.dataset.view === view; button.classList.toggle('active',active); button.setAttribute('aria-pressed',String(active)); });
}
function renderBookings() {
  const list = document.querySelector('#app-records');
  if (!list) return;
  list.replaceChildren();
  if (!bookings.length) { const p=document.createElement('p');p.className='app-muted';p.textContent='Пока нет записей. Выберите занятие в разделе «Запись».';list.append(p); }
  bookings.forEach(item => { const card=document.createElement('article');card.className='app-card';const title=document.createElement('h3');title.textContent=item.service;const detail=document.createElement('p');detail.textContent=dateLabel(item.date)+' · '+item.time+' · '+item.name;card.append(title,detail);list.append(card); });
  document.querySelector('#clear-bookings').hidden=!bookings.length;
}
document.querySelectorAll('input[type="date"]').forEach(input => {input.min=localDate;input.value=localDate;});
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click',()=>showView(button.dataset.view)));
document.querySelectorAll('[data-app-service]').forEach(button => button.addEventListener('click',()=>{document.querySelector('[name="service"]').value=button.dataset.appService;showView('book');document.querySelector('#app-book h1').scrollIntoView({block:'start'});}));
document.querySelectorAll('[data-select-service]').forEach(button=>button.addEventListener('click',()=>{document.querySelector('[name="service"]').value=button.dataset.selectService;document.querySelector('#booking').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}));
document.querySelectorAll('[data-booking]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();const data=Object.fromEntries(new FormData(form));const nameInput=form.querySelector('[name="name"]');if(!data.name.trim()){nameInput.setCustomValidity('Укажите имя');nameInput.reportValidity();return;}if(data.date<localDate){form.querySelector('[name="date"]').reportValidity();return;}nameInput.setCustomValidity('');data.name=data.name.trim();const result=form.parentElement.querySelector('.result');result.textContent=data.name+', демозапись готова: '+data.service.toLowerCase()+', '+dateLabel(data.date)+' в '+data.time+'. Это демонстрация — реальная запись не создана.';if(demo==='miniapp'){bookings.push(data);renderBookings();}form.querySelector('[type="submit"]').textContent='Добавить ещё одну демозапись ↗';}));
document.querySelectorAll('[name="name"]').forEach(input=>input.addEventListener('input',()=>input.setCustomValidity('')));
document.querySelector('#clear-bookings')?.addEventListener('click',()=>{bookings.length=0;renderBookings();document.querySelector('.result').textContent='';});
if(demo==='bot') {
  const log=document.querySelector('.messages'),actions=document.querySelector('.bot-actions'),input=document.querySelector('#chat-text');
  let stage='menu',choice='';
  function message(text,user=false){const node=document.createElement('div');node.className='message'+(user?' user':'');node.textContent=text;log.append(node);log.scrollTop=log.scrollHeight;}
  function options(labels){actions.replaceChildren();labels.forEach(label=>{const button=document.createElement('button');button.textContent=label;button.addEventListener('click',()=>respond(label));actions.append(button);});}
  function menu(){stage='menu';options(['Записаться','Направления и цены','Как проходит запись?']);input.placeholder='Выберите кнопку или напишите сообщение…';}
  function reset(){log.replaceChildren();message('Привет! Я помощник студии FORMA 👋\nПомогу выбрать направление и пройти демонстрационный сценарий записи. С чего начнём?');menu();input.value='';}
  function respond(text){if(!text.trim())return;message(text,true);input.value='';if(text==='В главное меню'||text==='/start'){message('Давайте начнём сначала. Что вас интересует?');menu();return;}
    if(stage==='name'){choice+=' · '+text.trim();message('Спасибо! Ваша демозаявка:\n'+choice+'\n\nВ реальном боте заявка может отправляться администратору. Здесь данные остаются только в этой вкладке.');menu();return;}
    if(stage==='service'&&['Пилатес','Йога','Растяжка'].includes(text)){choice=text;stage='time';message('Выбрано: '+text+'. Когда удобнее заниматься?');options(['Утром','Днём','Вечером','В главное меню']);return;}
    if(stage==='time'&&['Утром','Днём','Вечером'].includes(text)){choice+=' · '+text.toLowerCase();stage='name';message('Как к вам обращаться? Напишите имя — это последний шаг демозаявки.');options(['В главное меню']);input.placeholder='Ваше имя';input.focus();return;}
    if(text==='Записаться'||/запис|занят/i.test(text)){stage='service';message('Выберите направление:');options(['Пилатес','Йога','Растяжка','В главное меню']);return;}
    if(text==='Направления и цены'||/цен|стоим/i.test(text)){message('В демонстрационной студии:\n• Пилатес — 55 мин, 1 200 ₽\n• Йога — 60 мин, 1 000 ₽\n• Растяжка — 45 мин, 900 ₽\n\nЦены приведены только для демонстрации.');menu();return;}
    if(text==='Как проходит запись?'||/как|помощ/i.test(text)){message('Вы выбираете направление и удобную часть дня, затем указываете имя.\nРеальный бот может передавать заявку администратору для подтверждения свободного времени.');menu();return;}
    message('В этом демо доступны запись, направления и цены. Выберите действие кнопкой ниже.');if(stage==='service')options(['Пилатес','Йога','Растяжка','В главное меню']);else if(stage==='time')options(['Утром','Днём','Вечером','В главное меню']);else menu();
  }
  document.querySelector('#chat-form').addEventListener('submit',event=>{event.preventDefault();respond(input.value);});document.querySelector('#restart-chat').addEventListener('click',reset);reset();
}
