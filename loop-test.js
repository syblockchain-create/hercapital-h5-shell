// use global fetch provided by Node 18+

async function runLoop() {
  const base = 'https://hercapital-pack-kernel-production.up.railway.app';
  let conv = `web_${Date.now()}`;
  const region = 'CN';
  const user_id = 'web_user';
  console.log('initial conversation_id', conv);
  async function call(text) {
    const body = { user_id, user_text: text, conversation_id: conv, region };
    console.log('\n-> send:', text);
    const res = await fetch(`${base}/run_pack`, {
      method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)
    });
    const data = await res.json();
    console.log('status', res.status);
    console.log('resp.header', data.header);
    console.log('resp.actions', data.actions?.map(a=>a.value));
    console.log('resp.cards.length', data.cards?.length);
    if(data.conversation_id && data.conversation_id !== conv) {
      console.log('conversation_id changed ->', data.conversation_id);
      conv = data.conversation_id;
    }
    return data;
  }
  await call('preview');
  await call('commit:choose_a');
  await call('checkin:1:done');
  await call('checkin:2:done');
  await call('verify_done:confirm');
  await call('status:show');
}

runLoop().catch(console.error);
