(() => {
  'use strict';
  const tracks = window.TRACKS || [];
  const limits = [1, 2, 4, 7, 11, 16];
  const $ = id => document.getElementById(id);
  const audio = $('audio');
  const input = $('guessInput');
  const suggestions = $('suggestions');
  let selected = null;
  let state;
  let current;
  let practice = false;
  let practiceIds = [];
  let hasPlayed = false;
  const practiceKey = 'wubbzy-active-practise';

  const dailyDate = () => {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
  };
  const shareDate = date => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year.slice(-2)}`;
  };
  const hash = value => { let h = 2166136261; for (const ch of value) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const random = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  function dailyTrack(date) {
    const day = Math.floor(Date.parse(`${date}T12:00:00Z`) / 86400000);
    const cycle = Math.floor(day / tracks.length);
    const index = ((day % tracks.length) + tracks.length) % tracks.length;
    const ids = tracks.map(t => t.id);
    const rand = random(hash(`wuzzleburg-${cycle}`));
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i+1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    return tracks.find(t => t.id === ids[index]);
  }
  const key = () => `wuzzleburg-daily-${dailyDate()}`;
  let activeDailyDate = dailyDate();
  function loadDaily() {
    practice = false;
    localStorage.removeItem(practiceKey);
    activeDailyDate = dailyDate();
    current = dailyTrack(activeDailyDate);
    try { state = JSON.parse(localStorage.getItem(key())); }
    catch { state = null; }
    if (!state || state.trackId !== current.id || !Number.isInteger(state.segment) || state.segment < 0 || state.segment >= current.clips.length) {
      state = { trackId: current.id, segment: hash(`${activeDailyDate}:${current.id}`) % current.clips.length, guesses: [], won: false, finished: false };
    }
    render();
  }
  function restorePractice() {
    let saved;
    try { saved = JSON.parse(localStorage.getItem(practiceKey)); }
    catch { return false; }
    const track = tracks.find(t => t.id === saved?.trackId);
    if (!track || !Number.isInteger(saved.segment) || saved.segment < 0 || saved.segment >= track.clips.length ||
        !Array.isArray(saved.guesses) || saved.guesses.length > 6 ||
        !saved.guesses.every(id => id === null || tracks.some(t => t.id === id)) ||
        typeof saved.won !== 'boolean' || typeof saved.finished !== 'boolean') return false;
    practice = true;
    current = track;
    state = saved;
    render();
    return true;
  }
  function save() {
    state.trackId = current.id;
    localStorage.setItem(practice ? practiceKey : key(), JSON.stringify(state));
  }
  function nextPractice() {
    practice = true;
    if (!practiceIds.length) practiceIds = tracks.map(t => t.id).sort(() => Math.random() - .5);
    let id = practiceIds.pop();
    if (id === current.id && tracks.length > 1) { practiceIds.unshift(id); id = practiceIds.pop(); }
    current = tracks.find(t => t.id === id);
    state = { trackId: current.id, segment: Math.floor(Math.random() * current.clips.length), guesses: [], won: false, finished: false };
    save();
    render();
  }
  function render() {
    audio.pause(); audio.removeAttribute('src'); audio.load();
    audio.src = current.clips[state.segment];
    hasPlayed = false;
    input.value = ''; selected = null; suggestions.hidden = true; input.setAttribute('aria-expanded','false');
    $('submitButton').disabled = true;
    $('feedback').textContent = '';
    $('modeLabel').textContent = practice ? 'PRACTISE SONG' : "TODAY'S SONG";
    $('dateLabel').hidden = practice;
    $('dailyButton').hidden = !practice;
    $('dateLabel').textContent = new Date(`${activeDailyDate}T12:00:00Z`).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
    $('trackCount').textContent = tracks.length;
    $('segments').replaceChildren();
    for(let i=0;i<6;i++) {
      const id=state.guesses[i], row=document.createElement('div'), icon=document.createElement('span'), label=document.createElement('span');
      row.className='guess-row'+(i<state.guesses.length ? (id===current.id ? ' correct' : id===null ? ' skipped':' wrong') : i===state.guesses.length&&!state.finished ? ' current':'');
      icon.className='guess-icon'; icon.textContent=i<state.guesses.length ? (id===current.id?'✓':id===null?'□':'×') : '';
      label.className='guess-text'; label.textContent=i<state.guesses.length ? (id===null?'SKIPPED':tracks.find(t=>t.id===id)?.display||'Unknown song') : '';
      row.append(icon,label); $('segments').append(row);
    }
    const clip = state.finished ? 20 : limits[Math.min(state.guesses.length,5)];
    $('timeLabel').textContent = `0:${String(clip).padStart(2,'0')}`;
    $('elapsedLabel').textContent = '0:00';
    $('playerStatus').textContent = 'Tap play to listen';
    $('playIcon').textContent = '▶'; $('progressFill').style.width='0%';
    $('timelineUnlocked').style.width = `${Math.min(100,clip/16*100)}%`;
    $('startHint').hidden = state.finished || state.guesses.length > 0;
    $('skipButton').textContent = state.guesses.length < 5 ? `Skip (+${limits[state.guesses.length+1]-limits[state.guesses.length]}s)` : 'Skip';
    $('guessPanel').hidden = state.finished;
    $('guessesPanel').hidden = state.finished;
    $('resultPanel').hidden = !state.finished;
    const previousVideo = $('resultVideo');
    previousVideo.removeAttribute('src');
    const resultVideo = previousVideo.cloneNode(false);
    previousVideo.replaceWith(resultVideo);
    $('resultVideoLink').removeAttribute('href');
    $('videoPanel').hidden = true;
    $('videoUnavailable').hidden = true;
    if(state.finished) {
      $('resultKicker').textContent = state.won ? 'WUBBTASTIC!' : 'THE SONG WAS…';
      $('resultHeading').textContent = state.won ? `You got it in ${state.guesses.length}!` : "Next time, you'll get it!";
      $('resultSong').textContent = current.display;
      $('resultAlbum').textContent = current.album;
      $('resultArt').src = current.art;
      $('resultArt').alt = `Artwork for ${current.album}`;
      $('practiceButton').textContent = 'Play unlimited';
      if(current.youtubeId) {
        resultVideo.src = `https://www.youtube-nocookie.com/embed/${current.youtubeId}?rel=0`;
        resultVideo.title = `${current.display} on YouTube`;
        $('resultVideoLink').href = `https://www.youtube.com/watch?v=${current.youtubeId}`;
        $('videoPanel').hidden = false;
      } else {
        $('videoUnavailable').hidden = false;
      }
    } else {
      $('resultArt').removeAttribute('src');
    }
  }
  function advance(id) {
    if(state.finished) return;
    audio.pause(); audio.currentTime=0;
    state.guesses.push(id);
    state.won = id === current.id;
    state.finished = state.won || state.guesses.length >= 6;
    save(); render();
    if(!state.finished) $('feedback').textContent = id ? 'Not quite. A longer clip is ready!' : 'Skipped. A longer clip is ready!';
  }
  function showSuggestions() {
    const query = input.value.trim().toLowerCase();
    selected = null; $('submitButton').disabled = true;
    suggestions.replaceChildren();
    if(!query) { suggestions.hidden=true; input.setAttribute('aria-expanded','false'); return; }
    const matches = tracks.filter(t => t.display.toLowerCase().includes(query)).slice(0,8);
    for(const track of matches) {
      const li=document.createElement('li'); const button=document.createElement('button');
      button.type='button'; button.role='option'; button.textContent=track.display;
      button.addEventListener('click',()=>{selected=track; input.value=track.display; suggestions.hidden=true; input.setAttribute('aria-expanded','false'); $('submitButton').disabled=false; input.focus();});
      li.append(button); suggestions.append(li);
    }
    suggestions.hidden = matches.length===0; input.setAttribute('aria-expanded',String(matches.length>0));
  }
  $('playButton').addEventListener('click',async()=>{
    if(!audio.paused) { audio.pause(); return; }
    try { audio.currentTime=0; await audio.play(); hasPlayed=true; $('startHint').hidden=true; $('playerStatus').textContent='Playing clue…'; }
    catch { $('playerStatus').textContent='Could not play audio. Try opening through a local web server.'; }
  });
  audio.addEventListener('timeupdate',()=>{
    const limit=state.finished ? 20 : limits[Math.min(state.guesses.length,5)];
    $('progressFill').style.width=`${Math.min(100,audio.currentTime/limit*100)}%`;
    $('elapsedLabel').textContent=`0:${String(Math.floor(Math.min(audio.currentTime,limit))).padStart(2,'0')}`;
    if(audio.currentTime >= limit) {audio.pause(); audio.currentTime=0; $('progressFill').style.width='100%'; $('elapsedLabel').textContent='0:00'; $('playerStatus').textContent='Clue finished — play again anytime';}
  });
  audio.addEventListener('pause',()=>{$('playIcon').textContent='▶';});
  audio.addEventListener('play',()=>{$('playIcon').textContent='Ⅱ';});
  audio.addEventListener('error',()=>{$('playerStatus').textContent='Audio file missing. Check the audio folder.';});
  input.addEventListener('input',showSuggestions);
  input.addEventListener('keydown',e=>{
    if(e.key==='Escape') {suggestions.hidden=true; input.setAttribute('aria-expanded','false');}
    if(e.key==='Enter') {e.preventDefault(); if(selected) advance(selected.id); else {const first=suggestions.querySelector('button'); if(first) first.click();}}
  });
  $('submitButton').addEventListener('click',()=>{if(selected) advance(selected.id);});
  $('skipButton').addEventListener('click',()=>advance(null));
  $('practiceButton').addEventListener('click',nextPractice);
  $('dailyButton').addEventListener('click',loadDaily);
  $('shareButton').addEventListener('click',async()=>{
    const boxes=state.guesses.map(id=>id===current.id?'🟩':'🟥').join('')+'⬜'.repeat(6-state.guesses.length);
    const result=`Wubbzy Heardle ${practice?'Practise':shareDate(activeDailyDate)} ${state.won?state.guesses.length+'/6':'X/6'}\n${boxes}\nhttps://heardle.iwubbzy.com/`;
    try {await navigator.clipboard.writeText(result); $('shareButton').textContent='Copied!';}
    catch { $('shareButton').textContent='Copy unavailable'; }
  });
  $('helpButton').addEventListener('click',()=>$('helpDialog').showModal());
  $('closeHelp').addEventListener('click',()=>$('helpDialog').close());
  $('gotIt').addEventListener('click',()=>$('helpDialog').close());
  $('helpDialog').addEventListener('click',e=>{if(e.target===$('helpDialog')) $('helpDialog').close();});
  $('infoButton').addEventListener('click',()=>$('infoDialog').showModal());
  $('closeInfo').addEventListener('click',()=>$('infoDialog').close());
  $('closeInfoBottom').addEventListener('click',()=>$('infoDialog').close());
  $('statsButton').addEventListener('click',()=>{
    const results=Object.keys(localStorage).filter(k=>k.startsWith('wuzzleburg-daily-')).map(k=>{try{return JSON.parse(localStorage.getItem(k));}catch{return null;}}).filter(x=>x?.finished);
    const wins=results.filter(x=>x.won).length;
    $('playedStat').textContent=results.length; $('winsStat').textContent=wins; $('rateStat').textContent=results.length?`${Math.round(wins/results.length*100)}%`:'0%';
    $('statsDialog').showModal();
  });
  $('closeStats').addEventListener('click',()=>$('statsDialog').close());
  $('closeStatsBottom').addEventListener('click',()=>$('statsDialog').close());
  if(tracks.length && !restorePractice()) loadDaily();
  setInterval(()=>{if(!practice && dailyDate()!==activeDailyDate) loadDaily();},60000);
})();
