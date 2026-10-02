const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../ma-browser-card.js'), 'utf8');

function setup({protocol = 'https:', info = {}, fail = null} = {}) {
  const sockets = [], calls = [], timers = new Map(), definitions = {};
  let nextTimer = 0;
  const context = vm.createContext({
    console, URL, location: {origin: `${protocol}//ha.example`, protocol},
    HTMLElement: class { attachShadow() { this.shadowRoot = {}; } isConnected = true; },
    document: {cookie: '', removeEventListener() {}, addEventListener() {}},
    window: {}, customElements: {define(name, cls) {definitions[name] = cls;}},
    setTimeout(fn, ms) {timers.set(++nextTimer, {fn, ms}); return nextTimer;},
    clearTimeout(id) {timers.delete(id);},
    setInterval(fn, ms) {timers.set(++nextTimer, {fn, ms}); return nextTimer;},
    clearInterval(id) {timers.delete(id);},
    WebSocket: class {
      constructor(url) {this.url = url; this.sent = []; sockets.push(this);}
      send(value) {this.sent.push(JSON.parse(value));}
      close() {this.closed = true; this.onclose?.();}
      receive(value) {this.onmessage({data: JSON.stringify(value)});}
    },
  });
  vm.runInContext(source, context);
  const card = new definitions['ma-browser-card']();
  card._hass = {async callWS(message) {
    calls.push(message);
    if (fail) throw new Error(fail);
    if (message.endpoint.endsWith('/info')) return {ingress: true, state: 'started', ingress_entry: '/api/hassio_ingress/test-route', ...info};
    if (message.endpoint === '/ingress/session') return {session: 'test-session'};
    return {};
  }};
  card._renderHome = async () => {};
  card._err = error => {card.error = error.message;};
  card.setConfig({config_entry_id: 'test-entry', ma_url: 'http://192.0.2.10:8095', ma_addon_slug: 'd5369777_music_assistant', ma_token: 'test-token'});
  return {card, context, sockets, calls, timers};
}

function authenticate(socket) {
  socket.receive({server_version: '2.8.0'});
  socket.receive({message_id: 'auth', result: {authenticated: true}});
}

test('ingress opens same-origin WSS and sends token only after greeting', async () => {
  const {card, sockets, calls, context} = setup();
  await card._prepareMA(); card._connectMA();
  assert.equal(sockets[0].url, 'wss://ha.example/api/hassio_ingress/test-route/ws');
  assert.equal(sockets[0].sent.length, 0);
  authenticate(sockets[0]);
  assert.equal(sockets[0].sent[0].args.token, 'test-token');
  assert.equal(card._wsReady, true);
  assert.equal(calls[0].endpoint, '/addons/d5369777_music_assistant/info');
  assert.match(context.document.cookie, /path=\/api\/hassio_ingress\/;SameSite=Strict;Secure/);
});

test('all artwork forms are rewritten and ingress URLs are not rewritten twice', async () => {
  const {card} = setup(); await card._prepareMA();
  const base = 'https://ha.example/api/hassio_ingress/test-route';
  for (const input of ['http://192.0.2.10:8095/imageproxy/abc', '/imageproxy/abc', 'http://another-ma-host:8095/imageproxy/abc']) {
    const result = card._imageUrl(input);
    assert.equal(result, base + '/imageproxy/abc');
    assert.equal(card._imageUrl(result), result);
  }
  assert.equal(card._maItemArtUrl({metadata: {images: [{proxy_id: 'art-id'}]}}), base + '/imageproxy/art-id');
  assert.equal(card._artUrl({image: 'http://192.0.2.10:8095/imageproxy?id=1'}), base + '/imageproxy?id=1');
  assert.equal(card._imageUrl('/api/media_player_proxy/player?token=x'), 'https://ha.example/api/media_player_proxy/player?token=x');
  assert.match(card._imageUrl('http://art.example/picture.jpg'), /\/imageproxy\?path=http%3A%2F%2Fart.example/);
  assert.equal(card._imageUrl('https://art.example/picture.jpg'), 'https://art.example/picture.jpg');
  assert.equal(card._imageUrl('javascript:alert(1)'), null);
});

