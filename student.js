// حالة الطالب والتخزين. النقاط تُحسب دائمًا من الإجابات المسجَّلة فلا يمكن أن تتكرر.
const Student = (() => {
  const KEY = 'dhad_rihla_v1';
  let s = { name: '', answers: {}, badges: {}, points: 0, stages: [], sound: true };
  const store = {
    get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* التخزين غير متاح */ } }
  };
  function recalc() {
    const ans = {};
    QUESTIONS.forEach(q => { const a = s.answers[q.id]; if (a && typeof a.c === 'number') ans[q.id] = { c: a.c, ok: a.c === q.a }; });
    s.answers = ans;
    s.points = Object.values(ans).filter(a => a.ok).length * PER_Q;
    s.stages = [1, 2, 3].filter(n => QUESTIONS.filter(q => q.stage === n).every(q => ans[q.id]));
  }
  function read() { try { const r = JSON.parse(store.get()); return r && typeof r === 'object' ? r : null; } catch (e) { return null; } }
  function load() {
    const r = read();
    if (r) s = Object.assign(s, r);
    if (!s.answers || typeof s.answers !== 'object') s.answers = {};
    if (!s.badges || typeof s.badges !== 'object') s.badges = {};
    recalc();
    BADGES.forEach(b => { if (s.points >= b.pts) s.badges[b.id] = 1; });
    save();
  }
  function save() { store.set(JSON.stringify(s)); }
  return {
    load,
    name: () => s.name,
    setName(n) { s.name = String(n).trim().slice(0, 20); save(); },
    points: () => s.points,
    answered: () => Object.keys(s.answers).length,
    correct: () => Object.values(s.answers).filter(a => a.ok).length,
    get: id => s.answers[id],
    has: id => !!s.badges[id],
    stageDone: n => s.stages.includes(n),
    stageOpen: n => n === 1 || s.stages.includes(n - 1),
    sound: () => s.sound !== false,
    toggleSound() { s.sound = !Student.sound(); save(); },
    // يسجّل الإجابة مرة واحدة فقط لكل سؤال، ويعيد null إذا سبقت الإجابة عنه
    answer(q, c) {
      const r = read();
      if (r && r.answers) s.answers = Object.assign({}, r.answers, s.answers); // يمنع التكرار بين تبويبين
      if (s.answers[q.id]) { recalc(); return null; }
      const before = s.stages.slice();
      s.answers[q.id] = { c };
      recalc();
      const nb = BADGES.filter(b => s.points >= b.pts && !s.badges[b.id]);
      nb.forEach(b => { s.badges[b.id] = 1; });
      save();
      return { ok: c === q.a, badges: nb, stageDone: s.stages.includes(q.stage) && !before.includes(q.stage) };
    }
  };
})();
