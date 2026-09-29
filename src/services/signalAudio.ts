export const signalAudioSource = {
  html: `<!doctype html><html><meta name="viewport" content="width=device-width"><body><script>
let context, oscillator, gain, currentId=0;
function send(message){window.ReactNativeWebView.postMessage(JSON.stringify(message));}
function stopSignal(){
  currentId++;
  if(context&&gain){gain.gain.cancelScheduledValues(context.currentTime);gain.gain.setValueAtTime(0,context.currentTime);}
}
async function playSignal(id,events){
  stopSignal();
  currentId=id;
  try{
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)throw new Error('Audio is unavailable on this device.');
    if(!context||context.state==='closed'){
      context=new Audio();
      oscillator=context.createOscillator();
      gain=context.createGain();
      gain.gain.value=0;
      oscillator.frequency.value=650;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
    }
    await context.resume();
    if(currentId!==id)return;
    if(context.state!=='running')throw new Error('Audio could not start. Try again or turn Sound off to use the signal lamp.');
    let at=context.currentTime+0.025;
    gain.gain.cancelScheduledValues(context.currentTime);
    gain.gain.setValueAtTime(0,context.currentTime);
    events.forEach(event=>{
      const end=at+event.duration/1000;
      gain.gain.setValueAtTime(0,at);
      if(event.on){
        gain.gain.linearRampToValueAtTime(0.22,at+0.004);
        gain.gain.setValueAtTime(0.22,Math.max(at+0.004,end-0.004));
        gain.gain.linearRampToValueAtTime(0,end);
      }
      at=end;
    });
    gain.gain.setValueAtTime(0,at);
    send({type:'started',id});
  }catch(error){if(currentId===id){stopSignal();send({type:'error',id,message:error.message||'Unable to play audio.'});}}
}
send({type:'ready'});
</script></body></html>`,
};
