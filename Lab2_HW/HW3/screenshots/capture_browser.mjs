import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

const baseUrl = 'http://127.0.0.1:5173/'
const outputDirectory = new URL('./', import.meta.url)
let page = await fetch(`http://127.0.0.1:9223/json/new?${encodeURIComponent(baseUrl)}`, {
  method: 'PUT',
}).then((response) => response.json())
assert.ok(page, 'Could not create a headless browser page through CDP.')

const socket = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

let nextCommandId = 0
const pendingCommands = new Map()
const consoleErrors = []
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data)
  if (message.id !== undefined) {
    pendingCommands.get(message.id)?.(message)
    pendingCommands.delete(message.id)
  } else if (message.method === 'Runtime.exceptionThrown') {
    consoleErrors.push(message.params.exceptionDetails.text)
  } else if (
    message.method === 'Log.entryAdded' &&
    ['warning', 'error'].includes(message.params.entry.level)
  ) {
    consoleErrors.push(`${message.params.entry.level}: ${message.params.entry.text}`)
  }
})

function send(method, params = {}) {
  const id = ++nextCommandId
  return new Promise((resolve, reject) => {
    pendingCommands.set(id, (message) => {
      if (message.error) reject(new Error(message.error.message))
      else resolve(message.result)
    })
    socket.send(JSON.stringify({ id, method, params }))
  })
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
    userGesture: true,
  })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
  return result.result.value
}

async function waitFor(expression, expected, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const actual = await evaluate(expression)
    if (typeof expected === 'function' ? expected(actual) : actual === expected) return actual
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  const actual = await evaluate(expression)
  const location = await evaluate('window.location.href')
  const body = await evaluate('document.body?.innerText?.slice(0, 500)')
  throw new Error(`Timed out waiting for ${expression}; actual=${actual}; url=${location}; body=${body}`)
}

async function setViewport(width, height = 900) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await evaluate('window.scrollTo(0, 0)')
}

async function capture(filename) {
  await evaluate('window.scrollTo(0, 0)')
  const { cssContentSize } = await send('Page.getLayoutMetrics')
  const viewportWidth = await evaluate('window.innerWidth')
  const result = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: {
      x: 0,
      y: 0,
      width: Math.max(cssContentSize.width, viewportWidth),
      height: cssContentSize.height,
      scale: 1,
    },
  })
  await writeFile(new URL(filename, outputDirectory), Buffer.from(result.data, 'base64'))
}

await send('Page.enable')
await send('Runtime.enable')
await send('Log.enable')
await send('Page.navigate', { url: baseUrl })
await waitFor("document.querySelector('.flash-sale-countdown__status')?.textContent", 'Flash Sale kết thúc sau')
await setViewport(1280)

const countdownBefore = await evaluate("document.querySelector('.flash-sale-countdown__unit:last-child dd').textContent")
await new Promise((resolve) => setTimeout(resolve, 1200))
const countdownAfter = await evaluate("document.querySelector('.flash-sale-countdown__unit:last-child dd').textContent")
assert.notEqual(countdownAfter, countdownBefore, 'Countdown seconds did not update in the browser.')

const soldOutButton = await evaluate("[...document.querySelectorAll('.product-card')].find(card => card.textContent.includes('Đèn bàn LED đa chế độ'))?.querySelector('.buy-button')?.disabled")
assert.equal(soldOutButton, true, 'The sold-out product Buy Now button should be disabled.')

const originalDateNow = await evaluate('Date.now.toString()')
await evaluate('window.__realDateNow = Date.now; Date.now = () => window.__realDateNow() - 3600000')
await waitFor("document.querySelector('.flash-sale-countdown__status')?.textContent", 'Flash Sale bắt đầu sau')
const upcomingDisabled = await evaluate("[...document.querySelectorAll('.buy-button')].every(button => button.disabled)")
assert.equal(upcomingDisabled, true, 'Buy Now buttons should be disabled before the sale starts.')
await evaluate('Date.now = () => window.__realDateNow() + 21600000')
await waitFor("document.querySelector('.flash-sale-countdown__status')?.textContent", 'Flash Sale đã kết thúc')
const endedDisabled = await evaluate("[...document.querySelectorAll('.buy-button')].every(button => button.disabled)")
assert.equal(endedDisabled, true, 'Buy Now buttons should be disabled after the sale ends.')
await send('Page.reload', { ignoreCache: true })
await waitFor("document.querySelector('.flash-sale-countdown__status')?.textContent", 'Flash Sale kết thúc sau')
assert.ok(originalDateNow, 'Date.now should be available for timestamp-based countdown updates.')

