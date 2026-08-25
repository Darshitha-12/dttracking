const fs=require('fs');
const h=fs.readFileSync('index.html','utf8');
const ids=[...h.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
const jsm=h.match(/<script>([\s\S]*)<\/script>/)[1];
const refs=[...jsm.matchAll(/\$\("#([^"]+)"\)/g)].map(m=>m[1]);
const uniq=[...new Set(refs)];
const miss=uniq.filter(id=>!ids.includes(id));
console.log('HTML IDs: '+ids.length);
console.log('JS $ refs: '+refs.length+' ('+uniq.length+' unique)');
if(miss.length){console.log('MISSING: '+miss.join(', '));}
else{console.log('ALL OK - every JS $ ref has matching HTML id');}

// Check for potential runtime issues
const issues=[];
if(jsm.includes('$("#ovClock")')&&!h.includes('id="ovClock"'))issues.push('ovClock missing');
if(jsm.includes('$("#notifBanner")')&&!h.includes('id="notifBanner"'))issues.push('notifBanner missing');
if(jsm.includes('updateNotifBanner()')&&!jsm.includes('function updateNotifBanner'))issues.push('updateNotifBanner fn missing');
if(jsm.includes('closeFocusNotif()')&&!jsm.includes('function closeFocusNotif'))issues.push('closeFocusNotif fn missing');
if(jsm.includes('flashScreen(')&&!jsm.includes('function flashScreen'))issues.push('flashScreen fn missing');
if(jsm.includes('SoundDB')&&!jsm.includes('const SoundDB'))issues.push('SoundDB missing');
if(jsm.includes('populateSoundSelector()')&&!jsm.includes('function populateSoundSelector'))issues.push('populateSoundSelector fn missing');
if(jsm.includes('refreshSoundList()')&&!jsm.includes('function refreshSoundList'))issues.push('refreshSoundList fn missing');
if(jsm.includes('showView("alarms")')&&!jsm.includes('function showView'))issues.push('showView fn missing');

if(issues.length)console.log('ISSUES: '+issues.join(', '));
else console.log('No runtime issues detected');
