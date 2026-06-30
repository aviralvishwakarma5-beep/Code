(function(){
  const tracks = [
    { title:"Amber Static",          artist:"Lowtide Radio",       src:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",  label:"#b8702e" },
    { title:"Drift Hours",           artist:"Nocturne & Wires",     src:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",  label:"#5c6f5a" },
    { title:"Copper Wire Serenade",  artist:"The Quiet Channel",    src:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",  label:"#6f5454" },
    { title:"Tape Hiss Lullaby",     artist:"Static Bloom",         src:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",  label:"#4a5e6f" },
    { title:"Frequency Garden",      artist:"Halflight Society",    src:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",  label:"#6f6a4a" }
  ];

  const audio = document.getElementById('audio');
  const consoleEl = document.getElementById('console');
  const songTitle = document.getElementById('songTitle');
  const songArtist = document.getElementById('songArtist');
  const trackIndexEl = document.getElementById('trackIndex');
  const trackTotalEl = document.getElementById('trackTotal');
  const curTimeEl = document.getElementById('curTime');
  const durTimeEl = document.getElementById('durTime');
  const seek = document.getElementById('seek');
  const playBtn = document.getElementById('playBtn');
  const playIcon = document.getElementById('playIcon');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const repeatBtn = document.getElementById('repeatBtn');
  const volume = document.getElementById('volume');
  const volPct = document.getElementById('volPct');
  const muteBtn = document.getElementById('muteBtn');
  const volIcon = document.getElementById('volIcon');
  const recordLabel = document.getElementById('recordLabel');
  const tracklistEl = document.getElementById('tracklist');

  let currentIndex = 0;
  let isSeeking = false;
  let isShuffle = false;
  let repeatMode = 'off'; // off -> all -> one -> off

  const ICON_PLAY = '<path d="M8 5v14l11-7z"/>';
  const ICON_PAUSE = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';
  const ICON_VOL = '<path d="M3 10v4h4l5 5V5L7 10H3z"/><path d="M16.5 12a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/>';
  const ICON_MUTE = '<path d="M3 10v4h4l5 5V5L7 10H3z"/><line x1="16" y1="9" x2="22" y2="15" stroke="currentColor" stroke-width="2"/><line x1="22" y1="9" x2="16" y2="15" stroke="currentColor" stroke-width="2"/>';

  function fmt(t){
    if(!isFinite(t) || t < 0) return "--:--";
    const m = Math.floor(t/60);
    const s = Math.floor(t%60).toString().padStart(2,'0');
    return m + ":" + s;
  }

  function buildPlaylist(){
    tracklistEl.innerHTML = "";
    trackTotalEl.textContent = tracks.length.toString().padStart(2,'0');
    document.getElementById('plCount').textContent = tracks.length + " tracks";
    tracks.forEach((t, i) => {
      const row = document.createElement('div');
      row.className = 'track';
      row.tabIndex = 0;
      row.dataset.index = i;
      row.innerHTML = `
        <span class="track-num">${(i+1).toString().padStart(2,'0')}</span>
        <span class="track-eq"><i></i><i></i><i></i></span>
        <div class="track-meta">
          <div class="track-title">${t.title}</div>
          <div class="track-artist">${t.artist}</div>
        </div>
        <span class="track-dur" data-dur>--:--</span>
      `;
      row.addEventListener('click', () => { loadTrack(i, true); });
      row.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); loadTrack(i, true); }
      });
      tracklistEl.appendChild(row);
    });
  }

  function setActiveRow(){
    [...tracklistEl.children].forEach((row, i) => {
      row.classList.toggle('active', i === currentIndex);
    });
  }

  function loadTrack(index, autoplay){
    currentIndex = (index + tracks.length) % tracks.length;
    const t = tracks[currentIndex];
    audio.src = t.src;
    songTitle.textContent = t.title;
    songArtist.textContent = t.artist;
    trackIndexEl.textContent = (currentIndex+1).toString().padStart(2,'0');
    recordLabel.style.background = t.label;
    durTimeEl.textContent = "--:--";
    seek.value = 0;
    seek.style.setProperty('--progress', '0%');
    curTimeEl.textContent = "0:00";
    setActiveRow();
    if(autoplay){ play(); } else { audio.pause(); setPlayingUI(false); }
  }

  function play(){
    audio.play().then(()=> setPlayingUI(true)).catch(()=>{ setPlayingUI(false); });
  }
  function pause(){
    audio.pause();
    setPlayingUI(false);
  }
  function setPlayingUI(isPlaying){
    consoleEl.classList.toggle('playing', isPlaying);
    playIcon.innerHTML = isPlaying ? ICON_PAUSE : ICON_PLAY;
    playBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
  }

  function togglePlay(){
    if(audio.paused){ play(); } else { pause(); }
  }

  function nextTrack(manual){
    if(isShuffle && tracks.length > 1){
      let r;
      do{ r = Math.floor(Math.random()*tracks.length); } while(r === currentIndex);
      loadTrack(r, true);
      return;
    }
    let next = currentIndex + 1;
    if(next >= tracks.length){
      if(manual || repeatMode === 'all'){ next = 0; }
      else { loadTrack(0, false); return; } // end of list, stay paused on first track
    }
    loadTrack(next, true);
  }

  function prevTrack(){
    if(audio.currentTime > 3){
      audio.currentTime = 0;
      return;
    }
    let prev = currentIndex - 1;
    if(prev < 0) prev = tracks.length - 1;
    loadTrack(prev, true);
  }

  // ---- audio events ----
  audio.addEventListener('loadedmetadata', () => {
    durTimeEl.textContent = fmt(audio.duration);
    const row = tracklistEl.children[currentIndex];
    if(row){ row.querySelector('[data-dur]').textContent = fmt(audio.duration); }
  });

  audio.addEventListener('timeupdate', () => {
    if(isSeeking) return;
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    seek.value = pct;
    seek.style.setProperty('--progress', pct + '%');
    curTimeEl.textContent = fmt(audio.currentTime);
  });

  audio.addEventListener('ended', () => {
    if(repeatMode === 'one'){
      audio.currentTime = 0;
      play();
    } else {
      nextTrack(false);
    }
  });

  // ---- controls ----
  playBtn.addEventListener('click', togglePlay);
  nextBtn.addEventListener('click', () => nextTrack(true));
  prevBtn.addEventListener('click', prevTrack);

  seek.addEventListener('input', () => {
    isSeeking = true;
    seek.style.setProperty('--progress', seek.value + '%');
    if(audio.duration){ curTimeEl.textContent = fmt((seek.value/100)*audio.duration); }
  });
  seek.addEventListener('change', () => {
    if(audio.duration){ audio.currentTime = (seek.value/100)*audio.duration; }
    isSeeking = false;
  });

  volume.addEventListener('input', () => {
    audio.volume = volume.value/100;
    audio.muted = false;
    volPct.textContent = volume.value + '%';
    volume.style.setProperty('--progress', volume.value + '%');
    volIcon.innerHTML = volume.value == 0 ? ICON_MUTE : ICON_VOL;
  });

  muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    volIcon.innerHTML = audio.muted ? ICON_MUTE : ICON_VOL;
  });

  shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
  });

  repeatBtn.addEventListener('click', () => {
    repeatMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
    repeatBtn.classList.toggle('active', repeatMode !== 'off');
    const existing = repeatBtn.querySelector('.badge');
    if(existing) existing.remove();
    if(repeatMode === 'one'){
      const b = document.createElement('span');
      b.className = 'badge';
      b.textContent = '1';
      repeatBtn.appendChild(b);
    }
  });

  document.addEventListener('keydown', (e) => {
    if(e.target.tagName === 'INPUT') return;
    if(e.code === 'Space'){ e.preventDefault(); togglePlay(); }
  });

  // ---- init ----
  buildPlaylist();
  audio.volume = 0.7;
  loadTrack(0, false);
})();
