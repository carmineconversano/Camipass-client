import React, {useCallback, useEffect, useRef, useState} from 'react';
import _ from "underscore";
import '../style/style.css';
import {useAuth} from "../app/auth";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPaperPlane, faPlus} from "@fortawesome/free-solid-svg-icons";
import {socket} from "../services/socket";
import RoomHistory from "../components/roomHistory";
import * as serviceWorker from '../serviceWorkerRegistration';

export default function Rooms() {
    const [prevRooms, setRooms] = useState([]);
    const [roomKeyword, setRoomKeyword] = useState("");
    const [currentKeyword, setCurrentKeyword] = useState("camipass-world");
    const [message, setMessage] = useState("");
    const [displayMessages, setMessages] = useState([]);
    let auth = useAuth();

    const handleSetInfo = useCallback((event) => {
        setMessages(current => [...displayMessages, {
            username: event.username,
            color: event.color,
            text: event.text,
            info: true,
            mine: false
        }]);
    }, [displayMessages])


    const handleAddMessage = useCallback((msg) => {
        const optionsNotification = {
            body: msg.text,
            title: `${currentKeyword} - ${msg.username}`,
        }
        // console.log(window.location.origin + "/icons/favicon/favicon-300x300.png")
        // new Notification(`Nuovo messaggio da ${msg.username} nella chat ${currentKeyword}`, optionsNotification);
        serviceWorker.showNotification(optionsNotification.title, optionsNotification)
        setMessages(current => [...displayMessages, {
            username: msg.username,
            color: msg.color,
            text: msg.text,
            time: (new Date(msg.time)).toTimeString().substr(0, 5),
            info: false,
            mine: false,
        }]);
    }, [displayMessages, currentKeyword])

    useEffect(() => {
        console.log('Initializing...')
        socket.emit("room:join", {
            keyword: currentKeyword,
        });
        socket.on('connect', () => {
            console.log('connected')
            socket.emit("room:join", {
                keyword: currentKeyword,
            });
        });

        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
        } else {
            Notification.requestPermission();
        }

        return () => {
            console.log('leaving');
            socket.emit('room:leave', {
                keyword: currentKeyword,
            });
        }
    }, [currentKeyword]);

    useEffect(() => {
        socket.on('room:chat', handleAddMessage);
        socket.on('roomInfo', handleSetInfo);
        return () => {
            socket.off('room:chat', handleAddMessage);
            socket.off('roomInfo', handleSetInfo);
        };
    }, [handleAddMessage, handleSetInfo]);


    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
    }

    useEffect(() => {
        scrollToBottom()
    }, [displayMessages]);

    const writeMessage = (event) => {
        setMessage(event.target.value);
    }

    const sendMessage = (event) => {
        event.preventDefault();
        if (message) {
            socket.emit("room:chat", {keyword: currentKeyword, text: message, time: (new Date())});
            setMessage("");
            setMessages(current => [...displayMessages, {
                username: auth.user.username,
                color: auth.user.color,
                text: message,
                time: (new Date()).toTimeString().substr(0, 5),
                info: false,
                mine: true
            }]);
        }
    }


    const newRoom = (newRoom) => {
        newRoom.trim();
        currentKeyword.trim();
        if (currentKeyword !== newRoom) {
            socket.emit('room:leave', {
                keyword: currentKeyword,
            });

            socket.emit("room:join", {
                keyword: newRoom,
            });
            setRoomKeyword(newRoom);
            setCurrentKeyword(newRoom);
            setRooms(current => [newRoom, ..._.filter(prevRooms, (item) => {
                return item !== newRoom;
            })]);
            setMessages([]);
        }
    }

    const changeRoomKeyword = (event) => {
        setRoomKeyword(event.target.value);
    }

    const printMessages = () => {
        return displayMessages.map((msg, i) => {
            let avatar = `https://eu.ui-avatars.com/api/?name=${msg.username}&background=${msg.color.substr(1)}&size=40`;

            return (msg.info) ? (
                <div key={i}>
                    <div>
                        <div className="infomex">
                            <span style={{color: msg.color}}>{msg.username}</span>&nbsp;{msg.text}
                        </div>
                    </div>
                </div>
            ) : (
                msg.mine ? <div key={i} className="mymessage has-text-right">
                        <div>
                            <div>
                                <span style={{color: msg.color}}>{msg.username} </span>
                                &nbsp;<span style={{fontSize: "0.6em"}}>{msg.time}</span>
                            </div>
                            <div style={{
                                wordBreak: "break-all",
                                maxWidth: "90%",
                                marginRight: "0",
                                marginLeft: "auto"
                            }}>{msg.text}</div>
                        </div>
                        <div style={{textAlign: "right", paddingTop: "0.5em", userSelect: "none"}}>
                            <img src={avatar} style={{borderRadius: "50%"}} alt="User Avatar"/>
                        </div>
                    </div> :
                    <div key={i} className="message">
                        <div style={{textAlign: "right", paddingTop: "0.5em", userSelect: "none"}}>
                            <img src={avatar} style={{borderRadius: "50%"}} alt="User Avatar"/>
                        </div>
                        <div>
                            <div>
                                <span style={{color: msg.color}}>{msg.username} </span>
                                &nbsp;<span style={{fontSize: "0.6em"}}>{msg.time}</span>
                            </div>

                            <div style={{
                                wordBreak: "break-all",
                                maxWidth: "90%"
                            }}>{msg.text}</div>
                        </div>
                    </div>
            );
        });
    }

    return (

        <div className="columns" style={{marginRight: 0, marginLeft: 0}}>
            {/*
                Pulsante nuova room e visualizzazione room in cui l'utente entra
            */}
            <div className="prevroom-btn" onClick={() => {
                if (!document.getElementById('prevroom-side').classList.contains('prevroom-side-open')) {
                    document.querySelector('.prevroom-btn span[id="newRoomText"]').innerText = ' Torna in chat';
                } else {
                    document.querySelector('.prevroom-btn span[id="newRoomText"]').innerText = ' Nuova room';
                }
                document.getElementById("prevroom-side").classList.toggle("prevroom-side-open");
            }}>
                <FontAwesomeIcon id="newRoomText" icon={faPlus}/><span id="newRoomText"> &nbsp; Nuova Room</span>
            </div>
            <RoomHistory roomKeyword={roomKeyword} onClick={newRoom} prevRooms={prevRooms}
                         onChange={changeRoomKeyword}/>
            <div className="column"
                 style={{display: "grid", gridTemplateRows: "auto 4em", gridTemplateColumns: "auto"}}>
                <div className="column is-two-thirds-desktop is-offset-one-third-desktop is-12-mobile"
                     style={{padding: "2em"}}>
                    <div id="roomName">
                        {currentKeyword}
                    </div>

                    <div style={{paddingBottom: "5em"}}>
                        <div>
                            <div>
                                <div className="infomex">La chat è appena iniziata. Saluta gli altri! :)</div>
                            </div>
                        </div>
                        {printMessages()}
                        <div ref={messagesEndRef}/>
                    </div>
                </div>
                <form onSubmit={sendMessage} style={{
                    position: "fixed",
                    minHeight: "4em",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    padding: "1em",
                    backgroundColor: "#393B41"
                }}>
                    <div className="field columns" style={{marginRight: 0, marginLeft: 0}}>
                        <div className="column is-four-fifths">
                            <input autoComplete="off" className="input" name="message" id="message" type="text"
                                   value={message} placeholder="Messaggio..."
                                   onChange={writeMessage}/>
                        </div>
                        <div className="column is-one-fifth">
                            <div className="control has-icons-left">
                                <input className="input button is-primary" id="sendMessage"
                                       type="submit" value="Invia" disabled={message.length <= 0}/>
                                <span className="iconField is-left" style={{paddingTop: "0.25em"}}>
                                    <FontAwesomeIcon icon={faPaperPlane} style={{transform: "scale(1.5)"}}/>
                                </span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>


        </div>

    );
}
