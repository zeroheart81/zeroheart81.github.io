// 测试
// window.onDouyinServer = function() {
//     new Barrage({ message: false })
// }

const Barrage = class {
    wsurl = "ws://127.0.0.1:9527"
    timer = null
    timeinterval = 3 * 1000 // 断线重连轮询间隔
    propsId = null
    chatDom = null
    gifteffect = null   //  坐下角礼物
    roomJoinDom = null
    ws = null
    observer = null
    chatObserverrom = null
    option = {}
    event = {}
    eventRegirst = {}
    inited = false
    removePlayr = false
    removeGift = true
    constructor(option = { message: true, join: true }) {
        this.option = option
        let { link, removePlay } = option
        if (link) {
            this.wsurl = link
        }
        if (this.removePlayr) {
            document.querySelector('.basicPlayer').remove()
            console.log(`[${new Date().toLocaleTimeString()}]`, '屏蔽播放窗！')
        }
        if (this.removeGift) {
            this.removeGiftList()
        }
        this.propsId = Object.keys(document.querySelector('.webcast-chatroom___list'))[1]
        this.chatDom = document.querySelector('.webcast-chatroom___items').children[0]
        this.roomJoinDom = document.querySelector('.webcast-chatroom___bottom-message')
        this.gifteffect = document.querySelectorAll('.ljM5iqdR')
        this.reConnect()
    }

    // 消息事件 , join, message
    on(e, cb) {
        this.eventRegirst[e] = true
        this.event[e] = cb
    }
    openWs() {
        if (this.ws.readyState === 1) {
            console.log(`[${new Date().toLocaleTimeString()}]`, '服务已经连接成功!')
        }
    }
    wsClose() {
        console.log('服务器断开...')
    }

    reConnect() {
        console.log('正在等待服务器启动...')
        this.timer = setInterval(() => {
            if (this.ws) {
                if (this.ws.readyState == 1) {
                    return
                }

            }
            this.ws = new WebSocket(this.wsurl)
            console.log('状态 ->', this.ws.readyState)
            setTimeout(() => {
                if (this.ws.readyState === 1) {
                    console.log(`[${new Date().toLocaleTimeString()}]`, '服务重新连接成功!')

                    //  初始化
                    if (!this.inited) {
                        console.log(`[${new Date().toLocaleTimeString()}]`, '初始化！')
                        this.inited = true
                        this.runServer()
                        this.ws.onclose = this.wsClose
                        this.ws.onopen = () => {
                            this.openWs()
                        }
                    }
                }
            }, 2000)

        }, this.timeinterval)
    }

    runServer() {
        let _this = this
        if (this.option.join) {
            this.observer = new MutationObserver((mutationsList) => {
                for (let mutation of mutationsList) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length) {
                        let message = this.messageParse(mutation.addedNodes[0])
                        if (message) {
                            if (_this.option.message === false && !message.isGift) {
                                alert('異常信息 return')
                                return
                            }
                            if (this.ws.readyState === 1) {
                                this.ws.send(JSON.stringify(message));
                            }
                        }
                    }
                }
            });
            this.observer.observe(this.roomJoinDom, { childList: true });

        }

        this.chatObserverrom = new MutationObserver((mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    let message = this.messageParse(mutation.addedNodes[0])
                    if (message) {
                        if (_this.option.message === false && !message.isGift) {
                            alert('異常信息 return')
                            return
                        }
                        if (this.ws.readyState === 1) {
                            this.ws.send(JSON.stringify(message));
                        }
                    }
                } else {
                    if (mutation.removedNodes.length) {
                        //console.log('删除一条信息')
                    }
                }
            }
        });
        this.chatObserverrom.observe(this.chatDom, { childList: true });

        if (this.gifteffect && this.gifteffect.length > 0) {
            for (let item of this.gifteffect) {
                let gifteffectsbserver = new MutationObserver((mutationsList) => {
                    for (let mutation of mutationsList) {
                        if (mutation.type === 'childList' && mutation.addedNodes.length) {
                            let dom = mutation.addedNodes[0]
                            for (let node of dom[this.propsId].childNodes){
                                let giftuserimage = ndoe.childNodes[0]     //  头像
                                let giftusername = node.childNodes[1]   //  送礼用户名
                                let giftimageurl= node.childNodes[1]//    礼物图片
                            }
                        }
                    }
                });
                gifteffectsbserver.observe(item, { childList: true });
            }
        }
    }
    getUser(user) {
        if (!user) {
            return
        }
        let msg = {
            user_id: user.id,
            user_nickName: user.nickname,
            user_avatar: user.avatar_thumb.url_list[0],
            user_gender: user.gender === 1 ? 'M' : 'F',
            user_isAdmin: user.user_attr.is_admin,
            user_badgelevel: 0,
            //user_badgelevelImage: '',
            user_fansLightName: '',
            user_fansLevel: 0,
            //user_fansLevelImage: '',
        }

        let arr = user.badge_image_list
        if (arr && arr.length > 0) {
            //  荣誉等级
            let item = arr.find(i => {
                return i.image_type === 1
            })
            if (item) {
                msg.user_badgelevel = parseInt(item.content.level)
            }
            //  粉丝等级
            item = arr.find(i => {
                return i.image_type === 7
            })
            if (item) {
                msg.user_fansLevel = parseInt(item.content.level)
                msg.user_fansLightName = item.content.name
            }
        }
        return msg
    }

    messageParse(dom) {
        if (!dom[this.propsId].children.props.message) {
            return null
        }
        let msg = dom[this.propsId].children.props.message.payload
        let result = {
            method: msg.common.method,
            user_nickName: 'Undefind',
        }

        result = Object.assign(result, this.getUser(msg.user))
        switch (msg.common.method) {
            case 'WebcastGiftMessage':
                //console.log(msg)
                result = Object.assign(result, {
                    //gift_repeatCount: parseInt(), //  数量？
                    msg_content: msg.common.describe,
                    gift_id: msg.gift.id,       //  禮物ID
                    gift_name: msg.gift.name,   //  禮物名稱
                    gift_comboCount: parseInt(msg.combo_count),
                    gift_repeatCount: parseInt(msg.repeat_count),
                    gift_image: msg.gift.icon.url_list[0],
                    gift_diamondCount: msg.gift.diamond_count,
                    gift_describe: msg.gift.describe,
                })
                if (result.gift_comboCount > 30 || result.gift_repeatCount > 30) {
                    console.log('超级礼物！！！')
                }
                break
            case 'WebcastChatMessage':
                result = Object.assign(result, {
                    msg_content: msg.content
                })
                break
            case 'WebcastMemberMessage':
                result = Object.assign(result, {
                    //  xx來了
                    msg_content: '来了'
                })
                break
            case 'WebcastLikeMessage':
                result = Object.assign(result, {
                    //  給主播點贊
                    msg_content: '为主播点赞'
                })
                break
            case 'WebcastRoomMessage':
                result.user_nickName = msg.common.display_text.pieces[0].user_value.user.nickname
                result = Object.assign(result, {
                    //  分享直播間
                    msg_content: '分享了直播间'
                })
                break
            case 'WebcastFansclubMessage':
                result = Object.assign(result, {
                    //  加入粉絲團
                    msg_content: msg.content
                })
                break
            default:
                result = Object.assign(result, {
                    msg_content: msg.content
                })
                break
        }
        return result
    }
    removeGiftList() {
        setTimeout(() => {
            if (document.querySelector('div[data-e2e="gifts-container"]')) {
                document.querySelector('div[data-e2e="gifts-container"]').remove()
                if (document.querySelector('div[data-e2e="gifts-container"]')) {
                    this.removeGiftList()
                } else {
                    console.log('[${new Date().toLocaleTimeString()}]', '屏蔽禮品籃')
                }
            }
        }, 2000)
    }
}

if (window.onDouyinServer) {
    window.onDouyinServer()
}

window.removeVideoLayer = function () {
    document.querySelector('.basicPlayer').remove()
    console.log('删除画面成功,不影响弹幕信息接收')
}