await capture('01-flash-sale-ui.png')

await evaluate("document.querySelector('.buy-button:not(:disabled)')?.click()")
await waitFor("document.querySelector('[aria-live=polite]')?.textContent", (text) => text.includes('Giữ hàng thành công'))
await waitFor("document.querySelector('.reservation-panel code')?.textContent", (text) => text.startsWith('reservation-'))
await capture('02-reservation.png')

await evaluate("document.querySelector('[aria-label^=Checkout]')?.click()")
await waitFor("document.querySelector('[aria-live=polite]')?.textContent", (text) => text.includes('Checkout thành công'))
await capture('03-checkout.png')

await evaluate("document.querySelector('.buy-button:not(:disabled)')?.click()")
await waitFor("document.querySelector('[aria-live=polite]')?.textContent", (text) => text.includes('Giữ hàng thành công'))
await evaluate("document.querySelector('[aria-label^=Hủy]')?.click()")
await waitFor("document.querySelector('[aria-live=polite]')?.textContent", (text) => text.includes('đã bị hủy'))
await capture('04-cancellation.png')

await evaluate("document.querySelector('.buy-button:not(:disabled)')?.click()")
await waitFor("document.querySelector('[aria-live=polite]')?.textContent", (text) => text.includes('Giữ hàng thành công'))
await waitFor("document.querySelector('[aria-live=polite]')?.textContent", (text) => text.includes('Reservation hết hạn'), 35000)
await capture('05-expiration.png')

const responsiveResults = []
for (const width of [320, 375, 768, 1280]) {
  await setViewport(width)
  const result = await evaluate(`({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth })`)
  responsiveResults.push({ ...result, noHorizontalOverflow: result.scrollWidth <= result.width })
  assert.ok(result.scrollWidth <= result.width, `Horizontal overflow at ${width}px.`)
}
await setViewport(375)
await capture('07-responsive.png')

await setViewport(1280)
await evaluate('document.activeElement?.blur(); window.scrollTo(0, 0)')
await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
const keyboardResult = await evaluate("({ tag: document.activeElement?.tagName, focusVisible: document.activeElement?.matches(':focus-visible'), label: document.activeElement?.getAttribute('aria-label') })")
assert.equal(keyboardResult.focusVisible, true, 'Tab should focus an element with visible keyboard focus.')
let buyButtonFocused = await evaluate("document.activeElement?.matches('.buy-button')")
for (let tab = 0; tab < 12 && !buyButtonFocused; tab += 1) {
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
  buyButtonFocused = await evaluate("document.activeElement?.matches('.buy-button')")
}
assert.equal(buyButtonFocused, true, 'Tab navigation should reach an enabled Buy Now button.')
await send('Input.dispatchKeyEvent', {
  type: 'rawKeyDown',
  key: 'Enter',
  code: 'Enter',
  windowsVirtualKeyCode: 13,
  nativeVirtualKeyCode: 13,
})
await send('Input.dispatchKeyEvent', { type: 'char', key: 'Enter', text: '\r', unmodifiedText: '\r' })
await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
await waitFor("document.querySelector('[aria-live=polite]')?.textContent", (text) => text.includes('Giữ hàng thành công'))
assert.deepEqual(consoleErrors, [], `Browser reported console/runtime errors: ${consoleErrors.join('; ')}`)

console.log(JSON.stringify({
  browser: 'Microsoft Edge headless over Chrome DevTools Protocol',
  countdownUpdated: countdownBefore !== countdownAfter,
  soldOutDisabled: soldOutButton,
  upcomingBuyDisabled: upcomingDisabled,
  endedBuyDisabled: endedDisabled,
  checkoutAndCancellation: 'passed',
  expiration: 'passed after the real 30-second reservation TTL',
  responsiveResults,
  keyboardResult,
  keyboardBuy: 'Tab reached Buy Now; Enter submitted a reservation.',
  consoleErrors,
  screenshots: [
    '01-flash-sale-ui.png', '02-reservation.png', '03-checkout.png',
    '04-cancellation.png', '05-expiration.png', '07-responsive.png',
  ],
  stressScreenshot: 'not captured; no terminal screenshot facility is available in this environment',
}, null, 2))

await send('Browser.close').catch(() => {})
socket.close()