test('ingress failure never opens a direct socket', async () => {
  const {card, sockets} = setup({fail: 'Not authorized'});
  await assert.rejects(card._prepareMA(), /Not authorized/);
  card._connectMA(); assert.equal(sockets.length, 0);
});

test('unexpected remote ingress origin is rejected', async () => {
  const {card, sockets} = setup({info: {ingress_entry: 'https://other.example/api/hassio_ingress/x'}});
  await assert.rejects(card._prepareMA(), /unexpected ingress/);
  card._connectMA(); assert.equal(sockets.length, 0);
});

test('stopped add-on is reported', async () => {
  const {card} = setup({info: {state: 'stopped'}});
  await assert.rejects(card._prepareMA(), /must be running/);
});

test('direct HTTP is blocked from HTTPS, including artwork', async () => {
  const {card, sockets} = setup();
  card.setConfig({config_entry_id: 'entry', ma_url: 'http://192.0.2.10:8095', ma_token: 'test-token'});
  await assert.rejects(card._prepareMA(), /Direct HTTP/);
  card._connectMA(); assert.equal(sockets.length, 0);
  assert.equal(card._imageUrl('http://192.0.2.10:8095/imageproxy/abc'), null);
});

test('direct HTTPS and local HTTP remain usable', async () => {
  for (const protocol of ['https:', 'http:']) {
    const {card, sockets} = setup({protocol});
    card.setConfig({config_entry_id: 'entry', ma_url: `${protocol}//ma.example`, ma_token: 'test-token'});
    await card._prepareMA(); card._connectMA();
    assert.equal(sockets[0].url, `${protocol === 'https:' ? 'wss:' : 'ws:'}//ma.example/ws`);
  }
});

test('existing session is renewed, expired session is replaced', async () => {
  const {card, calls} = setup(); await card._prepareMA();
  await card._ensureIngressSession();
  assert.equal(calls.at(-1).endpoint, '/ingress/validate_session');
  assert.equal(calls.at(-1).data.session, 'test-session');
  card._hass.callWS = async message => {
    if (message.endpoint.endsWith('validate_session')) throw new Error('expired');
    return {session: 'replacement'};
  };
  await card._ensureIngressSession();
  assert.equal(card._ingressSession, 'replacement');
});

test('pending commands are rejected and retries cancelled on detach', async () => {
  const {card, sockets, timers} = setup(); await card._prepareMA(); card._connectMA(); authenticate(sockets[0]);
  const result = card._wsSend('player_queues/items', {});
  card.isConnected = false; card.disconnectedCallback();
  await assert.rejects(result, /connection closed/);
  assert.equal(card._wsReady, false); assert.equal(timers.size, 0);
  assert.equal(sockets[0].closed, true);
});

test('reconnect obtains ingress info/session before opening a new socket', async () => {
  const {card, sockets, timers, calls} = setup(); await card._prepareMA(); card._connectMA();
  sockets[0].close();
  const retry = [...timers.values()].find(t => t.ms === 10000);
  await retry.fn();
  assert.equal(sockets.length, 2);
  assert.match(sockets[1].url, /^wss:\/\/ha.example\/api\/hassio_ingress\//);
  assert.equal(calls.filter(c => c.endpoint.endsWith('/info')).length, 2);
});

test('token rejection gives an error without retrying or logging token', async () => {
  const {card, sockets, timers} = setup(); await card._prepareMA(); card._connectMA();
  sockets[0].receive({message_id: 'auth', error_code: 401});
  assert.match(card.error, /rejected the access token/);
  assert.equal(timers.size, 0); assert.equal(card._wsReady, false);
});

test('chunked queue responses are assembled before resolving', async () => {
  const {card, sockets} = setup(); await card._prepareMA(); card._connectMA(); authenticate(sockets[0]);
  const result = card._wsSend('player_queues/items');
  const id = sockets[0].sent.at(-1).message_id;
  sockets[0].receive({message_id: id, result: [{name: 'one'}], partial: true});
  assert.ok(card._wsPending[id]);
  sockets[0].receive({message_id: id, result: [{name: 'two'}], partial: false});
  assert.equal(JSON.stringify(await result), '[{"name":"one"},{"name":"two"}]');
});
