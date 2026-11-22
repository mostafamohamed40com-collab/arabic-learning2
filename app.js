(() => {
  const $ = (s, e = document) => e.querySelector(s), $$ = (s, e = document) => [...e.querySelectorAll(s)];
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const F = t => t.replace(/\{n\}/g, esc(Student.name())); // يضع اسم الطالب في كل رسالة
  const MAX = QUESTIONS.length * PER_Q;
  const GOOD = ['أحسنتَ يا {n}!', 'ممتاز يا {n}، إجابة صحيحة!', 'رائع يا {n}، تابع هكذا!'];
  const BAD = ['لا بأس يا {n}، تعلّم من الشرح وتابع!', 'قريب يا {n}! راجع التفسير جيدًا.'];
  let stage = 1, qi = 0, pending = [], tt, ac;

  // ---------- أدوات ----------
  function tone(f) {
    if (!Student.sound()) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      f.forEach((h, i) => {
        const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.14;
        o.type = 'triangle'; o.frequency.value = h;
        g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.3);
      });
    } catch (e) { /* الصوت غير متاح */ }
  }
  function toast(m) { const t = $('#toast'); t.textContent = m; t.className = 'show'; clearTimeout(tt); tt = setTimeout(() => t.className = '', 2800); }
  function head() { $('#hName').textContent = Student.name(); $('#hPts').textContent = Student.points(); $('#snd').textContent = Student.sound() ? '🔊' : '🔇'; }
  const bind = () => $$('[data-go]').forEach(b => b.onclick = () => go(b.dataset.go));
  const nextBadge = () => BADGES.find(b => !Student.has(b.id));
  const curStage = () => [1, 2, 3].find(n => !Student.stageDone(n)) || 0;
  const firstOpen = () => { const i = QUESTIONS.filter(q => q.stage === stage).findIndex(q => !Student.get(q.id)); return i < 0 ? 0 : i; };
  function bar() {
    const p = Student.points(), b = nextBadge();
    return b ? { pct: Math.round(p / b.pts * 100), txt: `بقي ${b.pts - p} نقطة لتفتح شارة «${b.name}»` }
             : { pct: 100, txt: F('ما شاء الله يا {n}! فتحتَ جميع الشارات') };
  }
  const badge = b => { const on = Student.has(b.id); return `<div class="bd ${on ? 'on' : 'off'}"><div class="shape ${b.cls}"><span>${b.sym}</span><i>${on ? b.icon : '🔒'}</i></div><h4>${b.name}</h4><small>${on ? F('مفتوحة ✓ بطلها {n}') : 'تُفتح عند ' + b.pts + ' نقطة'}</small></div>`; };
  const st = (i, l, v) => `<div class="stat"><span>${i}</span><b>${v}</b><small>${l}</small></div>`;

  // ---------- الصفحات ----------
  function home() {
    const p = Student.points(), a = Student.answered(), cs = curStage(), pb = bar();
    $('#view').innerHTML = `
    <section class="hero card"><div class="pen">✒️</div>
      <h1>${F('أهلًا يا {n}، مستعد لرحلة جديدة في عالم الضاد؟')}</h1>
      <p>درسنا اليوم: <b>الفعل اللازم والفعل المتعدي</b></p>
      <div class="row"><button class="btn" data-go="lesson">📖 اقرأ الشرح</button><button class="btn gold" data-go="quiz">🎯 ${a ? 'تابع الاختبار' : 'ابدأ الاختبار'}</button></div>
    </section>
    <section class="card"><h2>لوحة ${esc(Student.name())}</h2>
      <div class="stats">${st('👤', 'الطالب', esc(Student.name()))}${st('⭐', 'إجمالي النقاط', p + ' / ' + MAX)}${st('📝', 'أسئلة أجبتَ عنها', a + ' / ' + QUESTIONS.length)}${st('✅', 'إجابات صحيحة', Student.correct())}${st('📈', 'نسبة التقدم', Math.round(a / QUESTIONS.length * 100) + '%')}${st('🧭', 'المرحلة الحالية', cs ? 'المرحلة ' + cs : 'اكتملت الرحلة')}</div>
      <div class="meter"><div class="fill" data-w="${pb.pct}"></div></div><p class="muted">${pb.txt}</p>
      <h3>شاراتك</h3><div class="badges">${BADGES.map(badge).join('')}</div>
    </section>`;
    bind(); setTimeout(() => { const f = $('.fill'); if (f) f.style.width = pb.pct + '%'; }, 60);
  }

  function lesson() {
    $('#view').innerHTML = `
    <section class="card"><h2>مقدمة</h2><p>${F('هل لاحظتَ يا {n} أن بعض الأفعال تكتفي بفاعلها، وبعضها لا يكتمل معناه إلا بـ«مفعول به»؟ في هذا الدرس نتعلّم كيف نفرّق بينهما بسهولة.')}</p></section>
    <div class="two">
      <section class="card ex"><h3>الفعل اللازم</h3><p><b>هو الفعل الذي يكتفي بفاعله ولا يحتاج إلى مفعول به لإتمام معناه.</b></p>
        <ul class="amiri"><li>جلسَ <u>الطالبُ</u>.</li><li>نامَ <u>الطفلُ</u>.</li><li>نجحَ <u>المجتهدُ</u>.</li><li>ذهبَ أحمدُ <u>إلى المدرسةِ</u>. (جار ومجرور)</li></ul></section>
      <section class="card ex"><h3>الفعل المتعدي</h3><p><b>هو الفعل الذي لا يكتمل معناه بفاعله وحده، بل يحتاج إلى مفعول به.</b></p>
        <ul class="amiri"><li>كتبَ الطالبُ <u>الدرسَ</u>.</li><li>فتحَ الولدُ <u>البابَ</u>.</li><li>قرأتْ سلمى <u>القصةَ</u>.</li><li>شربَ الطفلُ <u>اللبنَ</u>.</li></ul></section>
    </div>
    <section class="card"><h2>مقارنة بين النوعين</h2><div class="scroll"><table class="cmp">
      <tr><th></th><th>الفعل اللازم</th><th>الفعل المتعدي</th></tr>
      <tr><td>يحتاج إلى مفعول به؟</td><td>لا</td><td>نعم</td></tr>
      <tr><td>يتم المعنى بالفاعل وحده؟</td><td>نعم</td><td>لا</td></tr>
      <tr><td>سؤال «ماذا؟» بعد الفعل والفاعل</td><td>لا جواب</td><td>الجواب هو المفعول به</td></tr>
      <tr class="amiri"><td>مثال</td><td>جلسَ الطالبُ</td><td>كتبَ الطالبُ الدرسَ</td></tr></table></div></section>
    <section class="card"><h2>ملاحظات تساعدك على التمييز</h2><ol class="tips">
      <li>بعد الفعل والفاعل اسأل: <b>ماذا؟</b> أو <b>مَن؟</b> فإن وجدتَ جوابًا فالفعل متعدٍّ.</li>
      <li>الجار والمجرور مثل «إلى المدرسةِ» و«في الفصلِ» <b>ليس مفعولًا به</b>، والفعل معه يبقى لازمًا.</li>
      <li>المفعول به اسم منصوب غالبًا، مثل: الدرسَ، البابَ، القصةَ.</li>
      <li>كل فعل يحتاج إلى فاعل، لكن المفعول به لا يحتاجه إلا الفعل المتعدي.</li></ol></section>
    <section class="card"><h2>جرّب بنفسك</h2><p class="muted">اختر نوع الفعل في كل جملة (للتدريب فقط، ولا تُحتسب نقاط).</p>
      ${PRACTICE.map(([s, a]) => `<div class="pr" data-a="${a}"><b class="amiri">${s}</b><span><button>لازم</button><button>متعدٍّ</button></span><em></em></div>`).join('')}
      <div class="row"><button class="btn gold" data-go="quiz">🎯 جاهز للاختبار</button></div></section>`;
    $$('.pr').forEach(r => $$('button', r).forEach((b, i) => b.onclick = () => {
      const ok = i === +r.dataset.a, em = $('em', r);
      em.textContent = ok ? F('أحسنتَ يا {n}! ✅') : F('حاول مرة أخرى يا {n} 🔁'); r.classList.toggle('ok', ok);
    }));
    bind();
  }

  function quiz() {
    const qs = QUESTIONS.filter(q => q.stage === stage), q = qs[qi], a = Student.get(q.id), done = Student.stageDone(stage);
    const tabs = [1, 2, 3].map(n => `<button class="tab ${n === stage ? 'on' : ''} ${Student.stageOpen(n) ? '' : 'lock'}" data-s="${n}">${Student.stageOpen(n) ? '' : '🔒 '}المرحلة ${n}: ${STAGES[n - 1]}${Student.stageDone(n) ? ' ✓' : ''}</button>`).join('');
    const dots = qs.map((x, i) => { const r = Student.get(x.id); return `<button class="dot ${i === qi ? 'cur' : ''} ${r ? (r.ok ? 'ok' : 'no') : ''}" data-i="${i}" aria-label="السؤال ${i + 1}">${i + 1}</button>`; }).join('');
    const opts = q.o.map((t, i) => `<button class="opt ${a ? (i === q.a ? 'ok' : i === a.c ? 'no' : '') : ''}" data-o="${i}" ${a ? 'disabled' : ''}>${t}</button>`).join('');
    const fb = a ? `<div class="fb ${a.ok ? 'ok' : 'no'}"><b>${F(a.ok ? GOOD[qi % GOOD.length] + ' +' + PER_Q + ' نقطة' : BAD[qi % BAD.length])}</b><p>💡 ${q.e}</p></div>` : '';
    const nx = a && qi < qs.length - 1 ? '<button class="btn gold" id="nx">السؤال التالي ←</button>' : '';
    let end = '';
    if (done) end = stage < 3
      ? `<div class="card fin"><h3>${F('أتممتَ المرحلة ' + stage + ' يا {n}! 🎉')}</h3><p>انفتحت أمامك المرحلة ${stage + 1}.</p><button class="btn gold" id="ns">ابدأ المرحلة التالية</button></div>`
      : `<div class="card fin"><h3>${F('أنهيتَ الرحلة يا {n}! 🏆')}</h3><p>جمعتَ ${Student.points()} من ${MAX} نقطة.</p><button class="btn gold" data-go="badges">شاهد شاراتك</button></div>`;
    else if (a && qi === qs.length - 1) end = `<p class="muted">${F('أجب عن بقية أسئلة المرحلة يا {n} لتفتح المرحلة التالية.')}</p>`;
    $('#view').innerHTML = `
    <div class="tabs">${tabs}</div>
    <section class="card"><div class="qhead"><span class="tag">${q.type}</span><small>تقدمك: ${Student.answered()} من ${QUESTIONS.length} · النقاط ${Student.points()}</small></div>
      <div class="meter sm"><div class="fill" style="width:${Student.answered() / QUESTIONS.length * 100}%"></div></div>
      <div class="dots">${dots}</div>
      <h2 class="qt">${q.t}</h2><div>${opts}</div>${fb}<div class="row">${nx}</div></section>${end}`;
    $$('.tab').forEach(b => b.onclick = () => { const n = +b.dataset.s; if (!Student.stageOpen(n)) return toast(F(`أكمل المرحلة ${n - 1} أولًا يا {n} 🔒`)); stage = n; qi = firstOpen(); quiz(); });
    $$('.dot').forEach(b => b.onclick = () => { qi = +b.dataset.i; quiz(); });
    $$('.opt').forEach(b => b.onclick = () => choose(+b.dataset.o));
    if ($('#nx')) $('#nx').onclick = () => { qi++; quiz(); };
    if ($('#ns')) $('#ns').onclick = () => { stage++; qi = firstOpen(); quiz(); window.scrollTo(0, 0); };
    bind();
  }

  function choose(i) {
    const q = QUESTIONS.filter(x => x.stage === stage)[qi], r = Student.answer(q, i);
    if (!r) return;
    tone(r.ok ? [660, 880] : [220]); head(); quiz();
    if (r.badges.length) { pending = r.badges.slice(); setTimeout(showBadge, 700); }
  }

  function showBadge() {
    const b = pending.shift(); if (!b) return;
    tone([523, 659, 784, 1047]);
    const m = $('#modal');
    const sp = Array.from({ length: 28 }, (_, i) => `<s style="--a:${i * 360 / 28}deg;--d:${80 + Math.random() * 90}px;--t:${(Math.random() * 0.3).toFixed(2)}s">${['✦', 'ء', 'َ', 'ُ', 'ض'][i % 5]}</s>`).join('');
    m.innerHTML = `<div class="mbox"><div class="burst">${sp}</div><div class="shape big ${b.cls}"><span>${b.sym}</span><i>${b.icon}</i></div><h2>${F('مبروك يا {n}!')}</h2><p>${F('لقد أصبحتَ ' + b.name + ' بعد حصولك على ' + b.pts + ' نقطة')}</p><button class="btn gold" id="mx">رائع!</button></div>`;
    m.className = 'show';
    $('#mx').onclick = () => { m.className = ''; m.innerHTML = ''; showBadge(); };
  }

  function badges() {
    $('#view').innerHTML = `<section class="card"><h2>${F('شارات {n}')}</h2><p class="muted">كل شارة تُفتح عند عدد معيّن من النقاط، وتبقى معك للأبد.</p>
      <div class="badges big">${BADGES.map(badge).join('')}</div><div class="meter"><div class="fill" style="width:${bar().pct}%"></div></div><p class="muted">${bar().txt}</p></section>`;
  }

  const V = { home, lesson, quiz, badges };
  function go(v) {
    if (v === 'quiz') { stage = curStage() || 3; qi = firstOpen(); }
    $$('nav button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
    V[v](); window.scrollTo(0, 0);
  }
  function enter() { $('#welcome').hidden = true; $('#app').hidden = false; head(); go('home'); }

  // ---------- التشغيل ----------
  Student.load();
  ['ض', 'ا', 'ع', 'ب', 'ـَ', 'ـُ', 'ـِ', 'ـّ', 'ء', '✦'].forEach((c, i) => {
    const s = document.createElement('span'); s.textContent = c;
    s.style.cssText = `right:${(i * 37) % 92}%;top:${(i * 53) % 85}%;font-size:${60 + (i * 29) % 90}px;animation-delay:-${i * 1.7}s`;
    $('#bg').appendChild(s);
  });
  $$('nav button').forEach(b => b.onclick = () => go(b.dataset.v));
  $('#snd').onclick = () => { Student.toggleSound(); head(); tone([660]); };
  $('#chg').onclick = () => { $('#app').hidden = true; $('#welcome').hidden = false; $('#nameIn').value = Student.name(); $('#nameErr').textContent = ''; $('#nameBtn').textContent = 'حفظ الاسم'; $('#nameIn').focus(); };
  $('#nameForm').onsubmit = e => {
    e.preventDefault();
    const v = $('#nameIn').value.trim();
    if (!v) { $('#nameErr').textContent = 'اكتب اسمك أولًا لنبدأ الرحلة.'; return; }
    Student.setName(v); $('#nameBtn').textContent = 'ابدأ الرحلة'; enter();
  };
  if (Student.name()) enter();
})();
