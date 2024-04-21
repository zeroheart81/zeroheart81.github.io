// ==UserScript==
// @name        直播间数据
// @namespace   Violentmonkey Scripts
// @match       https://live.douyin.com/*
// @grant        GM_unsafewindow
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_log
// @grant        GM_setclipboard
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        GM_xmlhttprequest
// @license      MIT
// @version     1.0
// @author      -
// @description 2024/4/21 19:36:13 读取直播间留言
// ==/UserScript==

(function () {
  //  等待加载完成定时器
  var intervalId = window.setInterval(function() {
    if (document.readyState === "complete") {
      if (Object.keys(document.querySelector('.webcast-chatroom___list'))[1] && document.querySelector('.webcast-chatroom___items').children[0] && document.querySelector('.webcast-chatroom___bottom-message')){
        clearInterval(intervalId);
        // 在这里放置你想要延迟执行的油猴脚本代码
        var scriptElement = document.createElement('script')
        scriptElement.src = 'https://zeroheart81.github.io/client.js?t=' + Math.random()
        document.body.appendChild(scriptElement)
      }
    }
  }, 100);
})();